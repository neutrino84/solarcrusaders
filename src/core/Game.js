
var IntervalManager = require('./IntervalManager'),
    Clock = require('../client/engine/time/Clock');

function Game(config) {
  if(!config) { config = {}; }

  this.config = config;

  this.isBooted = false;
  this.forceSingleUpdate = false;
  this.currentUpdateID = 0;

  this._deltaTime = 0;
  this._lastCount = 0;
  this._spiraling = 0;
  this._kickstart = true;
  this._nextFpsNotification = 0;
};

Game.prototype.constructor = Game;

Game.prototype.boot = function() {
  if(this.isBooted) { return; }

  this.isBooted = true;
  this._kickstart = true;

  this.clock = new Clock(this);
  this.clock.boot();

  // calls game update
  this.intervalManager = new IntervalManager(this);
  this.intervalManager.start();
};

Game.prototype.update = function(time) {
  this.clock.update(time);

  if(this._kickstart) {
    this.updateLogic(this.clock.desiredFpsMult);
    this._kickstart = false;
    return;
  }

  if(this._spiraling > 1 && !this.forceSingleUpdate) {
    if(this.clock.time > this._nextFpsNotification) {
      // only permit one fps notification per 10 seconds
      this._nextFpsNotification = this.clock.time + 10000;
      // this.emit('fpsProblem');
    }
    this._deltaTime = 0;
    this._spiraling = 0;
  } else {
    var count = 0,
        slowStep = this.clock.slowMotion * 1000.0 / this.clock.desiredFps;

    this._deltaTime += global.Math.max(global.Math.min(slowStep * 3, this.clock.elapsed), 0);

    this.updatesThisFrame = global.Math.floor(this._deltaTime / slowStep);
    
    if(this.forceSingleUpdate) {
      this.updatesThisFrame = global.Math.min(1, this.updatesThisFrame);
    }

    while(this._deltaTime >= slowStep) {
      this._deltaTime -= slowStep;
      this.currentUpdateID = count;
      this.updateLogic(this.clock.desiredFpsMult);

      count++;

      if(this.forceSingleUpdate && count === 1) {
        break;
      } else {
        this.clock.refresh();
      }
    }

    if(count > this._lastCount) {
      this._spiraling++;
    } else if(count < this._lastCount) {
      this._spiraling = 0;
    }

    this._lastCount = count;
  }
};

Game.prototype.updateLogic = function() {
  //..
};

Game.prototype.destroy = function() {
  this.intervalManager.stop();
  this.isBooted = false;
};

module.exports = Game;
