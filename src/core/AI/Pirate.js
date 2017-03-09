var engine = require('engine'),
    Basic = require('./Basic');

function Pirate(ship, home) {
  Basic.call(this, ship);

  this.type = 'pirate';

  this.settings = {
    aim: 1.25,
    respawn: 60000,
    disengage: 9216,
    friendly: ['pirate'],
    escape: {
      health: 0.1,
      position: {
        radius: 256,
        x: ship.movement.position.x,
        y: ship.movement.position.y
      }
    },
    sensor: {
      range: 4096,
      pursuit: 512
    }
  };
};

Pirate.prototype = Object.create(Basic.prototype);
Pirate.prototype.constructor = Pirate;

Pirate.prototype.getHomePosition = function() {
  var escape = this.settings.escape;
  this.sensor.setTo(escape.position.x, escape.position.y, escape.position.radius);
  return this.sensor.random();
};

module.exports = Pirate;
