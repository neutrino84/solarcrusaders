
var async = require('async');
  // db = require('../database'),
  // meta = require('../meta'),
  // events = require('../events');

module.exports = function(User) {

  User.prototype.getAuthCredentials = function(uid, callback) {
    var key = 'user:' + uid,
        fields = ['uid', 'password', 'banned', 'passwordExpiry'];
    this.database.getObjectFields(key, fields, callback);
  };

  User.prototype.existsEmail = function(email, callback) {
    this.database.isSortedSetMember('email:uid', email.toLowerCase(), callback);
  };

  User.prototype.existsUsername = function(usersslug, callback) {
    this.database.isSortedSetMember('userslug:uid', usersslug, callback);
  };

  User.prototype.logAttempt = function(uid, ip, callback) {
    var self = this,
        database = this.database;
    this.database.exists('lockout:' + uid, function(err, exists) {
      if(err) {
        return callback(err);
      }

      if(exists) {
        return callback(new Error('[[error:account-locked]]'));
      }

      database.increment('loginAttempts:' + uid, function(err, attempts) {
        if(err) {
          return callback(err);
        }

        if((meta.config.loginAttempts || 5) < attempts) {
          // Lock out the account
          db.set('lockout:' + uid, '', function(err) {
            if(err) {
              return callback(err);
            }
            var duration = 1000 * 60 * (meta.config.lockoutDuration || 60);

            db.delete('loginAttempts:' + uid);
            db.pexpire('lockout:' + uid, duration);
            events.log({
              type: 'account-locked',
              uid: uid,
              ip: ip
            });
            callback(new Error('[[error:account-locked]]'));
          });
        } else {
          db.pexpire('loginAttempts:' + uid, 1000 * 60 * 60);
          callback();
        }
      });
    });
  };

  User.prototype.clearLoginAttempts = function(uid) {
    db.delete('loginAttempts:' + uid);
  };

  User.prototype.resetLockout = function(uid, callback) {
    async.parallel([
      async.apply(db.delete, 'loginAttempts:' + uid),
      async.apply(db.delete, 'lockout:' + uid)
    ], callback);
  };
};