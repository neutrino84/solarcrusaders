
var Sector = require('./sector'),
    User = require('./user'),
    Ship = require('./ship');

function Model(game) {
  this.game = game;
  this.database = game.database;

  this.sector = new Sector(this);
  this.user = new User(this);
  this.ship = new Ship(this);
};

Model.prototype.init = function() {};

module.exports = Model;
