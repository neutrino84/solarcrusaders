
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
  this.battles = {};
  this.count = {};

  this.game.on('ship/add', this.add, this);
  this.game.on('ship/remove', this.remove, this);
  this.game.on('ship/create', this.create, this);

  // activate ai
  this.game.clock.events.loop(1000, this._updateShips, this);
  this.game.clock.events.loop(1000, this._updateBattles, this);
  this.game.clock.events.loop(3000, this._updateAI, this);
};

ShipManager.prototype.constructor = ShipManager;

ShipManager.prototype.init = function() {
  var self = this;

  // io router
  this.sockets.iorouter.on('ship/data', this.data.bind(this));
  this.sockets.iorouter.on('ship/plot', this.plot.bind(this));
  this.sockets.iorouter.on('ship/target', this.target.bind(this));
  this.sockets.iorouter.on('enhancement/start', this.enhancement.bind(this));

  // generate npcs
  this.generateRandomShips();
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

ShipManager.prototype.remove = function(ship) {
  ship = this.ships[ship.uuid];
  if(ship !== undefined) {
    delete this.ships[ship.uuid] && ship.destroy();

    this.count[ship.chassis] && this.count[ship.chassis]--;
    this.sockets.io.sockets.emit('ship/destroyed', {
      uuid: ship.uuid
    });
  }
};

ShipManager.prototype.target = function(sock, args, next) {
  var user = sock.sock.handshake.session.user,
      data = args[1],
      ship = this.ships[data.origin],
      target = this.ships[data.target];
  if(target && ship && ship.user && ship.user.uuid === user.uuid) {
    this.battles[data.origin] = data;
    this.sockets.io.sockets.emit('ship/targeted', data);
  }
};

ShipManager.prototype.enhancement = function(sock, args, next) {
  var user = sock.sock.handshake.session.user,
      data = args[1],
      ship = this.ships[data.ship];
  if(ship && ship.user && ship.user.ship === user.ship) {
    if(!ship.activate(data.enhancement)) {
      sock.emit('enhancement/cancelled', {
        ship: data.ship,
        enhancement: data.enhancement
      });
    }
  }
};

ShipManager.prototype.plot = function(sock, args, next) {
  var user = sock.sock.handshake.session.user,
      data = args[1],
      ship = this.ships[data.uuid];
  if(ship && ship.user && ship.user.uuid === user.uuid) {
    this._plot(ship, data.destination, data.current, data.previous);
  }
};

ShipManager.prototype.data = function(sock, args, next) {
  var self = this, ship, enhancements,
      uuids = args[1].uuids,
      ships = [];
  for(var u in uuids) {
    ship = this.ships[uuids[u]];
    if(ship) {
      ship.ignoreEnhancements = true;
      enhancements = Object.keys(ship.enhancements.available);
      ships.push({
        id: ship.id,
        uuid: ship.uuid,
        user: ship.user ? ship.user.uuid : null,
        username: ship.user ? ship.user.username : null,
        chassis: ship.chassis,
        sector: ship.sector,
        x: ship.x,
        y: ship.y,
        throttle: ship.throttle,
        rotation: ship.rottion,
        durability: ship.durability,
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
        systems: ship.systems,
        hardpoints: ship.hardpoints,
        enhancements: enhancements
      });
      ship.ignoreEnhancements = false;
    }
  }
  sock.emit('ship/data', {
    type: 'sync', ships: ships
  });
};

ShipManager.prototype.update = function() {
  var data, ship, movement, moving,
      ships = this.ships,
      arr = [];
  for(var s in ships) {
    ship = ships[s];
    movement = ship.movement;
    movement.update();
    moving = movement.animation.isPlaying;
    data = {
      uuid: ship.uuid,
      throttle: ship.throttle,
      rotation: ship.rotation,
      current: movement.current,
      moving: moving
    };
    if(moving) {
      data.previous = movement.previous;
      data.destination = movement.destination;
    }
    arr.push(data);
  }
  this.sockets.io.sockets.emit('ship/sync', {
    ships: arr
  });
};

ShipManager.prototype.generateRandomShips = function() {
  var chassis, name,
      iterator = {
        'ubaidian-x01': { race: 'ubaidian', count: 1 },
        'hederaa-x01': { race: 'hederaa', count: 1 }
      };
  for(chassis in iterator) {
    name = Generator.getName(iterator[chassis].race);
    for(var i=0; i<iterator[chassis].count; i++) {
      this.generateRandomShip(name, chassis);
    }
  }
};

ShipManager.prototype.generateRandomShip = function(name, chassis, position) {
  var self = this,
      position = position || this._generateRandomPosition(),
      shipModel = new this.model.Ship({
        name: name,
        chassis: chassis,
        x: position.x,
        y: position.y
      }),
      ship = new Ship(this, shipModel);
      ship.init(function(err) {
        self.add(ship);
      });
};

ShipManager.prototype._plot = function(ship, destination, current, previous) {
  var previous, current,
      movement = ship.movement;
  movement.update();
  current = current || movement.current;
  previous = previous || movement.previous;
  movement.plot(destination, current, previous);
  this.sockets.io.sockets.emit('ship/plotted', {
    uuid: ship.uuid,
    destination: destination,
    throttle: ship.throttle,
    rotation: ship.rotation,
    current: current,
    previous: previous
  });
};

ShipManager.prototype._updateShips = function() {
  var ship, delta,
      ships = this.ships,
      update, updates = [],
      stats;
  for(var s in ships) {
    ship = ships[s];
    stats = ship.config.stats;
    update = { uuid: ship.uuid };

    // update health
    if(ship.health < stats.health) {
      delta = ship.health * ship.heal;
      ship.health = global.Math.min(stats.health, ship.health + delta);
      update.health = global.Math.round(ship.health);
      update.hdelta = global.Math.round(delta);
    }

    // update energy
    if(ship.energy < stats.energy) {
      delta = ship.recharge;
      ship.energy = global.Math.min(stats.energy, ship.energy + delta);
      update.energy = global.Math.round(ship.energy);
      update.rdelta = global.Math.round(delta);
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

ShipManager.prototype._updateBattles = function() {
  var battle, origin, target, distance, delta,
      accuracy, evasion, system,
      battles = this.battles,
      update, updates = [];
  for(var b in battles) {
    battle = battles[b];
    origin = this.ships[battle.origin];
    target = this.ships[battle.target];

    // check exist
    if(origin && target) {
      distance = origin.position.distance(target.position);

      if(distance > origin.range) { continue; } // weapons out of range
      
      accuracy = origin.accuracy;
      evasion = target.evasion;

      if(global.Math.random() <= accuracy && global.Math.random() >= evasion) {
        //.. hit
        delta = global.Math.round((global.Math.random() * origin.damage) + (origin.damage / 2));
        delta = global.Math.max(0, delta - target.armor);
        
        target.health = global.Math.max(0, target.health - delta);

        update = { uuid: target.uuid };
        update.health = target.health; // weapon damage

        system = target.systems[battle.room];

        if(battle.room && system) {
          system.health = global.Math.max(0, system.health - delta);

          update.systems = {};
          update.systems[battle.room] = {
            health: system.health
          };

          // switch(battle.room) {
          //   case 'engine':
          //     update.speed = target.speed;
          //     update.throttle = target.throttle;
          //     // target.throttle = 1.0;
          //     target.movement.reset();
          //     if(target.movement.animation.isPlaying) {
          //       target.movement.update();
          //       target.movement.plot();
          //     }
          //     break;
          // }
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
          if(target.user === undefined) {
            this.create({
              chassis: target.chassis
            });
          }
          this.remove(target);
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
  var b, battle, random, ship, room, health,
      destination, origin,
      game = this.game,
      ships = this.ships, target,
      arr = [];
  for(var s in ships) {
    ship = ships[s];
    b = this.battles[ship.uuid];
    
    if(!ship.user) { // && global.Math.random() > 0.5) {
      destination = this._generateRandomPosition();
      
      // (function(game, manager, ship, destination) {
      //   var time = global.Math.floor(global.Math.random() * 10000);
      //   game.clock.events.add(time, function() {
          // if(manager.ships[ship.uuid]) {
            this._plot(ship, destination);
          // }
      //   });
      // })(game, this, ship, destination);

      random = this._getRandomShip();
      if(random !== ship) { // && global.Math.random() > 0.5) {
        target = ships[random.uuid];
        if(target && ship.damage > 0) {
          room = global.Math.floor(global.Math.random() * target.rooms.length);
          battle = { origin: ship.uuid, target: target.uuid, id: room, room: target.rooms[room].system };
          this.sockets.io.sockets.emit('ship/targeted', battle);
          this.battles[ship.uuid] = battle;
        }
      }
    } else if(ship.user && b) {
      target = this.ships[b.target];
      if(target && !target.user) {
        health = target.health / target.config.stats.health;
        if(target.systems['targeting']) {
          if(!this.battles[target.uuid] || this.battles[target.uuid].target !== ship.uuid) {
            room = global.Math.floor(global.Math.random() * ship.rooms.length);
            battle = { origin: target.uuid, target: ship.uuid, id: room, room: ship.rooms[room].system };
            this.sockets.io.sockets.emit('ship/targeted', battle);
            this.battles[target.uuid] = battle;
          }
        }
        // if(target.systems['shield'] && health < 0.90) {
        //   target.activate('shield');
        // }
        if(target.systems['engine'] && health < 0.5) {
          target.activate('booster');
        }
        // if(target.systems['reactor'] && health < 0.2) {
        //   target.activate('overload');
        // }
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

ShipManager.prototype._generateRandomPosition = function(size) {
  var size = size || (global.Math.random() > 0.5 ? 4096 : 1024),
      halfSize = size/2,
      randX = global.Math.random() * size - halfSize,
      randY = global.Math.random() * size - halfSize;
  return new engine.Point(halfSize + randX, halfSize + randY);
};

module.exports = ShipManager;
