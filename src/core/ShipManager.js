
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
  this.game.clock.events.loop(2500, this._updateAI, this);
};

ShipManager.prototype.constructor = ShipManager;

ShipManager.prototype.init = function() {
  var self = this;

  // io router
  this.sockets.iorouter.on('ship/data', this.data.bind(this));
  this.sockets.iorouter.on('ship/plot', this.plot.bind(this));
  this.sockets.iorouter.on('ship/target', this.target.bind(this));
  this.sockets.iorouter.on('enhancement/start', this.enhancement.bind(this));
  this.sockets.iorouter.on('ship/canister', this.canister.bind(this));

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
      position = position || this.generateRandomPosition(user ? 1024 : 4096),
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

ShipManager.prototype.canister = function(sock, args, next) {
  var user = sock.sock.handshake.session.user,
      data = args[1],
      ship = this.ships[data.uuid];
  if(ship && ship.user && ship.user.ship === user.ship) {
    ship.user.data.credits += 10000;
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
    this._plot(ship, data.destination, data.current, data.previous);
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
        'ubaidian-x01': { race: 'ubaidian', count: 1 },
        'ubaidian-x02': { race: 'ubaidian', count: 1 },
        'ubaidian-x03': { race: 'ubaidian', count: 1 },
        'ubaidian-x04': { race: 'ubaidian', count: 4 },
        'hederaa-x01': { race: 'hederaa', count: 1 },
        'mechan-x01': { race: 'mechan', count: 3 },
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
  var iterator = [
        { name: 'roofus', chassis: 'general-x01' },
        { name: 'bobby', chassis: 'general-x01' },
        { name: 'crayford', chassis: 'general-x01' },
        { name: 'cage', chassis: 'general-x02' },
        { name: 'thak', chassis: 'general-x03' }
      ],
      len = iterator.length;

  // create pirate
  for(var i=0; i<len; i++) {
    this.create({
      name: iterator[i].name,
      chassis: iterator[i].chassis,
      throttle: 1.0,
      ai: 'pirate',
      x: -2048, y: 2048
    });
  }
};

ShipManager.prototype.generateRandomShip = function(chassis, race, ai) {
  var name = Generator.getName(race).toUpperCase(),
      throttle = global.Math.random() * 1.5 + 0.75,
      ai = ai || 'basic';
      this.create({
        name: name,
        chassis: chassis,
        throttle: throttle,
        ai: ai
      });
};

ShipManager.prototype._plot = function(ship, destination, current, previous) {
  var previous, current,
      movement = ship.movement;
  movement.update();
  current = current || movement.current;
  previous = previous || movement.previous;
  movement.plot(destination, current, previous);
  movement.valid && this.sockets.io.sockets.emit('ship/plotted', {
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
      delta = ship.heal;
      ship.health = global.Math.min(stats.health, ship.health + delta);
      update.health = engine.Math.roundTo(ship.health, 1);
      update.hdelta = engine.Math.roundTo(delta, 1);
    }

    // re-enable ship
    if(ship.disabled && ship.health >= 3) {
      ship.disabled = false;
    }

    // update energy
    if(ship.energy < stats.energy) {
      delta = ship.recharge;
      ship.energy = global.Math.min(stats.energy, ship.energy + delta);
      update.energy = engine.Math.roundTo(ship.energy, 1);
      update.rdelta = engine.Math.roundTo(delta, 1);
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
      accuracy, evasion, system, credits,
      battles = this.battles,
      update, updates = [];
  for(var b in battles) {
    battle = battles[b];
    origin = this.ships[battle.origin];
    target = this.ships[battle.target];

    // check exist
    if(origin && target && !target.disabled) {
      // calculate distance
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
          // stop movement
          target.movement.animation.stop();

          // disable
          this.sockets.io.sockets.emit('ship/disabled', {
            origin: origin.uuid,
            target: target.uuid
          });

          // award credits
          if(origin.user) {
            credits = target.config.stats.health * 100;
            origin.user.data.credits += global.Math.round(global.Math.random() * credits + credits);
            this.game.emit('user/data', origin.user, {
              credits: origin.user.data.credits
            });
          }

          // spawn npc
          if(target.ai) {
            if(target.ai.type === 'basic') {
              this.generateRandomShip(target.chassis, target.data.race);
            }
            this.game.emit('ship/remove', target);
          } else {
            // penalize
            update.disables = ++target.data.disables;
            target.disabled = true;
          }

          // award kill
          updates.push({
            uuid: origin.uuid,
            kills: ++origin.data.kills
          });

          // award assists
          // for(var bat in battles) {
          //   if(battles[bat]) {
          //     //..
          //   }
          // }

          // end battle
          delete this.battles[origin.uuid];
          delete this.battles[target.uuid];
        }

        // push updates
        updates.push(update);
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
  var ship, battle, target,
      ships = this.ships,
      battles = this.battles;
  for(var s in ships) {
    ship = ships[s];
    ship.ai && ship.ai.update();

    battle = battles[ship.uuid];

    if(battle && battle.target) {
      target = ships[battle.target];
      target && target.ai && target.ai.defence(battle);
    }
  }
};

ShipManager.prototype.getRandomShip = function() {
  var ships = this.ships,
      keys = Object.keys(ships),
      random = keys[Math.floor(keys.length * Math.random())];
  return ships[random];
};

ShipManager.prototype.generateRandomPosition = function(size) {
  var size = size || (global.Math.random() > 0.5 ? 4096 : 2048),
      halfSize = size/2,
      center = 2048,
      start = center - halfSize
      randX = global.Math.random() * size,
      randY = global.Math.random() * size;
  return new engine.Point(start + randX, start + randY);
};

module.exports = ShipManager;
