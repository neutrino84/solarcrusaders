
var engine = require('engine');

function Basic(ship) {
  this.ship = ship;
  this.manager = ship.manager;

  this.vector = new engine.Point();
  
  this.type = 'basic';
};

Basic.prototype.constructor = Basic;

Basic.prototype.update = function() {
  var manager = this.manager,
      ship = this.ship,
      movement = ship.movement,
      destination;
  
  if(global.Math.random() > 0.5) {
    // create vector
    destination = manager.generateRandomPosition(512);
    destination.subtract(movement.position.x, movement.position.y);

    // plot ship
    ship.movement.plot({ x: destination.x, y: destination.y });
  }
};

Basic.prototype.defence = function(incoming) {
  var manager = this.manager,
      ship = this.ship,
      ships = manager.ships,
      battles = manager.battles,
      battle = battles[ship.uuid],
      origin = ships[incoming.origin],
      health = ship.health / ship.config.stats.health;
  
  // start moving around
  if(!ship.movement.animation.isPlaying) {
    manager._plot(ship, manager.generateRandomPosition(4096));
  }

  // fire back at closest
  if(ship.systems['targeting']) {
    if(!battle) {
      this.battle(ship, origin);
    } else if(battle.target !== incoming.origin) {
      other = ships[battle.target]; // other and origin

      if(other.position.distance(ship.position) >
          origin.position.distance(ship.position)) {
        this.battle(ship, origin);
      }
    }
  }

  // activate shielding
  if(ship.systems['shield'] && health < 0.80) {
    ship.activate('shield');
  }
};

Basic.prototype.battle = function(origin, target, room) {
  var manager = this.manager,
      room = room || global.Math.floor(global.Math.random() * target.rooms.length),
      battle = { origin: origin.uuid, target: target.uuid, id: room, room: target.rooms[room].system };
  
  //.. TODO: cleanup
  manager.sockets.io.sockets.emit('ship/targeted', battle);
  manager.battles[origin.uuid] = battle;
  //..
};

module.exports = Basic;
