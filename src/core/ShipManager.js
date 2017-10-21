
var uuid = require('uuid'),
    engine = require('engine'),
    Ship = require('./objects/Ship'),
    AI = require('./AI'),
    Utils = require('../utils'),
    Generator = require('../utils/Generator');

function ShipManager(game) {
  this.game = game;
  this.model = game.model;
  this.sockets = game.sockets;

  // global ships
  this.game.ships = {};

  // ai manager
  this.ai = new AI(this);
};

ShipManager.prototype.constructor = ShipManager;

ShipManager.prototype.init = function() {
  // internal
  this.game.on('ship/add', this.add, this);
  this.game.on('ship/remove', this.remove, this);
  this.game.on('ship/create', this.create, this);
  this.game.on('ship/disabled', this.disabled, this);

  // networking
  this.sockets.on('ship/plot', this.plot, this);
  this.sockets.on('ship/attack', this.attack, this);
  this.sockets.on('ship/enhancement/start', this.enhancement, this);

  // update data interval
  this.game.clock.events.loop(1000, this.update, this);
};

ShipManager.prototype.add = function(ship) {
  if(this.game.ships[ship.uuid] === undefined) {
    this.game.ships[ship.uuid] = ship;
  }
};

ShipManager.prototype.remove = function(ship) {
  var s = this.game.ships[ship.uuid];
  if(s !== undefined) {
    delete this.game.ships[ship.uuid] && s.destroy();
  }
};

ShipManager.prototype.create = function(data, user, master) {
  var self = this, ship,
      game = this.game;
  ship = new Ship(this, data, user, master);
  ship.init(function() {
    game.emit('ship/add', ship);
  });
};

ShipManager.prototype.plot = function(socket, args) {
  var user = socket.request.session.user,
      data = args[1],
      ship = this.game.ships[data.uuid];
  if(ship && ship.user && ship.user.uuid === user.uuid) {
    ship.plot(data.coordinates);
  }
};

ShipManager.prototype.attack = function(socket, args) {
  var ships = this.game.ships,
      sockets = this.sockets,
      user = socket.request.session.user,
      data = args[1],
      ship = ships[data.uuid];
  if(ship && ship.user && ship.user.uuid === user.uuid) {
    ship.attack(data, ship.user.rtt);
  }
};

ShipManager.prototype.enhancement = function(socket, args) {
  var ships = this.game.ships,
      sockets = this.sockets,
      user = socket.request.session.user,
      path = args[0],
      data = args[1],
      ship = ships[data.uuid];
  switch(path) {
    case 'ship/enhancement/start':
      if(ship && ship.user && ship.user.uuid === user.uuid) {
        ship.activate(data.enhancement);
      }
      break;
    default:
      break;
  }
};

ShipManager.prototype.data = function(uuids) {
  var ship,
      ships = [];
  for(var u in uuids) {
    ship = this.game.ships[uuids[u]];
    if(ship) {
      ships.push({
        uuid: ship.uuid,
        chassis: ship.chassis,
        name: ship.data.name,
        x: ship.movement.x,
        y: ship.movement.y,
        rotation: ship.movement.rotation,
        speed: ship.speed * ship.movement.throttle,
        user: ship.user ? ship.user.uuid : null,
        ai: ship.ai ? ship.ai.type : null,
        username: ship.user ? ship.user.data.username : null,
        disabled: ship.disabled,
        size: ship.size,
        credits: ship.data.credits,
        reputation: ship.data.reputation,
        kills: ship.data.kills,
        disables: ship.data.disables,
        assists: ship.data.assists,
        durability: ship.durability,
        energy: ship.energy,
        recharge: ship.recharge,
        health: ship.health,
        heal: ship.heal,
        armor: ship.armor,
        rate: ship.rate,
        critical: ship.critical,
        evasion: ship.evasion,
        enhancements: ship.serialized.enhancements,
        hardpoints: ship.serialized.hardpoints
      });
    }
  }
  return ships;
};

ShipManager.prototype.sync = function() {
  var data, ship, position, movement,
      ships = this.game.ships,
      synced = [];
  for(var s in ships) {
    ship = ships[s];
    movement = ship.movement;
    movement.update();
    position = movement.position;
    data = {
      uuid: ship.uuid,
      pos: { x: position.x, y: position.y },
      spd: ship.speed * movement.throttle
    };
    synced.push(data);
  }
  return synced;
};

ShipManager.prototype.update = function() {
  var ships = this.game.ships,
      ship, delta, update, stats,
      updates = [];
  for(var s in ships) {
    ship = ships[s];
    
    if(!ship.disabled) {
      stats = ship.config.stats;
      update = { uuid: ship.uuid };

      // update health
      if(ship.health < stats.health) {
        delta = ship.heal;
        ship.health = global.Math.min(stats.health, ship.health + delta);
        update.health = engine.Math.roundTo(ship.health, 1);
      }

      // update energy
      if(ship.energy < stats.energy) {
        delta = ship.recharge;
        ship.energy = global.Math.min(stats.energy, ship.energy + delta);
        update.energy = engine.Math.roundTo(ship.energy, 1);
      }

      // push deltas
      if(delta !== undefined) {
        updates.push(update);
      }
    }
  }
  if(updates.length > 0) {
    this.game.emit('ship/data', updates);
  }
};

ShipManager.prototype.disabled = function(data) {
  this.sockets.send('ship/disabled', data);
};

module.exports = ShipManager;
