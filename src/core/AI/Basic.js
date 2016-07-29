
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
      position = movement.position,
      destination;
  
  if(global.Math.random() > 0.5) {
    // create vector
    destination = manager.generateRandomPosition(512);

    // plot ship
    ship.movement.plot({ x: destination.x-position.x, y: destination.y-position.y });
  }
};

Basic.prototype.defend = function(target) {
  this.ship.attack({
    uuid: this.ship.uuid,
    targ: {
      x: target.movement.position.x,
      y: target.movement.position.y
    }
  });
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
