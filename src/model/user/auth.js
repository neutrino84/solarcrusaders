
var async = require('async');

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

  User.prototype.logAttempt = function(ip, callback) {
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
  
};