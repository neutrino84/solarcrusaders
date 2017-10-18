var engine = require('engine'),
    Basic = require('./Basic');

function Pirate(ship, home) {
  Basic.call(this, ship);

  this.type = 'pirate';

  this.settings = client.AIConfiguration[this.type];

  this.friendlies = this.settings.friendly;
};

Pirate.prototype = Object.create(Basic.prototype);
Pirate.prototype.constructor = Pirate;

// Pirate.prototype.update = function() {
  
// }

module.exports = Pirate;
