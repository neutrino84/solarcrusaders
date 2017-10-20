
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

  // station configuration
  this.config = client.StationConfiguration[this.data.chassis];

  // station orbit movement
  this.orbit = new Orbit(this);
};

Station.prototype.constructor = Station;

Station.prototype.init = function(callback, context) {
  callback.call(context);
};

Station.prototype.save = function(callback) {
  //..
};

Station.prototype.attacked = function(target, slot) {

};

Station.prototype.hit = function(attacker, target, slot) {
  var updates = [],
      sockets = this.sockets,
      orbit = this.orbit,
      data = this.data,
      ai = this.ai,
      hardpoint = attacker.hardpoints[slot],
      piercing = attacker.enhancements.active.piercing,
      compensated = orbit.compensated(),
      distance = orbit.position.distance({x: target.x/4, y: target.y/4}),
      ratio = distance / (this.size * hardpoint.data.aoe),
      damage, health, critical;
        // console.log(ratio)
  if(ratio < 0.5) {
    // sockets.emit('hit!')
    // console.log('hit!')

    // calc damage
    // critical = this.game.rnd.rnd() <= attacker.critical;
    damage = global.Math.max(0, hardpoint.data.damage * (1-ratio));
    // damage += critical ? damage : 0;
    // damage *= piercing ? piercing.damage : 1;

    health = data.health - damage;

    // update damage
    if(!this.disabled && health > 0) {
      // update health
      data.health = health;
      updates.push({
        uuid: this.uuid,
        attacker: attacker.uuid,
        health: data.health,
        damage: damage
      });
      
      // update attacker
      attacker.credits = global.Math.floor(attacker.credits + damage + (ai && ai.type === 'pirate' ? damage : 0));
      updates.push({
        uuid: attacker.uuid,
        credits: attacker.credits,
        hardpoint: {
          station: this.uuid,
          slot: hardpoint.slot,
          target: target,
          damage: damage
        }
      });
    } else {
        // disengage attacker
        attacker.ai && attacker.ai.disengage();

        // disable station
        if(!this.disabled) {
          this.disable();

          if(!attacker.ai || attacker.master){
            if(attacker.master){
              master = attacker.master
            }
          }
          attacker.reputation = global.Math.floor(attacker.reputation + (this.reputation * -0.05));
          attacker.credits = global.Math.floor(attacker.credits + this.credits);
          updates.push({
            uuid: attacker.uuid,
            reputation: attacker.reputation,
            credits : attacker.credits
          });
        }
      };

    // broadcast
    if(updates.length) {
      this.game.emit('station/data', updates);
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
  this.sockets.emit('station/enabled', {
    uuid: this.uuid
  });
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

module.exports = Station;
