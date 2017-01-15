
// for linters
/*global global, module*/

var Generator = require('../utils/Generator'),
    ObjectManager = require('./ObjectManager');

function ShipManager(game) {
  ObjectManager.call(this, game, 'ship');
}

ShipManager.prototype = new ObjectManager();
ShipManager.prototype.constructor = ShipManager;

ShipManager.prototype.init = function() {
  ObjectManager.prototype.init.call(this);
  
  // io router
  this.sockets.iorouter.on(this.eventPrefix + '/plot', this.plot.bind(this));
  // this.sockets.iorouter.on(this.eventPrefix + '/canister', this.canister.bind(this));
  
  // generate npcs
  this.generateRandomShips();
  this.generatePirateShips();
};

// ShipManager.prototype.canister = function(sock, args, next) {
//   var user = sock.sock.handshake.session.user,
//       data = args[1],
//       ship = this.ships[data.uuid];
//   if(ship && ship.user && ship.user.ship === user.ship) {
//     ship.user.data.credits += 1000;
//     this.game.emit('user/data', ship.user, {
//       credits: ship.user.data.credits
//     });
//   }
// };

ShipManager.prototype.plot = function(sock, args, next) {
  var user = sock.sock.handshake.session.user,
      data = args[1],
      ship = this.ships[data.uuid];
  if(ship && ship.user && ship.user.uuid === user.uuid) {
    ship.movement.plot(data.destination);
  }
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
  this.sockets.io.sockets.emit(this.eventPrefix + '/sync', {
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
    for(var i = 0; i < iterator[chassis].count; i++) {
      this.generateRandomShip(chassis, iterator[chassis].race);
    }
  }
};

ShipManager.prototype.generatePirateShips = function() {
  var base, ship,
      iterator = [{
        location: { x: -2048, y: 2048 },
        ships: [
          { name: 'xinli', chassis: 'general-x01', credits: 1500, reputation: -100 },
          { name: 'mavero', chassis: 'general-x01', credits: 1500, reputation: -100 },
          { name: 'ardelle', chassis: 'general-x01', credits: 1500, reputation: -100 },
          { name: 'vega', chassis: 'general-x02', credits: 3000, reputation: -200 },
          { name: 'thak', chassis: 'general-x02', credits: 3000, reputation: -200 },
          { name: 'zeus', chassis: 'general-x03', credits: 8500, reputation: -250 }
        ]
      }, {
        location: { x: 6144, y: 2048 },
        ships: [
          { name: 'satel', chassis: 'general-x01', credits: 1500, reputation: -100 },
          { name: 'thath', chassis: 'general-x01', credits: 1500, reputation: -100 },
          { name: 'sai', chassis: 'general-x02', credits: 3000, reputation: -200 },
          { name: 'ramir', chassis: 'general-x02', credits: 3000, reputation: -200 }
        ]
      }, {
        location: { x: 2048, y: -2048 },
        ships: [
          { name: 'manduk', chassis: 'general-x01', credits: 1500, reputation: -100 },
          { name: 'talai', chassis: 'general-x01', credits: 1500, reputation: -100 },
          { name: 'prelloc', chassis: 'general-x01', credits: 1500, reputation: -100 },
          { name: 'kresthaa', chassis: 'general-x01', credits: 1500, reputation: -100 }
        ]
      }, {
        location: { x: 2048, y: 6144 },
        ships: [
          { name: 'theni', chassis: 'general-x02', credits: 3000, reputation: -200 },
          { name: 'saroc', chassis: 'general-x02', credits: 3000, reputation: -200 },
          { name: 'gahl', chassis: 'general-x02', credits: 3000, reputation: -200 },
          { name: 'amira', chassis: 'general-x02', credits: 3000, reputation: -200 }
        ]
      }],
      len = iterator.length;

  // create pirates
  for(var i = 0; i < len; i++) {
    base = iterator[i];
    for (var s = 0; s < base.ships.length; s++) {
      ship = base.ships[s];
      this.create({
        name: ship.name,
        chassis: ship.chassis,
        credits: global.Math.floor(ship.credits * global.Math.random() + 100),
        reputation: global.Math.floor(ship.reputation * (1 + global.Math.random())),
        throttle: 1.0,
        ai: 'pirate',
        x: base.location.x,
        y: base.location.y
      });
    }
  }
};

ShipManager.prototype.generateRandomShip = function(chassis, race, ai) {
  ai = ai || 'basic';
  var name = Generator.getName(race).toUpperCase(),
      throttle = global.Math.random() * 0.5 + 0.5;
      this.create({
        name: name,
        chassis: chassis,
        throttle: throttle,
        ai: ai,
        credits: global.Math.floor(global.Math.random() * 250 + 50),
        reputation: global.Math.floor(100 * (1 + global.Math.random()))
      });
};

ShipManager.prototype.getRandomShip = function() {
  var ships = this.ships,
      keys = Object.keys(ships),
      random = keys[Math.floor(keys.length * Math.random())];
  return ships[random];
};

module.exports = ShipManager;
