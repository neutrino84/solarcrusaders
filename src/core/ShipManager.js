
var uuid = require('uuid'),
    engine = require('engine'),
    client = require('client'),
    Ship = require('./objects/Ship'),
    Utils = require('../utils');

function ShipManager(game) {
  this.game = game;
  this.model = game.model;
  this.winston = game.winston;
  this.sockets = game.sockets;
  this.iorouter = game.sockets.iorouter;

  this.ships = {};
  this.battles = {};

  this.game.on('ship/add', this.add, this);
  this.game.on('ship/remove', this.remove, this);
  this.game.on('ship/create', this.create, this);

  // activate ai
  this.game.clock.events.loop(1000, this._updateShips, this);
  this.game.clock.events.loop(1000, this._updateBattles, this);
  this.game.clock.events.loop(10000, this._updateAI, this);
};

ShipManager.prototype.constructor = ShipManager;

ShipManager.prototype.init = function() {
  var self = this;

  // io router
  this.sockets.iorouter.on('ship/data', this.data.bind(this));
  this.sockets.iorouter.on('ship/plot', this.plot.bind(this));
  this.sockets.iorouter.on('ship/target', this.target.bind(this));

  // generate npcs
  this.generateRandomShips();
};

ShipManager.prototype.add = function(ship) {
  if(!this.ships[ship.uuid]) {
    this.ships[ship.uuid] = new Ship(this, ship);
  }
};

ShipManager.prototype.remove = function(ship) {
  var s;
  if(this.ships[ship.uuid]) {
    s = this.ships[ship.uuid];
    delete this.ships[ship.uuid] && s.destroy();
    this.sockets.io.sockets.emit('ship/destroyed', {
      uuid: ship.uuid
    });
  }
};

ShipManager.prototype.create = function(ship, position) {
  var s = this.model.ship,
      def = s.createDefaultData();
  switch(position) {
    default:
    case 'random':
      position = this._generateRandomPositionInView();
    case Object:
      ship.x = position.x;
      ship.y = position.y;
      break;
  }
  this.add(Utils.extend(ship, def, false));
};

ShipManager.prototype.target = function(sock, args, next) {
  var user = sock.sock.handshake.session.user,
      s = args[1],
      ship = this.ships[s.origin],
      target = this.ships[s.target];
  if(target && ship && ship.user && ship.user.uuid === user.uuid) {
    this.battles[s.origin] = s;
    this.sockets.io.sockets.emit('ship/targeted', s);
  }
};

ShipManager.prototype.plot = function(sock, args, next) {
  var user = sock.sock.handshake.session.user,
      s = args[1],
      destination = s.destination,
      ship = this.ships[s.uuid],
      point = new engine.Point(destination.x, destination.y);
  if(ship && ship.user && ship.user.uuid === user.uuid) {
    this._plot(ship, destination);
  }
};

ShipManager.prototype.data = function(sock, args, next) {
  var self = this, ship,
      uuids = args[1].uuids,
      ships = [];
  for(var u in uuids) {
    ship = this.ships[uuids[u]];
    if(ship) {
      ships.push({
        id: ship.id,
        uuid: ship.uuid,
        user: ship.user ? ship.user.uuid : null,
        username: ship.user ? ship.user.username : null,
        chasis: ship.chasis,
        sector: ship.sector,
        x: ship.x,
        y: ship.y,
        throttle: ship.throttle,
        rotation: ship.rottion,
        systems: ship.systems,
        health: ship.health,
        speed: ship.speed
      });
    }
  }
  sock.emit('ship/data', {
    type: 'sync', ships: ships
  });
};

ShipManager.prototype.update = function() {
  var ship, previous, movement,
      ships = this.ships,
      arr = [];
  for(var s in ships) {
    ship = ships[s];
    movement = ship.movement;
    movement.update();
    movement.startPosition = ship.position.clone();
    previous = movement.previous;
    arr.push({
      uuid: ship.uuid,
      throttle: ship.throttle,
      rotation: ship.rotation,
      previous: previous,
      current: movement.startPosition,
      destination: movement.destination,
      moving: movement.animation.isPlaying
    });
  }
  this.sockets.io.sockets.emit('ship/sync', {
    ships: arr
  });
};

ShipManager.prototype.generateRandomShips = function() {
  var iterator = {
        'vessel-x01': { count: 1 },
        'vessel-x02': { count: 1 },
        'vessel-x03': { count: 3 },
        'vessel-x04': { count: 10 },
        'vessel-x05': { count: 10 }
      };
  for(var key in iterator) {
    for(var i=0; i<iterator[key].count; i++) {
      this.generateShip(key);
    }
  }

  // start ai
  this._updateAI()
};

ShipManager.prototype.generateRandomShip = function() {
  var rnd = global.Math.random(),
      chassis;
  if(rnd < 0.04) {
    chassis = 'vessel-x01';
  } else if(rnd < 0.08) {
    chassis = 'vessel-x02';
  } else if(rnd < 0.12) {
    chassis = 'vessel-x03';
  } else if(rnd < 0.60) {
    chassis = 'vessel-x04';
  } else {
    chassis = 'vessel-x05';
  }
  this.generateShip(chassis);
};

ShipManager.prototype.generateShip = function(chassis) {
  this.create({
    rotation: global.Math.random() * global.Math.PI,
    chasis: chassis,
    throttle: 1.0 + (global.Math.random() * 3)
  });
};

ShipManager.prototype._plot = function(ship, destination) {
  var previous,
      movement = ship.movement;
  movement.update();
  movement.startPosition = ship.position.clone();
  previous = movement.previous;
  movement.plot(destination, movement.startPosition, previous);
  this.sockets.io.sockets.emit('ship/plotted', {
    uuid: ship.uuid,
    destination: destination,
    throttle: ship.throttle,
    rotation: ship.rotation,
    current: movement.startPosition,
    previous: previous
  });
};

ShipManager.prototype._updateShips = function() {
  var ship, delta,
      ships = this.ships,
      update, updates = [];
  for(var s in ships) {
    ship = ships[s];
    if(ship.health < ship.config.stats.health) {
      delta = ship.health * ship.heal;
      ship.health += delta;
      update = { uuid: ship.uuid, health: ship.health, amount: delta };
      updates.push(update);
    }
  }
  if(updates.length > 0) {
    this.sockets.io.sockets.emit('ship/data', {
      type: 'update', ships: updates
    });
  }
};

ShipManager.prototype._updateBattles = function() {
  var battle, origin, target, distance, delta,
      accuracy, evasion,
      battles = this.battles,
      update, updates = [];
  for(var b in battles) {
    battle = battles[b];
    origin = this.ships[battle.origin];
    target = this.ships[battle.target];

    // check exist
    if(origin && target) {
      distance = origin.position.distance(target.position);

      if(distance > 384) { continue; } // weapons out of range
      
      accuracy = origin.accuracy;
      evasion = target.evasion;

      if(global.Math.random() <= accuracy && global.Math.random() >= evasion) {
        //.. hit
        delta = global.Math.floor(global.Math.random() * 7.5 + 2.5);
        update = { uuid: target.uuid };
        update.health = target.health = target.health - delta; // weapon damage

        if(battle.room && target.systems[battle.room]) {
          update.systems = {};
          update.systems[battle.room] = {
            health: global.Math.max(0, target.systems[battle.room].health - 20)
          };
          target.systems[battle.room].health = update.systems[battle.room].health;
        }

        this.sockets.io.sockets.emit('ship/attack', {
          type: 'hit',
          id: battle.id,
          room: battle.room,
          origin: origin.uuid,
          target: target.uuid,
          damage: delta
        });
        
        // destroy ship
        if(target.health <= 0) {
          this.remove(target);
          this.generateRandomShip();
        } else {
          updates.push(update);
        }
      } else {
        //.. miss
        this.sockets.io.sockets.emit('ship/attack', {
          type: 'miss',
          id: battle.id,
          room: battle.room,
          origin: origin.uuid,
          target: target.uuid
        });
      }
    } else {
      delete this.battles[b];
    }
  }
  if(updates.length > 0) {
    this.sockets.io.sockets.emit('ship/data', {
      type: 'update', ships: updates
    });
  }
};

ShipManager.prototype._updateAI = function() {
  var b, battle, random, ship, room,
      destination, origin,
      ships = this.ships, target,
      arr = [];
  for(var s in ships) {
    ship = ships[s];
    b = this.battles[ship.uuid];
    
    if(!ship.user && global.Math.random() > 0.5) {
      destination = this._generateRandomPosition();
      this._plot(ship, destination);
      random = this._getRandomShip();
      if(random !== ship && global.Math.random() > 0.5) {
        switch(ship.chasis) {
          case 'vessel-x01':
          case 'vessel-x02':
          case 'vessel-x03':
          // case 'vessel-x04':
          case 'vessel-x05':
            target = ships[random.uuid];
            if(target) {
              room = global.Math.floor(global.Math.random() * target.rooms.length);
              battle = { origin: ship.uuid, target: target.uuid, id: room, room: target.rooms[room].system };
              this.sockets.io.sockets.emit('ship/targeted', battle);
              this.battles[ship.uuid] = battle;
            }
            break;
          default: break;
        }
      }
    } else if(ship.user && b) {
      target = this.ships[b.target];
      if(target && !target.user && target.systems['targeting']) {
        room = global.Math.floor(global.Math.random() * ship.rooms.length);
        battle = { origin: target.uuid, target: ship.uuid, id: room, room: ship.rooms[room].system };
        this.sockets.io.sockets.emit('ship/targeted', battle);
        this.battles[target.uuid] = battle;
      }
    }
  }
};

ShipManager.prototype._getRandomShip = function() {
  var ships = this.ships,
      keys = Object.keys(ships),
      random = keys[Math.floor(keys.length * Math.random())];
  return ships[random];
};

ShipManager.prototype._generateRandomPositionInView = function() {
  // for debug purposes only
  var randX = global.Math.random() * 768 - 384,
      randY = global.Math.random() * 768 - 384;
  return new engine.Point(2048 + randX, 2048 + randY);
};

ShipManager.prototype._generateRandomPosition = function() {
  var randX = global.Math.random() * 4096 - 2048,
      randY = global.Math.random() * 4096 - 2048;
  return new engine.Point(2048 + randX, 2048 + randY);
};

module.exports = ShipManager;
