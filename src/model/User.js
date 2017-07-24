
var uuid = require('uuid'),
    db = require('../database'),
    schema = db.schema,
    Validator = require('../utils/Validator'),
    Sanitation = require('../utils/Sanitation'),
    Password = require('../utils/Password');

var User = schema.define('user', {
  uuid:       { type: schema.UUID, default: uuid.v4 },
  ship:       { type: schema.UUID },
  status:     { type: schema.String, default: 'offline' },
  role:       { type: schema.String, default: 'guest' },
  edition:    { type: schema.String, default: 'none' },
  name:       { type: schema.String },
  username:   { type: schema.String },
  userslug:   { type: schema.String, index: true, unique: true },
  email:      { type: schema.String, index: true, unique: true },
  password:   { type: schema.String },
  credits:    { type: schema.Integer, default: 0 },
  reputation: { type: schema.Integer, default: 0 },
  logins:     { type: schema.Integer, default: 0 },
  banned:     { type: schema.Integer, default: 0 },
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
User.validatesInclusionOf('edition', { in: ['none', 'lieutenant', 'commander', 'captain'] });

User.validatesNumericalityOf('credits', { int: true });
User.validatesNumericalityOf('reputation', { int: true });
User.validatesNumericalityOf('logins', { int: true });

function emailValidator(err) {
  if(this.isNewRecord()) {
    if(!Validator.isEmailValid(this.email)) { err(); }
  }
};

function usernameValidator(err) {
  if(this.isNewRecord()) {
    if(!Validator.isUsernameValid(this.username)) { err(); }
  }
};

User.prototype.sanitize = function() {
  this.userslug = Sanitation.slugify(this.username);
  this.email = Sanitation.email(this.email);
  this.name = Sanitation.name(this.name);
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
