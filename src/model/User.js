
var uuid = require('uuid'),
    db = require('../database'),
    schema = db.schema,
    Validator = require('../utils/Validator'),
    Sanitation = require('../utils/Sanitation'),
    Password = require('../utils/Password');

var User = schema.define('user', {
  uuid:       { type: schema.UUID, default: uuid.v4 },
  status:     { type: schema.String, default: 'offline' },
  role:       { type: schema.String, default: 'guest' },
  name:       { type: schema.String },
  username:   { type: schema.String },
  userslug:   { type: schema.String, index: true },
  email:      { type: schema.String, index: true },
  password:   { type: schema.String },
  reputation: { type: schema.Integer, default: 0 },
  logins:     { type: schema.Integer, default: 0 },
  banned:     { type: schema.Boolean, default: 0 },
  created:    { type: schema.Date, default: Date.now }
});

User.validatesLengthOf('name', { min: 2, max: 64 });
User.validatesLengthOf('email', { min: 3, max: 256 });
User.validatesLengthOf('username', { min: 6, max: 16 });
User.validatesLengthOf('password', { min: 8, max: 64 });

User.validate('email', emailValidator, { message: 'invalid email address' });
User.validate('username', usernameValidator, { message: 'invalid username' });

User.validatesUniquenessOf('userslug', { message: 'username already taken' });
User.validatesUniquenessOf('email', { message: 'email already registered' });

User.validatesInclusionOf('role', { in: ['guest', 'user', 'moderator', 'admin'] });
User.validatesInclusionOf('status', { in: ['online', 'offline'] });
User.validatesNumericalityOf('reputation', { int: true });
User.validatesNumericalityOf('logins', { int: true });

function emailValidator(err) {
  if(!Validator.isEmailValid(this.email)) { err(); }
};

function usernameValidator(err) {
  if(!Validator.isUsernameValid(this.username)) { err(); }
};

User.afterInitialize = function() {
  if(this.isNewRecord()) {
    if(this.userslug) { this.userslug = Sanitation.slugify(this.username); }
    if(this.email) { this.email = Sanitation.email(this.email); }
  }
};

User.beforeCreate = function(next) {
  var self = this,
      password = new Password();
      password.hash(8, this.password, function(err, hashed) {
        if(err) { throw new Error('[User Model] Password hashing has failed'); }
        self.password = hashed;
        next();
      });
};

module.exports = User;
