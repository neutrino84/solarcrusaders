
// for linters
/*global global, module*/

var engine = require('engine'),
    Ship = require('./objects/Ship'),
    Utils = require('../utils');

function ObjectManager(game, eventPrefix) {
  this.game = game;
  this.eventPrefix = eventPrefix;
  this.ships = {};
  this.count = {};
  if (game) {
    this.model = game.model;
    this.sockets = game.sockets;
    this.iorouter = game.sockets.iorouter;

    this.game.on(this.eventPrefix + '/add', this.add, this);
    this.game.on(this.eventPrefix + '/remove', this.remove, this);
    this.game.on(this.eventPrefix + '/create', this.create, this);

    // activate ai
    this.game.clock.events.loop(1000, this._updateShips, this);
    this.game.clock.events.loop(2000, this._updateAI, this);
  }
}

ObjectManager.prototype.constructor = ObjectManager;

ObjectManager.prototype.init = function() {
  // io router
  this.sockets.iorouter.on(this.eventPrefix + '/data', this.data.bind(this));
  this.sockets.iorouter.on(this.eventPrefix + '/attack', this.attack.bind(this));
  this.sockets.iorouter.on(this.eventPrefix + '/enhancement/*', this.enhancement.bind(this));
};

ObjectManager.prototype.add = function(ship) {
  if(this.ships[ship.uuid] === undefined) {
    this.ships[ship.uuid] = ship;
    if(this.count[ship.chassis]) {
      this.count[ship.chassis]++;
    } else {
      this.count[ship.chassis] = 1;
    }
  }
};

ObjectManager.prototype.create = function(data, user, position) {
  var ship;
  position = position || this.generateRandomPosition(user ? 512 : 2048);
  data = Utils.extend({
    x: data.x || position.x,
    y: data.y || position.y
  }, data);
  ship = new Ship(this, data);
  ship.user = user;
  ship.init(function(err) {
    this.game.emit(this.eventPrefix + '/add', ship);
  }.bind(this));
};

ObjectManager.prototype.remove = function(ship) {
  ship = this.ships[ship.uuid];
  if(ship !== undefined) {
    delete this.ships[ship.uuid] && ship.destroy();

    this.count[ship.chassis] && this.count[ship.chassis]--;
    this.sockets.io.sockets.emit(this.eventPrefix + '/removed', {
      uuid: ship.uuid
    });
  }
};

ObjectManager.prototype.attack = function(sock, args, next) {
  var ships = this.ships,
      session = sock.sock.handshake.session,
      user = session.user,
      data = args[1],
      ship = ships[data.uuid];
  if(ship && ship.user && ship.user.uuid === user.uuid) {
    ship.attack(data, session.rtt);
  }
};

ObjectManager.prototype.enhancement = function(sock, args, next) {
  var ships = this.ships,
      session = sock.sock.handshake.session,
      user = session.user,
      path = args[0],
      data = args[1],
      ship = ships[data.uuid];
  switch(path) {
    case this.eventPrefix + '/enhancement/start':
      if(ship && ship.user && ship.user.uuid === user.uuid) {
        if(!ship.activate(data.enhancement)) {
          this.sockets.io.sockets.emit(this.eventPrefix + '/enhancement/cancelled', {
            uuid: ship.uuid,
            enhancement: data.enhancement
          });
        }
      }
      break;
    default:
      break;
  }
};

ObjectManager.prototype.data = function(sock, args, next) {
  var ship, enhancements, ai,
      cargo, uuid, username,
      user = sock.sock.handshake.session.user,
      uuids = args[1].uuids,
      ships = [];
  for(var u in uuids) {
    ship = this.ships[uuids[u]];
    if(ship) {
      ship.ignoreEnhancements = true;
      username = ship.user ? ship.user.data.username : ship.data.name;
      enhancements = Object.keys(ship.enhancements.available);
      uuid = ship.user ? ship.user.uuid : null;
      ai = ship.ai ? ship.ai.type : null;
      cargo = uuid === user.uuid ? ship.cargo : {};
      ships.push({
        id: ship.id,
        uuid: ship.uuid,
        user: uuid,
        ai: ai,
        name: ship.data.name,
        username: username,
        chassis: ship.chassis,
        sector: ship.sector,
        x: ship.x,
        y: ship.y,
        throttle: ship.throttle,
        rotation: ship.rottion,
        credits: ship.data.credits,
        reputation: ship.data.reputation,
        kills: ship.data.kills,
        disables: ship.data.disables,
        assists: ship.data.assists,
        durability: ship.durability,
        capacity: ship.capacity,
        energy: ship.energy,
        recharge: ship.recharge,
        health: ship.health,
        heal: ship.heal,
        armor: ship.armor,
        range: ship.range,
        speed: ship.speed,
        damage: ship.damage,
        critical: ship.critical,
        accuracy: ship.accuracy,
        evasion: ship.evasion,
        hardpoints: ship.hardpoints,
        systems: ship.systems,
        enhancements: enhancements,
        cargo: cargo
      });
      ship.ignoreEnhancements = false;
    }
  }
  sock.emit(this.eventPrefix + '/data', {
    type: 'sync', ships: ships
  });
};

ObjectManager.prototype._updateShips = function() {
  var ship, delta,
      ships = this.ships,
      update, updates = [],
      stats;
  for(var s in ships) {
    if(ships[s].disabled) { continue; }

    ship = ships[s];
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

    if(delta !== undefined) {
      updates.push(update);
    }
  }
  if(updates.length > 0) {
    this.sockets.io.sockets.emit(this.eventPrefix + '/data', {
      type: 'update', ships: updates
    });
  }
};

ObjectManager.prototype._updateAI = function() {
  var ship,
      ships = this.ships;
  for(var s in ships) {
    ship = ships[s];
    ship.ai && ship.ai.update();
  }
};

ObjectManager.prototype.generateRandomPosition = function(size) {
  size = size || (global.Math.random() > 0.5 ? 2048 : 1024);
  var halfSize = size / 2,
      center = 2048,
      start = center - halfSize,
      randX = global.Math.random() * size,
      randY = global.Math.random() * size;
  return new engine.Point(start + randX, start + randY);
};

module.exports = ObjectManager;
