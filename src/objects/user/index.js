
function User() {
  this.database = global.app.database;
  this.config = global.app.configuration.settings;
};

User.prototype.constructor = User;

User.prototype.getUidByEmail = function(email, callback) {
  if(!userslug) { return callback(null, 0); }
  this.database.sortedSetScore('email:uid', email.toLowerCase(), callback);
};

User.prototype.getUidByUserslug = function(userslug, callback) {
  if(!userslug) { return callback(null, 0); }
  this.database.sortedSetScore('userslug:uid', userslug, callback);
};

require('./auth')(User);
require('./data')(User);
require('./create')(User);

module.exports = User;
