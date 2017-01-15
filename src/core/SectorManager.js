
// for linters
/*global module*/

var ObjectManager = require('./ObjectManager'),
    ShipManager = require('./ShipManager'),
    UserManager = require('./UserManager');

function SectorManager(game) {
  this.game = game;
  // this.model = game.model;
  // this.winston = game.winston;
  // this.io = game.sockets.io;
  // this.iorouter = game.sockets.iorouter;

  this.userManager = new UserManager(game);
  this.staticManager = new ObjectManager(game, 'static');
  this.shipManager = new ShipManager(game);
}

SectorManager.prototype.constructor = SectorManager;

SectorManager.prototype.init = function() {
  this.userManager.init();
  this.staticManager.init();
  this.shipManager.init();
};

SectorManager.prototype.update = function() {
  this.userManager.update();
  this.shipManager.update();
};

module.exports = SectorManager;
