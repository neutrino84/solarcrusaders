
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
  this.game.clock.events.loop(1000, this._updateBattles, this);
  this.game.clock.events.loop(10000, this._updateAI, this) && this._updateAI();
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
      ship = this.ships[s.origin];
  if(ship && ship.user && ship.user.uuid === user.uuid) {
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
        systems: ship.systems
      });
    }
  }
  sock.emit('ship/data', {
    ships: ships
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
  var data, config,
      iterator = {
        'vessel-x01': { count: 2 },
        'vessel-x02': { count: 2 },
        'vessel-x03': { count: 2 },
        'vessel-x04': { count: 30 },
        'vessel-x05': { count: 10 }
      };
  for(var key in iterator) {
    for(var i=0; i<iterator[key].count; i++) {
      config = engine.ShipConfiguration[key];
      data = {
        rotation: global.Math.random() * global.Math.PI,
        chasis: key,
        throttle: 0.8 + (global.Math.random() * 3)
      };
      this.create(data);
    }
  }
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

ShipManager.prototype._updateBattles = function() {
  var battle, origin, target,
      accuracy, evasion,
      battles = this.battles;
  for(var b in battles) {
    battle = battles[b];
    origin = this.ships[battle.origin];
    target = this.ships[battle.target];

    // check exist
    if(origin && target) {
      if(origin.position.distance(target.position) > 512) { continue; } // weapon range
     
      accuracy = origin.accuracy;
      evasion = target.evasion;

      if(global.Math.random() <= accuracy && global.Math.random() >= evasion) {
        //.. hit
        target.health -= global.Math.floor(global.Math.random() * 50); // weapon damage
        this.sockets.io.sockets.emit('ship/attack', {
          type: 'hit',
          origin: origin.uuid,
          target: target.uuid
        });
        if(target.health <= 0) {
          delete this.battles[origin.uuid] && this.remove(target);
        }
      } else {
        //.. miss
        this.sockets.io.sockets.emit('ship/attack', {
          type: 'miss',
          origin: origin.uuid,
          target: target.uuid
        });
      }
    } else {
      //.. cancel battle
    }
  }
};

ShipManager.prototype._updateAI = function() {
  var random, ship, destination,
      ships = this.ships,
      arr = [];
  for(var s in ships) {
    ship = ships[s];
    if(!ship.user && global.Math.random() > 0.5) {
      destination = this._generateRandomPosition();
      this._plot(ship, destination);
      random = this._getRandomShip();
      if(global.Math.random() > 0.5 && random !== ship) {
        switch(ship.chasis) {
          case 'vessel-x01':
          case 'vessel-x02':
          case 'vessel-x03':
          case 'vessel-x05':
            this.battles[ship.uuid] = {
              origin: ship.uuid,
              target: random.uuid,
              room: 'pilot'
            };
            break;
          default: break;
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
