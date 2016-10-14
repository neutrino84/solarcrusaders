
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

  this.timeout.init();
  this.clock.init();
  this.sectorManager.init();

  // calls game update
  this.timeout.start();

  //
  next();
};

Game.prototype.update = function(time) {
  var step = 1000.0 / this.clock.desiredFps;

  // update clock
  this.clock.update(time);

  // update at desired fps
  this.delta += this.clock.elapsedMS;
  if(this.delta >= step) {
    this.sectorManager.update();
    this.delta -= step;
  }
};

module.exports = Game;
