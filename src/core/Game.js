
var EventEmitter = require('eventemitter3'),
    Timeout = require('./Timeout'),
    Clock = require('./Clock'),
    SectorManager = require('./SectorManager');

function Game(app) {
  this.app = app;
  this.winston = app.winston;
  this.database = app.database;
  this.model = app.model;
  this.sockets = app.sockets;

  this.delta = 0;
  this.isBooted = false;

  this.timeout = new Timeout(this);
  this.clock = new Clock(this);
  this.sectorManager = new SectorManager(this);

  EventEmitter.call(this);
};

Game.prototype = Object.create(EventEmitter.prototype);
Game.prototype.constructor = Game;

Game.prototype.init = function(next) {
  if(this.isBooted) { return; }

  this.isBooted = true;

  this.sectorManager.init();
  this.clock.init();
  this.timeout.init();

  //
  next();
};

Game.prototype.update = function() {
  var clock = this.clock,
      step = clock.stepSize,
      elapsed = clock.elapsedMS;

  // update clock
  clock.update();

  // delta
  this.delta += elapsed;

  // update at desired fps
  if(this.delta >= step) {
    this.sectorManager.update();
    this.delta -= step;
  }

  // check for overload
  if(elapsed > step) {
    this.winston.info('overload warning');
  }
};

module.exports = Game;
