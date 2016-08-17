
var uuid = require('uuid'),
    engine = require('engine'),
    Ship = require('./objects/Ship'),
    Utils = require('../utils'),
    Generator = require('../utils/Generator');

function ShipManager(game) {
  this.game = game;
  this.model = game.model;
  this.sockets = game.sockets;
  this.iorouter = game.sockets.iorouter;

  this.ships = {};
  this.count = {};

  this.game.on('ship/add', this.add, this);
  this.game.on('ship/remove', this.remove, this);
  this.game.on('ship/create', this.create, this);

  // activate ai
  this.game.clock.events.loop(1000, this._updateShips, this);
  this.game.clock.events.loop(2000, this._updateAI, this);
};

ShipManager.prototype.constructor = ShipManager;

ShipManager.prototype.init = function() {
  var self = this;

  // io router
  this.sockets.iorouter.on('ship/data', this.data.bind(this));
  this.sockets.iorouter.on('ship/plot', this.plot.bind(this));
  this.sockets.iorouter.on('ship/canister', this.canister.bind(this));
  this.sockets.iorouter.on('ship/attack', this.attack.bind(this));
  this.sockets.iorouter.on('ship/enhancement/*', this.enhancement.bind(this));

  // generate npcs
  this.generateRandomShips();
  this.generatePirateShips();
};

ShipManager.prototype.add = function(ship) {
  if(this.ships[ship.uuid] === undefined) {
    this.ships[ship.uuid] = ship;
    if(this.count[ship.chassis]) {
      this.count[ship.chassis]++;
    } else {
      this.count[ship.chassis] = 1;
    }
  }
};

ShipManager.prototype.create = function(data, user, position) {
  var self = this, ship,
      position = position || this.generateRandomPosition(user ? 512 : 2048),
      data = Utils.extend({
        x: data.x || position.x,
        y: data.y || position.y
      }, data);
  ship = new Ship(this, data);
  ship.user = user;
  ship.init(function(err) {
    self.game.emit('ship/add', ship);
  });
};

ShipManager.prototype.remove = function(ship) {
  var index,
      ship = this.ships[ship.uuid];
  if(ship !== undefined) {
    delete this.ships[ship.uuid] && ship.destroy();

    this.count[ship.chassis] && this.count[ship.chassis]--;
    this.sockets.io.sockets.emit('ship/removed', {
      uuid: ship.uuid
    });
  }
};

ShipManager.prototype.canister = function(sock, args, next) {
  var user = sock.sock.handshake.session.user,
      data = args[1],
      ship = this.ships[data.uuid];
  if(ship && ship.user && ship.user.ship === user.ship) {
    ship.user.data.credits += 1000;
    this.game.emit('user/data', ship.user, {
      credits: ship.user.data.credits
    });
  }
};

ShipManager.prototype.plot = function(sock, args, next) {
  var user = sock.sock.handshake.session.user,
      data = args[1],
      ship = this.ships[data.uuid];
  if(ship && ship.user && ship.user.uuid === user.uuid) {
    ship.movement.plot(data.destination);
  }
};

ShipManager.prototype.attack = function(sock, args, next) {
  var ships = this.ships,
      sockets = this.sockets,
      session = sock.sock.handshake.session,
      user = session.user,
      data = args[1],
      ship = ships[data.uuid];
  if(ship && ship.user && ship.user.uuid === user.uuid) {
    ship.attack(data, session.rtt);
  }
};

ShipManager.prototype.enhancement = function(sock, args, next) {
  var ships = this.ships,
      sockets = this.sockets,
      session = sock.sock.handshake.session,
      user = session.user,
      path = args[0],
      data = args[1],
      ship = ships[data.uuid];
  switch(path) {
    case 'ship/enhancement/start':
      if(ship && ship.user && ship.user.uuid === user.uuid) {
        if(!ship.activate(data.enhancement)) {
          this.sockets.io.sockets.emit('ship/enhancement/cancelled', {
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

ShipManager.prototype.data = function(sock, args, next) {
  var self = this, ship, enhancements, systems,
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
      cargo = uuid === user.uuid ? ship.cargo : {};
      ships.push({
        id: ship.id,
        uuid: ship.uuid,
        user: uuid,
        name: ship.data.name,
        username: username,
        chassis: ship.chassis,
        sector: ship.sector,
        x: ship.x,
        y: ship.y,
        throttle: ship.throttle,
        rotation: ship.rottion,
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
  sock.emit('ship/data', {
    type: 'sync', ships: ships
  });
};

ShipManager.prototype.update = function() {
  var data, ship, position, movement,
      moving, ships = this.ships,
      arr = [];
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
    arr.push(data);
  }
  this.sockets.io.sockets.emit('ship/sync', {
    ships: arr
  });
};

ShipManager.prototype.generateRandomShips = function() {
  var iterator = {
        'ubaidian-x01': { race: 'ubaidian', count: 0 },
        'ubaidian-x02': { race: 'ubaidian', count: 0 },
        'ubaidian-x03': { race: 'ubaidian', count: 1 },
        'ubaidian-x04': { race: 'ubaidian', count: 2 },
        'hederaa-x01': { race: 'hederaa', count: 0 },
        'mechan-x01': { race: 'mechan', count: 2 },
        'general-x01': { race: 'ubaidian', count: 0 },
        'general-x02': { race: 'ubaidian', count: 0 }
      };
  for(var chassis in iterator) {
    for(var i=0; i<iterator[chassis].count; i++) {
      this.generateRandomShip(chassis, iterator[chassis].race);
    }
  }
};

ShipManager.prototype.generatePirateShips = function() {
  var r1, r2,
      iterator = [
        { name: 'xinli', chassis: 'general-x01' },
        { name: 'mavero', chassis: 'general-x01' },
        { name: 'vega', chassis: 'general-x02' },
        { name: 'thak', chassis: 'general-x02' }
      ],
      len = iterator.length;

  // create pirates
  for(var j=0; j<3; j++) {
    r1 = (global.Math.random() * 2 - 1) * 4096;
    r2 = (global.Math.random() * 2 - 1) * 4096;
    for(var i=0; i<len; i++) {
      this.create({
        name: iterator[i].name,
        chassis: iterator[i].chassis,
        throttle: 1.0,
        ai: 'pirate',
        x: 2048 + r1,
        y: 2048 + r2
      });
    }
  }


  // zeus
  this.create({
    name: 'zeus',
    chassis: 'general-x03',
    throttle: 1.0,
    ai: 'pirate',
    x: -2048,
    y: 2048
  });


};

ShipManager.prototype.generateRandomShip = function(chassis, race, ai) {
  var name = Generator.getName(race).toUpperCase(),
      throttle = global.Math.random() * 0.5 + 0.5,
      ai = ai || 'basic';
      this.create({
        name: name,
        chassis: chassis,
        throttle: throttle,
        ai: ai
      });
};

ShipManager.prototype._updateShips = function() {
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
    this.sockets.io.sockets.emit('ship/data', {
      type: 'update', ships: updates
    });
  }
};

ShipManager.prototype._updateAI = function() {
  var ship,
      ships = this.ships;
  for(var s in ships) {
    ship = ships[s];
    ship.ai && ship.ai.update();
  }
};

ShipManager.prototype.getRandomShip = function() {
  var ships = this.ships,
      keys = Object.keys(ships),
      random = keys[Math.floor(keys.length * Math.random())];
  return ships[random];
};

ShipManager.prototype.generateRandomPosition = function(size) {
  var size = size || (global.Math.random() > 0.5 ? 2048 : 1024),
      halfSize = size/2,
      center = 2048,
      start = center - halfSize
      randX = global.Math.random() * size,
      randY = global.Math.random() * size;
  return new engine.Point(start + randX, start + randY);
};

module.exports = ShipManager;
