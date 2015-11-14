
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
  
};