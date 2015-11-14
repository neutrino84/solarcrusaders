
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

  this.user = app.model.user;

  this.password = new Password();
  this.passport = new LocalStrategy({ passReqToCallback: true }, this.localLogin.bind(this));
  this.config = global.app.configuration.settings;
  this.database = global.app.database;

  passport.use(this.passport);

  // create guest user
  var self = this;
  this.routes.express.get('/', function(req, res, next) {
    if(!req.session.user) {
      var guest = self.user.createDefaultData();
          guest.uid = 0;
      req.session.user = guest;
    }
    next();
  });
};

Authentication.prototype.constructor = Authentication;

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
  passport.authenticate('local', function(err, userData, info) {
    if(err) { return next(err); }
    if(!userData) {
      return next(new Error('[[error:no-credentials]]'));
    }

    // store session
    req.session.user = userData;
    
    // serve response
    res.json({
      info: info,
      user: userData
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
      self.logAttempt(ip, next);
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

Authentication.prototype.logAttempt = function(ip, callback) {
  var self = this,
      database = this.database,
      duration = 1000 * 60 * (self.config.lockoutDuration || 60);
  database.exists('lockout:' + ip, function(err, exists) {
    if(err) { return callback(err); }
    if(exists) { return callback(new Error('[[error:ip-locked]]')); }

    database.increment('attempts:' + ip, function(err, attempts) {
      if(err) { return callback(err); }

      if((self.config.maxLoginAttempts || 5) < attempts) {
        // Lock out the account
        database.set('lockout:' + ip, '', function(err) {
          if(err) { return callback(err); }

          database.delete('attempts:' + ip);            
          database.pexpire('lockout:' + ip, duration);
          
          callback(new Error('[[error:ip-locked]]'));
        });
      } else {
        database.pexpire('attempts:' + ip, duration);
        callback();
      }
    });
  });
};

Authentication.prototype.logout = function(req, res, next) {
  var uid, session = req.session;
  if(session.user) {
    uid = parseInt(session.user.uid, 10);
    if(uid > 0) {
      this.database.sessionStore.destroy(req.sessionID, function(err) {
        if(err) { return next(err); }        
        req.logout();
        res.json({ info: 'success' });
      });
    }
  } else {
    return next(new Error('[[error:not-logged-in]]'));
  }
};

module.exports = Authentication;