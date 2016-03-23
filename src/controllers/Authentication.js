
var winston = require('winston'),
    async = require('async'),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    Validator = require('../utils/Validator'),
    Sanitation = require('../utils/Sanitation'),
    Password = require('../utils/Password'),
    Generator = require('../utils/Generator');

function Authentication(routes) {
  this.routes = routes;

  this.game = app.game;
  this.model = app.model;
  this.server = app.server;

  this.stripe = routes.stripe;

  // queue must be used to
  // prevent duplication
  this.queue = async.queue(function(model, callback) {
    model.save(callback);
  }, 1);
 
  this.password = new Password();
  this.passport = new LocalStrategy({ passReqToCallback: true }, this.localLogin.bind(this));
};

Authentication.prototype.constructor = Authentication;

Authentication.prototype.init = function() {
  var self = this;

  this.routes.express.use(passport.initialize());
  this.routes.express.use(passport.session());

  passport.use(this.passport);

  // create guest user
  this.routes.play.get('/', function(req, res, next) {
    if(!req.session.user) {
      var name = Generator.getUsername(),
          username = Generator.getGuest(),
          guest = new self.model.User({ name: name, username: username });
      req.session.user = guest.toStreamObject();
      req.session.save(function() {
        next();
      });
    } else {
      next();
    }
  });

  // monitor socket disconnect
  this.routes.io.on('connection', function(socket) {
    self.game.emit('auth/login', socket.handshake.session.user);
    socket.on('disconnect', function() {
      winston.info('[Authentication] Socket ' + socket.handshake.session.socket + ' closed');
      self.game.emit('auth/logout', socket.handshake.session.user);
    });
  });

  // send socket the session user
  this.routes.iorouter.on('user', function(sockets, args, next) {
    var sock = sockets.sock,
        session = sock.handshake.session;
    sock.handshake.session.reload(function() {
      sockets.emit('user', {
        user: sockets.sock.handshake.session.user
      });
    });
  });
};

Authentication.prototype.register = function(req, res, next) {
  var self = this, user,
      uid, userData = {};

  // copy data
  for(var key in req.body) {
    if(req.body.hasOwnProperty(key)) {
      userData[key] = req.body[key];
    }
  }

  // create new user
  user = new this.model.User({
    name: userData.username,
    username: userData.username,
    email: userData.email,
    password: userData.password,
    role: 'user'
  });

  async.waterfall([
    function(next) {
      user.sanitize();
      user.isValid(function(valid) {
        if(valid) {
          next(null, user);
        } else {
          next({
            message: '[[error:invalid-user]]',
            data: user.errors
          });
        }
      });
    },
    function(user, next) {
      self.queue.push(user, next);
    }
  ], function(err, user) {
    if(err) { return next(err); }
    res.json({
      info: null,
      user: user.toStreamObject()
    });
  });
};

Authentication.prototype.login = function(req, res, next) {
  var self = this;
  passport.authenticate('local', function(err, userData, info) {
    if(err) { return next(err); }
    if(!userData) {
      return next(new Error('[[error:no-credentials]]'));
    }
    self.model.Stripe.findOne({ where: { email: userData.email }}, function(err, stripe) {
      if(err) { return next(err); }

      if(stripe) {
        userData.edition = stripe.edition;
      } else {
        userData.edition = 'recruit';
      }

      // notify game
      self.game.emit('auth/logout', req.session.user);
      self.game.emit('auth/login', userData);

      // store session
      // serve response
      req.session.user = userData;
      req.session.save(function() {
        res.json({
          info: info,
          user: userData
        });
      });
    });
  })(req, res, next);
};

Authentication.prototype.localLogin = function(req, username, password, next) {
  if(!username || !password) { return next(new Error('[[error:invalid-credentials]]')); }

  var self = this, userData = {},
      userslug = Sanitation.slugify(username),
      ip = Sanitation.ip(req.ip);

  async.waterfall([
    // function(next) {
    //   self.user.logAttempt(ip, next);
    // },
    function(next) {
      if(username && Validator.isEmailValid(username)) {
        self.model.User.findOne({ where: { email: username }}, next);
      } else if(userslug) {
        self.model.User.findOne({ where: { userslug: userslug }}, next);
      } else {
        return next(new Error('[[error:invalid-credentials]]'));
      }
    },
    function(data, next) {
      if(!data) { return next(new Error('[[error:invalid-credentials]]')); }
      if(!data.password) {
        return next(new Error('[[error:unknown-error]]'));
      }
      if(data.banned) {
        return next(new Error('[[error:user-banned]]'));
      }
      self.password.compare(password, data.password, function(err, match) {
        if(err) { return next(new Error('[[error:unknown-error]]')); }
        if(!match) { return next(new Error('[[error:invalid-credentials]]')); }
        next(null, data.toStreamObject(), '[[success:authentication-complete]]');
      });
    }
  ], next);
};

Authentication.prototype.logout = function(req, res, next) {
  var uid, self = this,
      session = req.session;
  if(session.user && session.user.role !== 'guest') {
    this.server.sessionStore.destroy(req.sessionID, function(err) {
      if(err) { return next(err); }    

      // notify game
      self.game.emit('auth/logout', session.user);    
      
      // logout
      req.logout();
      res.json({ info: 'success' });
    });
  } else {
    return next(new Error('[[error:not-logged-in]]'));
  }
};

module.exports = Authentication;