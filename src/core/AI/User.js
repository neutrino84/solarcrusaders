
var engine = require('engine'),
    Basic = require('./Basic');

function User(ship) {
  Basic.call(this, ship);

  this.type = 'user';
  this.settings = {
    friendly: ['basic', 'user'],
    sensor: {
      aim: 1.25,
      range: 1024
    }
  };
};

User.prototype = Object.create(Basic.prototype);
User.prototype.constructor = User;

User.prototype.update = function() {
  //..
};

User.prototype.attacked = function() {
  //..
};

module.exports = User;
