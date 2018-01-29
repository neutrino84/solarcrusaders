var engine = require('engine'),
    Basic = require('./Basic');

function Pirate(ship) {
  Basic.call(this, ship);

  this.type = 'pirate';
  this.settings = {
    friendly: ['pirate'],
    sensor: {
      aim: 1.25,
      range: this.game.rnd.pick([512, 1024, 2048])
    }
  };
};

Pirate.prototype = Object.create(Basic.prototype);
Pirate.prototype.constructor = Pirate;

module.exports = Pirate;
