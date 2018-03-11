
var engine = require('engine'),
    EventEmitter = require('eventemitter3'),
    Timeout = require('./Timeout'),
    Clock = require('./Clock'),
    AI = require('./AI'),
    SectorManager = require('./SectorManager'),
    EventManager = require('./EventManager');

function Game(app) {
  this.app = app;
  this.logger = app.logger;
  this.database = app.database;
  this.model = app.model;
  this.sockets = app.sockets;

  this.delta = 0;
  this.booted = false;

  // helpers
  this.rnd = new engine.RandomGenerator([global.Math.random()]);

  // game logic
  this.manager = new SectorManager(this);
  this.events = new EventManager(this);
  this.ai = new AI(this);

  // timing
  this.clock = new Clock(this);
  this.timeout = new Timeout(this);

  // messaging
  EventEmitter.call(this);
};

Game.prototype = Object.create(EventEmitter.prototype);
Game.prototype.constructor = Game;

Game.prototype.init = function(next) {
  // init game logic
  this.manager.init();
  this.events.init();
  this.ai.init();

  // init timing
  this.clock.init();
  this.timeout.init();

  // booted
  this.booted = true;

  // async proceed
  next();
};

Game.prototype.update = function() {
  // update clock
  this.clock.update();

  // delta
  this.delta += this.clock.elapsedMS;

  // update at desired fps
  if(this.delta >= this.clock.stepSize) {
    this.manager.update();
    this.events.update();
    this.ai.update();
    this.delta -= this.clock.stepSize;
  }

  // check for overload
  if(this.delta > this.clock.stepSize) {
    this.logger.info('[Game] Step size exceeded by ' + (this.delta - this.clock.stepSize) + 'ms');
  }
};

module.exports = Game;
