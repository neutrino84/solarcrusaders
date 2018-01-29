
var winston = require('winston'),
    uuid = require('uuid'),
    engine = require('engine'),
    Ship = require('./objects/Ship');

function ShipManager(game) {
  this.game = game;
  this.model = game.model;
  this.sockets = game.sockets;

  // global ships
  this.game.ships = {};
};

ShipManager.prototype.constructor = ShipManager;

ShipManager.prototype.init = function() {
  // internal
  this.game.on('ship/remove', this.remove, this);
  this.game.on('ship/create', this.create, this);

  // networking
  this.sockets.on('ship/plot', this.plot, this);
  this.sockets.on('ship/attack', this.attack, this);
  this.sockets.on('ship/squadron', this.squadron, this);
  this.sockets.on('ship/enhancement/start', this.enhancement, this);

  // update data interval
  this.game.clock.events.loop(1000, this.update, this);
};

ShipManager.prototype.add = function(ship) {
  var game = this.game,
      ships = game.ships;

  // check if exists
  if(ships[ship.uuid] == undefined) {
    ships[ship.uuid] = ship;
  }

  // ship added to world
  game.emit('ship/add', ship);
};

ShipManager.prototype.create = function(data) {
  var game = this.game,
      ship = new Ship(game, data);
      ship.init(function() {
        // add ship
        this.add(ship);
        
        // create squadron
        if(data.squadron && data.squadron.length) {
          ship.createSquadron();
        }
      }, this);
};

ShipManager.prototype.remove = function(data) {
  var game = this.game,
      ship = game.ships[data.uuid];
      ship && ship.destroy();
};

ShipManager.prototype.plot = function(socket, args) {
  var game = this.game,
      user = socket.request.session.user,
      data = args[1],
      ship = game.ships[data.uuid];
  if(ship && ship.user && ship.user.uuid === user.uuid) {
    ship.plot(data.coordinates, ship.user.latency.rtt);
  }
};

ShipManager.prototype.attack = function(socket, args) {
  var ships = this.game.ships,
      sockets = this.sockets,
      user = socket.request.session.user,
      data = args[1],
      ship = ships[data.uuid];
  if(ship && ship.user && ship.user.uuid === user.uuid) {
    ship.attack(data, ship.user.latency.rtt);
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

ShipManager.prototype.squadron = function(socket, args) {
  var ships = this.game.ships,
      sockets = this.sockets,
      user = socket.request.session.user,
      data = args[1],
      ship = ships[data.uuid];
  if(ship && ship.user && ship.user.uuid === user.uuid) {
    ship.command(data);
  }
};

ShipManager.prototype.data = function(uuids) {
  var ship,
      ships = [],
      game = this.game;
  for(var u in uuids) {
    ship = game.ships[uuids[u]];
    if(ship) {
      ships.push({
        uuid: ship.uuid,
        user: ship.user ? ship.user.uuid : null,
        master: ship.master ? ship.master.uuid : null,
        chassis: ship.chassis,
        name: ship.data.name,
        class: ship.data.class,
        x: ship.movement.position.x,
        y: ship.movement.position.y,
        rotation: ship.movement.rotation,
        ai: ship.ai ? ship.ai.type : null,
        station: ship.station ? ship.station.uuid : null,
        username: ship.user ? ship.user.data.username : ship.data.name,
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
        speed: ship.movement.speed,
        commands: ship.commands,
        enhancements: ship.serialized.enhancements,
        hardpoints: ship.serialized.hardpoints
      });
    }
  }
  return ships;
};

ShipManager.prototype.sync = function() {
  var game = this.game,
      ships = game.ships,
      synced = [],
      data, ship,
      movement, position, compensated;
  for(var s in ships) {
    ship = ships[s];

    if(ship) {
      // update
      movement = ship.movement;
      movement.update();

      // comp
      compensated = movement.compensated();

      // package
      position = movement.position;
      data = {
        uuid: ship.uuid,
        pos: { x: position.x, y: position.y },
        cmp: { x: compensated.x, y: compensated.y },
        spd: movement.speed
      };

      // sync
      synced.push(data);
    }
  }
  return synced;
};

ShipManager.prototype.update = function() {
  var game = this.game,
      ships = game.ships,
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
    game.emit('ship/data', updates);
  }
};

module.exports = ShipManager;
