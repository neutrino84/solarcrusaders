
var validator = require('validator'),
    nconf = require('nconf'),
    winston = require('winston');

module.exports = function(User) {

  User.prototype.getUserField = function(uid, field, callback) {
    this.getUserFields(uid, [field], function(err, user) {
      callback(err, user ? user[field] : null);
    });
  };

  User.prototype.getUserFields = function(uid, fields, callback) {
    this.getUsersFields([uid], fields, function(err, users) {
      callback(err, users ? users[0] : null);
    });
  };

  User.prototype.getUsersFields = function(uids, fields, callback) {
    var fieldsToRemove = [];
    function addField(field) {
      if(fields.indexOf(field) === -1) {
        fields.push(field);
        fieldsToRemove.push(field);
      }
    }

    if(!Array.isArray(uids) || !uids.length) {
      return callback(null, []);
    }

    var keys = uids.map(function(uid) {
      return 'user:' + uid;
    });

    if(fields.indexOf('uid') === -1) {
      fields.push('uid');
    }

    if(fields.indexOf('picture') !== -1) {
      addField('email');
      addField('gravatarpicture');
      addField('uploadedpicture');
    }

    this.database.getObjectsFields(keys, fields, function(err, users) {
      if(err) { return callback(err); }
      callback(null, modifyUserData(users, fieldsToRemove));
    });
  };

  User.prototype.getUserData = function(uid, callback) {
    this.getUsersData([uid], function(err, users) {
      callback(err, users ? users[0] : null);
    });
  };

  User.prototype.getUsersData = function(uids, callback) {
    if(!Array.isArray(uids) || !uids.length) {
      return callback(null, []);
    }

    var keys = uids.map(function(uid) {
      return 'user:' + uid;
    });

    this.database.getObjects(keys, function(err, users) {
      if(err) { return callback(err); }
      callback(null, modifyUserData(users, []));
    });
  };

  function modifyUserData(users, fieldsToRemove) {
    users.forEach(function(user) {
      if(!user) { return; }
      
      if(user.username) {
        user.username = validator.escape(user.username);
      }

      if(user.password) {
        user.password = undefined;
      }

      if(!parseInt(user.uid, 10)) {
        user.uid = 0;
        user.username = '[[global:guest]]';
        user.userslug = '';
        // user.picture = User.createGravatarURLFromEmail('');
      }

      // if(user.picture) {
      //   if(user.picture === user.uploadedpicture) {
      //     user.picture = user.uploadedpicture = user.picture.startsWith('http') ? user.picture : nconf.get('relative_path') + user.picture;
      //   } else {
      //     user.picture = User.createGravatarURLFromEmail(user.email);
      //   }
      // }

      for(var i=0; i<fieldsToRemove.length; ++i) {
        user[fieldsToRemove[i]] = undefined;
      }
    });
    return users;
  }

  User.prototype.setUserField = function(uid, field, value, callback) {
    callback = callback || function() {};
    this.database.setObjectField('user:' + uid, field, value, function(err) {
      if(err) { return callback(err); }
      callback();
    });
  };

  User.prototype.setUserFields = function(uid, data, callback) {
    callback = callback || function() {};
    this.database.setObject('user:' + uid, data, function(err) {
      if(err) { return callback(err); }
      callback();
    });
  };

  User.prototype.incrementUserFieldBy = function(uid, field, value, callback) {
    callback = callback || function() {};
    this.database.incrObjectFieldBy('user:' + uid, field, value, function(err, value) {
      if(err) { return callback(err); }
      callback(null, value);
    });
  };

  User.prototype.decrementUserFieldBy = function(uid, field, value, callback) {
    callback = callback || function() {};
    this.database.incrObjectFieldBy('user:' + uid, field, -value, function(err, value) {
      if(err) { return callback(err); }
      callback(null, value);
    });
  };

};