
var winston = require('winston'),
    async = require('async'),
    nconf = require('nconf'),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    User = require('../objects/user'),
    Validator = require('../utils/Validator'),
    Sanitation = require('../utils/Sanitation'),
    Password = require('../utils/Password');

function Authentication() {
  this.user = new User();
  this.password = new Password();
  this.passport = new LocalStrategy({ passReqToCallback: true }, this.localLogin.bind(this));
  this.config = global.app.configuration.settings;
  this.database = global.app.database;

  passport.use(this.passport);
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
      userslug = Sanitation.slugify(username);

  async.waterfall([
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
      // user.auth.logAttempt(uid, req.ip, next);
      self.user.getAuthCredentials(uid, next);
    },
    function(result, next) {
      if(!result || !result.password) {
        return next(new Error('[[error:invalid-user-data]]'));
      }
      if(result.banned && parseInt(result.banned, 10) === 1) {
        return next(new Error('[[error:user-banned]]'));
      }
      self.password.compare(password, result.password, function(err, match) {
        if(err) { return next(new Error('[[error:crypto-error]]')); }
        if(!match) {
          return next(new Error('[[error:invalid-credentials]]'));
        }
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