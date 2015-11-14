
var Timeout = require('./Timeout'),
    Clock = require('./Clock'),
    SectorManager = require('./SectorManager');

function Game(app) {
  this.app = app;
  this.winston = app.winston;
  this.database = app.database;
  this.model = app.model;
  this.sockets = app.sockets;

  this.isBooted = false;
  this.kickstart = true;
  this.forceSingleUpdate = false;

  this.clock = new Clock(this);
  this.sectorManager = new SectorManager(this);

  this._deltaTime = 0;
  this._lastCount = 0;
  this._spiraling = 0;
  this._nextFpsNotification = 5000;
};

Game.prototype.constructor = Game;

Game.prototype.init = function(next) {
  if(this.isBooted) { return; }

  var self = this;

  this.isBooted = true;
  this.kickstart = true;

  this.clock.init();
  this.sectorManager.init();

  // calls game update
  this.timeout = new Timeout(this);
  this.timeout.start();

  //
  next();
};

Game.prototype.update = function(time) {
  this.clock.update(time);

  if(this.kickstart) {
    this.updateLogic(this.clock.desiredFpsMult);
    this.kickstart = false;
    return;
  }

  if(this._spiraling > 1 && !this.forceSingleUpdate) {
    if(this.clock.time > this._nextFpsNotification) {
      // only permit one fps notification per 10 seconds
      this._nextFpsNotification = this.clock.time + 10000;
      this.winston.warn('[Game] Event loop has stressed at current load!');
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
  this.sectorManager.update();
};

module.exports = Game;
