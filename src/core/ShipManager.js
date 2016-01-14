
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
  this.count = {};

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
  this.sockets.iorouter.on('enhancement/start', this.enhancement.bind(this));

  // generate npcs
  this.generateRandomShips();
};

ShipManager.prototype.add = function(ship) {
  if(!this.ships[ship.uuid]) {
    this.ships[ship.uuid] = new Ship(this, ship);
    if(this.count[ship.chasis]) {
      this.count[ship.chasis]++;
    } else {
      this.count[ship.chasis] = 1;
    }
  }
};

ShipManager.prototype.remove = function(ship) {
  var s;
  if(this.ships[ship.uuid]) {
    s = this.ships[ship.uuid];

    delete this.ships[ship.uuid] && s.destroy();

    this.count[ship.chasis] && this.count[ship.chasis]--;
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
      position = ship.user || global.Math.random() > 0.5 ?
        this._generateRandomPositionInView() :
        this._generateRandomPosition();
    case Object:
      ship.x = position.x;
      ship.y = position.y;
      break;
  }
  this.add(Utils.extend(ship, def, false));
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
      enhancements = Object.keys(ship.enhancements.available);
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
        speed: ship.speed,
        recharge: ship.recharge,
        hardpoints: ship.hardpoints,
        enhancements: enhancements
      });
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
  var iterator = {
        'vessel-x01': { count: 2 },
        'vessel-x02': { count: 2 },
        'vessel-x03': { count: 2 },
        'vessel-x04': { count: 10 },
        'vessel-x05': { count: 5 }
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
  if(rnd < 0.04 && this.count['vessel-x01'] === 2) {
    chassis = 'vessel-x01';
  } else if(rnd < 0.08 && this.count['vessel-x02'] === 0) {
    chassis = 'vessel-x02';
  } else if(rnd < 0.12 && this.count['vessel-x03'] === 2) {
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
      update, updates = [];
  for(var s in ships) {
    ship = ships[s];
    update = { uuid: ship.uuid };

    // update health
    if(ship.health < ship.config.stats.health) {
      delta = ship.health * ship.heal;
      ship.health = global.Math.min(ship.config.stats.health, ship.health + delta);
      update.health = global.Math.round(ship.health);
      update.hdelta = global.Math.round(delta);
    }

    // update reactor
    if(ship.reactor < ship.config.stats.reactor) {
      delta = ship.recharge;
      ship.reactor = global.Math.min(ship.config.stats.reactor, ship.reactor + delta);
      update.reactor = global.Math.round(ship.reactor);
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

          switch(battle.room) {
            case 'engine':
              update.speed = target.speed;
              update.throttle = target.throttle;
              // target.throttle = 1.0;
              target.movement.reset();
              if(target.movement.animation.isPlaying) {
                target.movement.update();
                target.movement.plot();
              }
              break;
          }
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
  var b, battle, random, ship, room, health,
      destination, origin,
      game = this.game,
      ships = this.ships, target,
      arr = [];
  for(var s in ships) {
    ship = ships[s];
    b = this.battles[ship.uuid];
    
    if(!ship.user && global.Math.random() > 0.5) {
      destination = global.Math.random() > 0.5 ?
        this._generateRandomPositionInView() :
        this._generateRandomPosition();
      
      (function(game, manager, ship, destination) {
        var time = global.Math.floor(global.Math.random() * 10000);
        game.clock.events.add(time, function() {
          if(manager.ships[ship.uuid]) {
            manager._plot(ship, destination);
          }
        });
      })(game, this, ship, destination);
      
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
        if(target.systems['shield'] && health < 0.90) {
          target.activate('shield');
        }
        if(target.systems['engine'] && health < 0.5) {
          target.activate('booster');
        }
        if(target.systems['reactor'] && health < 0.2) {
          target.activate('overload');
        }
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
  var randX = global.Math.random() * 1024 - 512,
      randY = global.Math.random() * 1024 - 512;
  return new engine.Point(2048 + randX, 2048 + randY);
};

ShipManager.prototype._generateRandomPosition = function() {
  var randX = global.Math.random() * 4096 - 2048,
      randY = global.Math.random() * 4096 - 2048;
  return new engine.Point(2048 + randX, 2048 + randY);
};

module.exports = ShipManager;
