var engine = require('engine'),
	  Basic = require('./Basic');

function Pirate(ship) {
  Basic.call(this, ship);

  this.type = 'pirate';

  this.patrol = new engine.Circle(this.ship.position.x, this.ship.position.y, 512);
  this.sight = new engine.Circle(this.ship.position.x, this.ship.position.y, 2048);
};

Pirate.prototype = Object.create(Basic.prototype);
Pirate.prototype.constructor = Pirate;

Pirate.prototype.update = function() {
  var manager = this.manager,
      ships = manager.ships,
      ship = this.ship,
      battles = manager.battles,
      battle = battles[ship.uuid],
      target;

  // plot ship
  if(battle) {
    manager._plot(ship, this.patrol.random());
  } else if(global.Math.random() > 0.96) {
    manager._plot(ship, this.patrol.random());
  }

  // search and destroy
  if(!battle || global.Math.random() > 0.75) {
    for(var s in ships) {
      target = ships[s];
      
      if(target.user && this.sight.contains(target.position.x, target.position.y)) {
        if(!battle || battle.target !== target.uuid) {
          this.battle(ship, target);
        } else {
          continue;
        }
      }
    }
  }
};

Pirate.prototype.defence = function(battle) {
  var manager = this.manager,
      ships = manager.ships,
      origin = ships[battle.origin],
      target = ships[battle.target],
      health = target.health / target.config.stats.health;
  
  // activate piercing
  if(target.systems['targeting']) {
    target.activate('piercing');
  }
};

module.exports = Pirate;
