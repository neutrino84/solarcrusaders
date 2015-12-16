
var Sector = require('./sector'),
    User = require('./user'),
    Ship = require('./ship'),
    System = require('./system');

function Model(app) {
  this.database = app.database;

  this.sector = new Sector(this);
  this.user = new User(this);
  this.ship = new Ship(this);
  this.system = new System(this);
};

Model.prototype.init = function(next) {
  next();
};

module.exports = Model;
