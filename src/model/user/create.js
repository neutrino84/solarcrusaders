
var uuid = require('uuid'),
    async = require('async'),
    validator = require('validator'),
    Sanitation = require('../../utils/Sanitation'),
    Validator = require('../../utils/Validator'),
    Password = require('../../utils/Password'),
    Utils = require('../../utils');
    // groups = require('../groups'),
    // notifications = require('../notification');

module.exports = function(User) {
  User.DefaultData = {
    // 'picture': gravatar,
    // 'gravatarpicture': gravatar,
    'name': '',
    'type': 'user',
    'reputation': 0,
    'banned': 0,
    'status': 'online',
    'consistent': 0
  }; 

  User.prototype.createDefaultData = function() {
    var userData = Utils.extend({}, User.DefaultData);
        userData.joindate = global.Date.now();
        userData.uuid = uuid.v4();
    return userData;
  };

  User.prototype.create = function(data, callback) {
    // var gravatar = User.createGravatarURLFromEmail(data.email);
    var userData = this.createDefaultData();

    async.waterfall([
      function(next) {
        if(data.username) {
          userData.username = validator.escape(data.username.trim());
          userData.userslug = Sanitation.slugify(userData.username);
        }
        if(data.email) {
          userData.email = validator.escape(data.email.trim());
        }
        next(null, data.password, userData);
      },
      this.validate.bind(this),
      this.persist.bind(this)
    ], callback);
  };

  User.prototype.validate = function(password, userData, callback) {
    var self = this;
    async.waterfall([
      function(next) {
        // check email
        if(!userData.email || !Validator.isEmailValid(userData.email)) {
          return next(new Error('[[error:invalid-email]]'));
        }

        // check username
        if(!Validator.isUsernameValid(userData.username)) {
          return next(new Error('[[error:invalid-username]]'));
        }
        if(userData.username.length < self.config.minimumUsernameLength) {
          return next(new Error('[[error:username-too-short]]'));
        }
        if(userData.username.length > self.config.maximumUsernameLength) {
          return next(new Error('[[error:username-too-long'));
        }

        // check password
        if(!password) {
          return next(new Error('[[error:invalid-password]]'));
        }
        if(password.length < self.config.minimumPasswordLength) {
          return next(new Error('[[error:password-too-short]]'));
        }
        if(password.length > self.config.maximumPasswordLength) {
          return next(new Error('[[error:password-too-long]]'));
        }

        // continue
        next(null);
      },
      function(next) {
        // check if email exists
        self.existsEmail(userData.email, function(err, exists) {
          if(!exists) {
            next(null);
          } else {
            next(new Error('[[error:email-exists]]'));
          }
        });
      },
      function(next) {
        // check if username exists
        self.existsUsername(userData.userslug, function(err, exists) {
          if(!exists) {
            next(null, password, userData);
          } else {
            next(new Error('[[error:username-exists]]'));
          }
        });
      }
    ], callback);
  };

  User.prototype.persist = function(password, userData, callback) {
    var self = this;
    async.waterfall([
      function(next) {
        self.database.incrObjectField('global', 'nextUid', next);
      },
      function(uid, next) {
        userData.uid = uid;
        self.database.setObject('user:' + uid, userData, next);
      },
      function(next) {
        async.parallel([
          function(next) {
            self.database.sortedSetAdd('email:uid', userData.uid, userData.email.toLowerCase(), next);
          },
          function(next) {
            self.database.sortedSetAdd('email:sorted', 0, userData.email.toLowerCase() + ':' + userData.uid, next);
          },
          function(next) {
            self.database.sortedSetAdd('username:uid', userData.uid, userData.username, next);
          },
          function(next) {
            self.database.sortedSetAdd('username:sorted', 0, userData.username.toLowerCase() + ':' + userData.uid, next);
          },
          function(next) {
            self.database.sortedSetAdd('userslug:uid', userData.uid, userData.userslug, next);
          },
          function(next) {
            self.database.sortedSetAdd('users:joindate', userData.joindate, userData.uid, next);
          },
          function(next) {
            self.database.sortedSetsAdd(['users:reputation'], 0, userData.uid, next);
          },
          // function(next) {
          //   groups.join('registered-users', userData.uid, next);
          // },
          function(next) {
            if(parseInt(self.config.requireEmailConfirmation, 10) === 1) {
              // User.email.sendValidationEmail(userData.uid, userData.email);
            }
            next();
          },
          function(next) {
            var p = new Password();
                p.hash(null, password, function(err, hashed) {
                  if(err) { return next(err); }
                  self.setUserField(userData.uid, 'password', hashed, next);
                });
          }
        ], next);
      },
      function(results, next) {
        self.setUserField(userData.uid, 'consistent', 1, function(err) {
          if(err) { return next(err); }
          next(null, userData);
        });
      }
    ], callback);
  };
};
