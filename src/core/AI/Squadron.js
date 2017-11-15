var engine = require('engine'),
    Basic = require('./Basic');

function Squadron(ship, home) {
  Basic.call(this, ship);

  this.type = 'squadron';
  this.settings = {
    disengage: 20480,
    friendly: ['user', 'basic', 'squadron'],
    bounds: false,
    escape: {
      health: 0.01,
    },
    sensor: {
      aim: 0.5,
      range: 1024
    }
  };
};

Squadron.prototype = Object.create(Basic.prototype);
Squadron.prototype.constructor = Squadron;

Squadron.prototype.attacked = function() {

};

Squadron.prototype.scanner = function() {

};

Squadron.prototype.plot = function(){
  var rnd = this.game.rnd,
      ship = this.ship,
      settings = this.settings,
      offset = this.offset,
      target = this.target,
      fence = this.fence,
      master = ship.master,
      p1 = ship.movement.position,
      p2 = master.movement.position,
      size, distance;

  // plot destination
  if(target && fence < 2048) {
    // plot heading towards target
    distance = target.movement.position.distance(ship.movement.position);
    size = target.data.size * 6;
    offset.copyFrom(target.movement.position);
    offset.add(rnd.realInRange(-size, size), rnd.realInRange(-size, size));
    ship.movement.formation = null;
    ship.movement.plot({ x: offset.x-p1.x, y: offset.y-p1.y }, engine.Math.clamp(distance/256, 0.4, 1.0));
  } else if(master && master.movement && rnd.frac() > 0.5) {
    // get back in formation
    ship.movement.formation = master.formation;
    ship.movement.plot({ x: p2.x-p1.x, y: p2.y-p1.y });
  };
};

Object.defineProperty(Squadron.prototype, 'fence', {
  get: function() {
    var ship = this.ship,
        movement = ship.movement;
    return ship.master.movement.position.distance(movement.position);
  }
});

module.exports = Squadron;
