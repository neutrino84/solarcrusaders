var engine = require('engine'),
    Basic = require('./Basic'),
    client = require('client');

function Pirate(ship, home) {
  Basic.call(this, ship);

  this.type = 'pirate';

  this.settings = client.AIConfiguration[this.type];

  this.friendlies = this.settings.friendly;

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
