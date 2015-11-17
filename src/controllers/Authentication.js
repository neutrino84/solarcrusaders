
var winston = require('winston'),
    async = require('async'),
    nconf = require('nconf'),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    Validator = require('../utils/Validator'),
    Sanitation = require('../utils/Sanitation'),
    Password = require('../utils/Password');

function Authentication(routes) {
  this.routes = routes;

  this.game = app.game;
  this.user = app.model.user;
  this.server = global.app.server;

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
  this.routes.express.get('/', function(req, res, next) {
    if(!req.session.user) {
      var guest = self.user.createDefaultData();
          guest.uid = 0;
      req.session.user = guest;
      req.session.save();
    }
    next();
  });

  // monitor socket disconnect
  this.routes.io.on('connection', function(socket) {
    self.game.emit('auth/login', socket.handshake.session.user);
    socket.on('disconnect', function() {
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
  var self = this,
      uid, userData = {};

  // copy data
  for(var key in req.body) {
    if(req.body.hasOwnProperty(key)) {
      userData[key] = req.body[key];
    }
  }

  async.waterfall([
    function(next) {
      self.user.create(userData, next);
    }
  ], function(err, userData) {
    if(err) { return next(err); }
    res.json({
      info: null,
      user: userData
    });
  });
};

Authentication.prototype.login = function(req, res, next) {
  return next(new Error('[[error:server-locked]]'));
  
  var self = this;
  passport.authenticate('local', function(err, userData, info) {
    if(err) { return next(err); }
    if(!userData) {
      return next(new Error('[[error:no-credentials]]'));
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
  })(req, res, next);
};

Authentication.prototype.localLogin = function(req, username, password, next) {
  if(!username || !password) { return next(new Error('[[error:invalid-credentials]]')); }

  var self = this, userData = {},
      userslug = Sanitation.slugify(username),
      ip = Sanitation.ip(req.ip);

  async.waterfall([
    function(next) {
      self.user.logAttempt(ip, next);
    },
    function(next) {
      if(username && Validator.isEmailValid(username)) {
        self.user.getUidByEmail(username, next);
      } else if(userslug) {
        self.user.getUidByUserslug(userslug, next);
      } else {
        return next(new Error('[[error:invalid-credentials]]'));
      }
    },
    function(uid, next) {
      if(!uid) { return next(new Error('[[error:invalid-credentials]]')); }
      self.user.getAuthCredentials(uid, next);
    },
    function(result, next) {
      if(!result || !result.password) {
        return next(new Error('[[error:unknown-error]]'));
      }
      if(result.banned && parseInt(result.banned, 10) === 1) {
        return next(new Error('[[error:user-banned]]'));
      }
      self.password.compare(password, result.password, function(err, match) {
        if(err) { return next(new Error('[[error:unknown-error]]')); }
        if(!match) { return next(new Error('[[error:invalid-credentials]]')); }
        next(null, result.uid);
      });
    },
    function(uid, next) {
      self.user.getUserData(uid, function(err, data) {
        next(null, data, '[[success:authentication-complete]]');
      });
    }
  ], next);
};

Authentication.prototype.logout = function(req, res, next) {
  var uid, self = this,
      session = req.session;
  if(session.user) {
    uid = parseInt(session.user.uid, 10);
    if(uid > 0) {
      this.server.sessionStore.destroy(req.sessionID, function(err) {
        if(err) { return next(err); }    

        // notify game
        self.game.emit('auth/logout', session.user);    
        
        // logout
        req.logout();
        res.json({ info: 'success' });
      });
    }
  } else {
    return next(new Error('[[error:not-logged-in]]'));
  }
};

module.exports = Authentication;