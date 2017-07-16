
var uuid = require('uuid'),
    engine = require('engine')
    client = require('client'),
    ShipManager = require('./ShipManager'),
    UserManager = require('./UserManager'),
    StationManager = require('./StationManager');

function SectorManager(game) {
  this.game = game;
  this.userManager = new UserManager(game);
  this.shipManager = new ShipManager(game);
  this.stationManager = new StationManager(game);
};

SectorManager.prototype.constructor = SectorManager;

SectorManager.prototype.init = function() {
  this.userManager.init();
  this.stationManager.init();
  this.shipManager.init();
};

SectorManager.prototype.update = function() {
  this.userManager.update();
  this.shipManager.update();
  this.stationManager.update();
};

module.exports = SectorManager;
