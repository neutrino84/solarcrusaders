var engine = require('engine'),
    Basic = require('./Basic');

function Squadron(ship, home) {
  Basic.call(this, ship);
  this.type = 'squadron';
  this.master = ship.master;

  this.settings = client.AIConfiguration[this.type];

  this.friendlies = this.settings.friendly;

  // this.settings = {
  //   disengage: 9216,
  //   friendly: ['user', 'basic', 'squadron'],
  //   position: {
  //     radius: 512,
  //     x: ship.movement.position.x,
  //     y: ship.movement.position.y
  //   },
  //   bounds: false,
  //   escape: {
  //     health: 0.01,
  //   },
  //   sensor: {
  //     aim: 1.25,
  //     range: 4096
  //   }
  // };
};

Squadron.prototype = Object.create(Basic.prototype);

module.exports = Squadron;
