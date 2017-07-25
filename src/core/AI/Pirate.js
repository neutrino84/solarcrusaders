var engine = require('engine'),
    Basic = require('./Basic');

function Pirate(ship, home) {
  Basic.call(this, ship);

  this.type = 'pirate';

  this.settings = {
    disengage: 9216,
    friendly: ['pirate','scavenger'],
    position: {
      radius: 512,
      x: ship.movement.position.x,
      y: ship.movement.position.y
    },
    bounds: false,
    escape: {
      health: 0.2,
    },
    sensor: {
      aim: 0.5,
      range: 4096
    }
  };
};

Pirate.prototype = Object.create(Basic.prototype);
Pirate.prototype.constructor = Pirate;

module.exports = Pirate;
