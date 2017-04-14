var engine = require('engine'),
    Basic = require('./Basic');

function Pirate(ship, home) {
  Basic.call(this, ship);

  this.type = 'pirate';

  this.settings = {
    respawn: 60000,
    disengage: 9216,
    friendly: ['pirate','scavenger'],
    position: {
      radius: 512,
      x: ship.movement.position.x,
      y: ship.movement.position.y
    },
    escape: {
      health: 0.2,
    },
    sensor: {
      aim: 1.25,
      range: 4096
    }
  };
};

Pirate.prototype = Object.create(Basic.prototype);
Pirate.prototype.constructor = Pirate;

Pirate.prototype.getHomePosition = function() {
  var position = this.settings.position,
      sensor = this.sensor;
      sensor.setTo(position.x, position.y, position.radius);
  return this.sensor.random();
};

module.exports = Pirate;
