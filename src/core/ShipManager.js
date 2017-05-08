
var uuid = require('uuid'),
    engine = require('engine'),
    Ship = require('./objects/Ship'),
    AI = require('./AI')
    Utils = require('../utils'),
    Generator = require('../utils/Generator');

function ShipManager(game) {
  this.game = game;
  this.model = game.model;
  this.sockets = game.sockets.ioserver;

  this.ships = {};

  // ai manager
  this.ai = new AI(this);

  // internal
  this.game.on('ship/add', this.add, this);
  this.game.on('ship/remove', this.remove, this);
  this.game.on('ship/create', this.create, this);

  // networking
  this.game.on('ship/data', this.data, this);
  this.game.on('ship/plot', this.plot, this);
  this.game.on('ship/attack', this.attack, this);
  this.game.on('ship/disabled', this.disabled, this);
  this.game.on('ship/enhancement/start', this.enhancement.bind(this));

  this.game.on('squad/engageHostile', this.squad_engage, this);
  // activate ai
  this.game.clock.events.loop(1000, this.refresh, this);
};

ShipManager.prototype.constructor = ShipManager;

ShipManager.prototype.init = function() {
  // generate npcs
  this.generateRandomShips();
  this.generatePirateShips();
  this.generateScavengerShips();
  // this.generateSquadronShips();
};

ShipManager.prototype.add = function(ship) {
  if(this.ships[ship.uuid] === undefined) {
    this.ships[ship.uuid] = ship;
  }
};

ShipManager.prototype.remove = function(ship) {
  var s = this.ships[ship.uuid];
  if(s !== undefined) {
    delete this.ships[ship.uuid] && s.destroy();
  }
};

ShipManager.prototype.create = function(data, user, position) {
  var self = this, ship,
      rnd = this.game.rnd,
      position = position || this.generateRandomPosition(user ? 512 : 2048),
      data = Utils.extend({
        x: data.x || position.x,
        y: data.y || position.y,
        rotation: rnd.frac() * engine.Math.PI
      }, data);
  ship = new Ship(this, data);
  ship.user = user;
  if(ship.user){
    this.generateSquadronShips(ship.uuid)
  }
  ship.init(function(err) {
    self.game.emit('ship/add', ship);
  });
  return ship;
};

ShipManager.prototype.plot = function(socket, args) {
  var user = socket.request.session.user,
      data = args[1],
      ship = this.ships[data.uuid];
  if(ship && ship.user && ship.user.uuid === user.uuid) {
    ship.movement.plot(data.destination);
  }
};

ShipManager.prototype.attack = function(socket, args) {
  var ships = this.ships,
      sockets = this.sockets,
      user = socket.request.session.user,
      data = args[1],
      ship = ships[data.uuid];
  if(ship && ship.user && ship.user.uuid === user.uuid) {
    ship.attack(data, ship.user.rtt);
  }
};

ShipManager.prototype.squad_engage = function(socket, args){
  var ships = this.ships;
    // console.log(args[1])
    // console.log('player is ', args[1].player_id, 'target is ', args[1].target_id);
    for (var s in ships){
      ship = ships[s];
      // console.log('bumbaclot ', args[1])
      if(ship.chassis === 'squad-attack' && ship.master === args[1].player_id && ships[args[1].target_id]){
        var target = ships[args[1].target_id];
        // console.log(target)
        ship.ai.engage(target, 'attack');
      };
    };
}

ShipManager.prototype.enhancement = function(socket, args) {
  var ships = this.ships,
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

ShipManager.prototype.data = function(socket, args) {
  var ship,
      uuid, enhancements, hardpoints,
      uuids = args[1].uuids,
      user = socket.request.session.user,
      ships = [];

  for(var u in uuids) {
    ship = this.ships[uuids[u]];
    if(ship) {
      enhancements = Object.keys(ship.enhancements.available);
      hardpoints = ship.transferable.hardpoints,
      ships.push({
        x: ship.x,
        y: ship.y,
        uuid: ship.uuid,
        name: ship.data.name,
        user: ship.user ? ship.user.uuid : null,
        ai: ship.ai ? ship.ai.type : null,
        disabled: ship.disabled,
        username: ship.user ? ship.user.data.username : null,
        chassis: ship.chassis,
        sector: ship.data.sector,
        rotation: ship.movement.rotation,
        credits: ship.data.credits,
        reputation: ship.data.reputation,
        kills: ship.data.kills,
        disables: ship.data.disables,
        assists: ship.data.assists,
        durability: ship.durability,
        capacity: ship.capacity,
        size: ship.size,
        energy: ship.energy,
        recharge: ship.recharge,
        health: ship.health,
        heal: ship.heal,
        armor: ship.armor,
        rate: ship.rate,
        speed: ship.speed,
        critical: ship.critical,
        evasion: ship.evasion,
        hardpoints: hardpoints,
        enhancements: enhancements
      });
    }
  }
  socket.emit('ship/data', {
    type: 'sync', ships: ships
  });
};

ShipManager.prototype.update = function() {
  var data, ship, position, movement,
      ships = this.ships,
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
  this.sockets.emit('ship/sync', {
    ships: arr
  });
};

ShipManager.prototype.refresh = function() {
  var ship, delta,
      ships = this.ships,
      update, updates = [],
      stats;
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
    if(ship.disabled && ship.durability === 0){
      // console.log('queen?')
    }
  }
  if(updates.length > 0) {
    this.sockets.emit('ship/data', {
      type: 'update', ships: updates
    });
  }
};

ShipManager.prototype.disabled = function(data) {
  var game = this.game,
      ships = this.ships,
      sockets = this.sockets;

  sockets.emit('ship/disabled', data);
};

ShipManager.prototype.generateRandomShips = function() {
  var iterator = {
        'mechan-x01': { race: 'mechan', count: 0 },
        'mechan-x02': { race: 'mechan', count: 0 },
        'mechan-x03': { race: 'mechan', count: 0 },
        'ubaidian-x01a': { race: 'ubaidian', count: 1 },
        'ubaidian-x01b': { race: 'ubaidian', count: 1 },
        'ubaidian-x01c': { race: 'ubaidian', count: 0 },
        'ubaidian-x01d': { race: 'ubaidian', count: 0 },
        'ubaidian-x01e': { race: 'ubaidian', count: 0 },
        'ubaidian-x02': { race: 'ubaidian', count: 0 },
        'ubaidian-x03': { race: 'ubaidian', count: 0 },
        'ubaidian-x04': { race: 'ubaidian', count: 2 },
        'mechan-x01': { race: 'mechan', count: 0 },
        'mechan-x02': { race: 'mechan', count: 0 },
        'mechan-x03': { race: 'mechan', count: 0 },
        'general-x01': { race: 'ubaidian', count: 0 },
        'general-x02': { race: 'ubaidian', count: 0 },
        'enforcers-x01': { race: 'ubaidian', count: 2 },
        'enforcers-x02': { race: 'ubaidian', count: 0 }
      };
  for(var chassis in iterator) {
    for(var i=0; i<iterator[chassis].count; i++) {
      this.generateRandomShip(chassis, iterator[chassis].race);
    }
  }
};

ShipManager.prototype.generatePirateShips = function() {
  var base, ship,
      iterator = [{
        location: { x: -4096, y: 2048 },
        ships: [
          { name: 'xinli', chassis: 'pirate-x02', credits: 1500, reputation: -100 },
          { name: 'mocolo', chassis: 'pirate-x02', credits: 1500, reputation: -100 },
          { name: 'mavero', chassis: 'pirate-x02', credits: 1500, reputation: -100 },
          { name: 'saag', chassis: 'pirate-x02', credits: 1500, reputation: -100 } 
        ]
      }, {
        location: { x: 8192, y: 2048 },
        ships: [
          { name: 'satel', chassis: 'pirate-x01', credits: 1500, reputation: -100 },
          { name: 'oeem', chassis: 'pirate-x01', credits: 1500, reputation: -100 },
          { name: 'thath', chassis: 'pirate-x02', credits: 1500, reputation: -100 },
          { name: 'zeus', chassis: 'pirate-x03b', credits: 1500, reputation: -100 }
        ]
      }, {
        location: { x: 2048, y: -6144 },
        ships: [
          { name: 'manduk', chassis: 'pirate-x01', credits: 1500, reputation: -100 },
          { name: 'deuh', chassis: 'pirate-x01', credits: 1500, reputation: -100 },
          { name: 'talai', chassis: 'pirate-x01', credits: 1500, reputation: -100 },
          { name: 'kaan', chassis: 'pirate-x03b', credits: 1500, reputation: -100 }
        ]
      }, {
        location: { x: 2048, y: 8192 },
        ships: [
          // { name: 'theni', chassis: 'pirate-x01', credits: 1500, reputation: -100 },
          // { name: 'zulu', chassis: 'pirate-x01', credits: 1500, reputation: -100 },
          // { name: 'saroc', chassis: 'pirate-x02', credits: 1500, reputation: -100 },
          // { name: 'malvo', chassis: 'pirate-x02', credits: 1500, reputation: -100 },
          // { name: 'mocolo', chassis: 'pirate-x02', credits: 1500, reputation: -100 },
          // { name: 'mavero', chassis: 'pirate-x02', credits: 1500, reputation: -100 },
          { name: 'saag', chassis: 'pirate-x02', credits: 1500, reputation: -100 }
        ]
      }],
      len = iterator.length;

  // create pirates
  for(var i=0; i<len; i++) {
    base = iterator[i];
    for(var s=0; s<base.ships.length; s++) {
      ship = base.ships[s];

      this.create({
        name: ship.name,
        chassis: ship.chassis,
        credits:  global.Math.floor(ship.credits * global.Math.random() + 100),
        reputation: global.Math.floor(ship.reputation * (1 + global.Math.random())),
        throttle: 1.0,
        ai: 'pirate',
        x: base.location.x,
        y: base.location.y
      });
    }
  }
};

ShipManager.prototype.generateScavengerShips = function() {
  var base, ship,
      iterator = [{
        location: { x: -8192, y: 8192 },
        ships: [
          { name: 'saaghath', chassis: 'scavengers-x02c', credits: 1500, reputation: -100 },
          { name: 'mocolo', chassis: 'scavengers-x01d', credits: 1500, reputation: -100 },
          { name: 'fenris', chassis: 'scavengers-x02c', credits: 1500, reputation: -100 },
          { name: 'zozu', chassis: 'scavengers-x01d', credits: 1500, reputation: -100 },
          { name: 'thovu', chassis: 'scavengers-x02c', credits: 1500, reputation: -100 },
          { name: 'wivero', chassis: 'scavengers-x02c', credits: 1500, reputation: -100 }
        ]
      }],
      len = iterator.length;

  // create scavengers
  for(var i=0; i<len; i++) {
    base = iterator[i];
    for(var s=0; s<base.ships.length; s++) {
      ship = base.ships[s];

      this.create({
        name: ship.name,
        chassis: ship.chassis,
        credits:  global.Math.floor(ship.credits * global.Math.random() + 100),
        reputation: global.Math.floor(ship.reputation * (1 + global.Math.random())),
        throttle: 1.0,
        ai: 'scavenger',
        x: base.location.x,
        y: base.location.y
      });
    }
  }
};

ShipManager.prototype.spawnQueen = function(){
  console.log(' SHIP  manager SPAWN QUEEN')
  this.create({
    name: 'ScavengerQueen',
    chassis: 'scavengers-x04d',
    throttle: 1.0,
    ai: 'scavenger',
    credits: global.Math.floor(global.Math.random() * 250 + 50),
    reputation: global.Math.floor(100 * (1 + global.Math.random()))
  });
};

ShipManager.prototype.generateSquadronShips = function(uuid) {
  var base, ship,
      iterator = [{
        location: { x: -2048, y: 2048 },
        ships: [
          { name: 'redOne', chassis: 'squad-attack', credits: 1500, reputation: -100 },
          { name: 'redTwo', chassis: 'squad-attack', credits: 1500, reputation: -100 },
          { name: 'redThree', chassis: 'squad-attack', credits: 1500, reputation: -100 }
          // { name: 'redFour', chassis: 'squad-attack', credits: 1500, reputation: -100 },
          // { name: 'redFive', chassis: 'squad-attack', credits: 1500, reputation: -100 }
        ]
      }],
      len = iterator.length;

  // create ships
  for(var i=0; i<len; i++) {
    base = iterator[i];
    for(var s=0; s<base.ships.length; s++) {
      ship = base.ships[s];

      this.create({
        name: ship.name,
        chassis: ship.chassis,
        credits:  global.Math.floor(ship.credits * global.Math.random() + 100),
        reputation: global.Math.floor(ship.reputation * (1 + global.Math.random())),
        throttle: 1.0,
        ai: 'squadron',
        x: base.location.x,
        y: base.location.y,
        master: uuid
      });
    }
  }
};

ShipManager.prototype.generateRandomShip = function(chassis, race, ai) {
  var name = Generator.getName(race).toUpperCase(),
      throttle = global.Math.random() * 0.5 + 0.5,
      ai = ai || 'basic';

  this.create({
    name: name,
    chassis: chassis,
    throttle: throttle,
    ai: ai,
    credits: global.Math.floor(global.Math.random() * 250 + 50),
    reputation: global.Math.floor(100 * (1 + global.Math.random()))
  });
};

ShipManager.prototype.generateRandomPosition = function(size) {
  var game = this.game,
      size = size || game.rnd.between(1024, 2048),
      start = 2048 - (size/2),
      x = game.rnd.frac() * size,
      y = game.rnd.frac() * size;
  return new engine.Point(start + x, start + y);
};

module.exports = ShipManager;
