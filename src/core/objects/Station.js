
var client = require('client'),
    Orbit = require('./Orbit');

function Station(game, data) {
  this.game = game;
  this.sockets = game.sockets;
  this.model = game.model;

  this.uuid = null;
  this.chassis = null;
  this.race = null;

  // variables
  this.disabled = false;

  // data model
  this.data = new this.model.Station(data);
  this.data.init();

  // station movement helper
  this.movement = new Orbit(this);

  // station configuration
  this.config = client.StationConfiguration[this.data.chassis];
};

Station.prototype.constructor = Station;

Station.prototype.init = function(callback, context) {
  var self = this,
      game = this.game,
      data = this.data;
  if(data.isNewRecord()) {
    // data shortcuts
    this.uuid = data.uuid;
    this.chassis = data.chassis;
    this.race = data.race;

    callback.call(context, self);
  } else {
    async.series([
      data.reload.bind(data)
    ], function(err, results) {
      callback.call(context, self);
    });
  }
};

Station.prototype.save = function(callback) {
  //..
};

Station.prototype.hit = function(attacker, target, slot) {
  var game = this.game,
      uuid = this.uuid,
      movement = this.movement,
      data = this.data,
      size = this.size,
      rnd = game.rnd,
      hardpoint = attacker.hardpoints[slot],
      position = movement.compensated(0),
      distance = position.distance(target),
      ratio = 1-(distance/(size+hardpoint.data.aoe)),
      damage, health, critical,
      updates = {
        ship: [],
        station: []
      };

  // hit test
  if(ratio > 0.0) {
    // calculate damage
    critical = rnd.rnd() <= attacker.critical ? 2.0 : 1.0;
    damage = hardpoint.data.damage * ratio * critical;
    health = data.health-damage > 0 ? data.health-damage : 0;

    // update health
    data.health = health;
    updates['station'].push({
      uuid: uuid,
      attacker: attacker.uuid,
      health: data.health,
      damage: damage,
      critical: critical
    });

    // update attacker
    attacker.credits += damage;
    updates['ship'].push({
      uuid: attacker.uuid,
      credits: attacker.credits,
      hardpoint: {
        uuid: uuid,
        slot: hardpoint.slot,
        target: target,
        damage: damage
      }
    });

    // update damage
    if(health > 0) {
      // update targets in
      // the attacker ship
      if(attacker.targets.indexOf(this) < 0) {
        attacker.targets.push(this);
        attacker.targets = attacker.targets.slice(0, 3);
      }
    } else {
      // disabled
      updates['station'].push({
        uuid: uuid,
        disabled: true
      });

      // disable
      this.disable();
    }

    // broadcast
    game.emit('ship/data', updates['ship']);
    game.emit('station/data', updates['station']);
  }
};

Station.prototype.disable = function() {
  // disable
  this.disabled = true;

  // stop movement
  this.movement.disabled();
};

Station.prototype.enable = function() {
  // re-enable
  this.disabled = false;
};

Station.prototype.destroy = function() {
  // remove from world
  delete this.game.stations[this.uuid];

  // final cleanup
  this.game = this.data = this.movement = undefined;
}

Object.defineProperty(Station.prototype, 'integrity', {
  get: function() {
    return this.data.health/this.config.stats.health;
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

Object.defineProperty(Station.prototype, 'armor', {
  get: function() {
    return this.data.armor;
  },

  set: function(value) {
    this.data.armor = value;
  }
});

module.exports = Station;
