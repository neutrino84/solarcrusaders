
var client = require('client'),
    Orbit = require('./Orbit');

function Station(manager, data) {
  this.manager = manager;
  this.game = manager.game;
  this.sockets = manager.sockets;
  this.model = manager.model;

  this.data = new this.model.Station(data);
  this.data.init();

  this.uuid = this.data.uuid;
  this.chassis = this.data.chassis;
  this.config = client.StationConfiguration[this.data.chassis];

  this.orbit = new Orbit(this);
};

Station.prototype.constructor = Station;

Station.prototype.init = function(callback) {
  callback();
};

Station.prototype.save = function(callback) {
  //..
};

Station.prototype.attacked = function(target, slot) {

};

Station.prototype.disable = function() {
  // disable
  this.disabled = true;

  // broadcast
  this.sockets.emit('station/disabled', {
    uuid: this.uuid
  });
};

Station.prototype.enable = function() {
  // re-enable
  this.disabled = false;

  // update health / energy
  this.data.health = this.config.stats.health;

  // broadcast
  this.sockets.emit('station/enabled', {
    uuid: this.uuid
  });
};

Object.defineProperty(Station.prototype, 'rotation', {
  get: function() {
    return this.data.rotation;
  },

  set: function(value) {
    this.data.rotation = value;
  }
});

Object.defineProperty(Station.prototype, 'health', {
  get: function() {
    return this.data.health;
  },

  set: function(value) {
    this.data.health = value;
  }
});

Object.defineProperty(Station.prototype, 'heal', {
  get: function() {
    return this.data.heal;
  },

  set: function(value) {
    this.data.heal = value;
  }
});

Object.defineProperty(Station.prototype, 'speed', {
  get: function() {
    return this.data.speed;
  },

  set: function(value) {
    this.data.speed = value;
  }
});

Object.defineProperty(Station.prototype, 'radius', {
  get: function() {
    return this.data.radius;
  },

  set: function(value) {
    this.data.radius = value;
  }
});

Object.defineProperty(Station.prototype, 'period', {
  get: function() {
    return this.data.period;
  },

  set: function(value) {
    this.data.period = value;
  }
});

Object.defineProperty(Station.prototype, 'size', {
  get: function() {
    return this.data.size;
  },

  set: function(value) {
    this.data.size = value;
  }
});

module.exports = Station;
