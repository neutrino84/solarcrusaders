
var client = require('client'),
    Orbit = require('./Orbit');

function Station(manager, data) {
  this.manager = manager;
  this.game = manager.game;
  this.sockets = manager.sockets;
  this.model = manager.model;

  this.data = new this.model.Station(data);
  this.data.init();

  this.faction = data.faction;
  this.uuid = this.data.uuid;
  this.chassis = this.data.chassis;
  this.race = this.data.race;

  // disabled state
  this.disabled = false;

  // station configuration
  this.config = client.StationConfiguration[this.data.chassis];

  // station orbit movement
  this.movement = new Orbit(this);
};

Station.prototype.constructor = Station;

Station.prototype.init = function(callback, context) {
  callback.call(context);
};

Station.prototype.save = function(callback) {
  //..
};

Station.prototype.hit = function(attacker, target, slot) {
  if(!attacker){return}
  var updates = {
        user: [],
        ship: [],
        station: []
      },
      game = this.game,
      sockets = this.sockets,
      movement = this.movement,
      race = this.data.race,
      hardpoint = attacker.hardpoints[slot],
      position = movement.position,
      distance = position.distance({ x: target.x, y: target.y }),
      ratio = distance / (this.size * hardpoint.data.aoe),
      damage, health, critical;

  if(ratio < 0.1 && attacker.ai && attacker.ai.type === 'pirate') {
    // if(ratio < 0.1) {
    // calc damage
    critical = game.rnd.rnd() <= attacker.critical;
    damage = global.Math.max(0, hardpoint.data.damage * (1-ratio) * (1-this.armor));
    damage += critical ? damage : 0;
    health = this.health-damage;

    // update damage
    if(!this.disabled && health > 0) {
      // update health
      this.health = health;
      
      // update station
      updates['station'].push({
        uuid: this.uuid,
        attacker: attacker.uuid,
        health: this.health,
        damage: damage,
        critical: critical
      });

      // update attacker
      // attacker.credits = attacker.credits + (race === 'general' ? damage : 0);
      updates['ship'].push({
        uuid: attacker.uuid,
        hardpoint: {
          station: this.uuid,
          slot: hardpoint.slot,
          target: target,
          damage: damage
        }
      });

      // update attacker user
      // if(attacker.user) {
      //   attacker.user.credits = attacker.credits;
      //   updates['user'].push({
      //     uuid: attacker.user.uuid,
      //     credits: attacker.credits.toFixed(0)
      //   });
      // }
    } else {
      // disengage attacker
      attacker.ai && attacker.ai.disengage();

      // disable station
      if(!this.disabled) {
        this.disable();
      }
    }

    // broadcast
    if(updates['ship'].length) {
      game.emit('ship/data', updates['ship']);
    }
    if(updates['station'].length) {
      game.emit('station/data', updates['station']);
    }
    if(updates['user'].length) {
      game.emit('user/data', updates['user']);
    }
  }
};

Station.prototype.disable = function() {
  // disable
  this.disabled = true;
  
  // broadcast
  this.game.emit('station/disabled', {
    uuid: this.uuid
  });
};

Station.prototype.enable = function() {
  // re-enable
  this.disabled = false;

  // update health / energy
  this.data.health = this.config.stats.health;

  // broadcast
  this.game.emit('station/enabled', {
    uuid: this.uuid
  });
};

Station.prototype.destroy = function() {
  this.sockets.send('station/removed', {
    uuid: this.uuid
  });

  this.manager = this.game =
    this.data = this.user = this.sockets =
    this.config = this.timers =
    this.enhancements = this.hardpoints = undefined;
};

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
