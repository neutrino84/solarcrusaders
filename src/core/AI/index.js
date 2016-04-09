
var Basic = require('./Basic'),
    Pirate = require('./Pirate');

module.exports = {
  create: function(type, ship) {
	switch(type) {
      case 'basic':
        return new Basic(ship);
      case 'pirate':
        return new Pirate(ship);
    }
  }
};
