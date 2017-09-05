var engine = require('engine'),
    Basic = require('./Basic');

function Pirate(ship, home) {
  Basic.call(this, ship);

  this.type = 'pirate';

  this.settings = client.AIConfiguration[this.type];

  this.friendlies = this.settings.friendly;
  
  // this.settings = {
  //   disengage: 9216,
  //   friendly: ['pirate','scavenger'],
  //   position: {
  //     radius: 512,
  //     x: ship.movement.position.x,
  //     y: ship.movement.position.y
  //   },
  //   bounds: false,
  //   escape: {
  //     health: 0.2,
  //   },
  //   sensor: {
  //     aim: 0.5,
  //     range: 2096
  //   }
  // };
};

Pirate.prototype = Object.create(Basic.prototype);
Pirate.prototype.constructor = Pirate;

// Pirate.prototype.update = function() {
  
// }

module.exports = Pirate;
