var engine = require('engine'),
    Basic = require('./Basic');

function Squadron(ship, home) {
  Basic.call(this, ship);

  this.type = 'squadron';
  this.settings = {
    disengage: 20480,
    friendly: ['user', 'basic', 'squadron'],
    position: {
      radius: 512,
      x: ship.movement.position.x,
      y: ship.movement.position.y
    },
    bounds: false,
    escape: {
      health: 0.01,
    },
    sensor: {
      aim: 0.5,
      range: 4096
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
      p2, size, distance;

  // plot destination
  if(target && fence < 1024) {
    distance = target.movement.position.distance(ship.movement.position);
    size = target.data.size * 6;
    offset.copyFrom(target.movement.position);
    offset.add(rnd.realInRange(-size, size), rnd.realInRange(-size, size));
    ship.movement.plot({ x: offset.x-p1.x, y: offset.y-p1.y }, engine.Math.clamp(distance/256, 0.4, 1.0));
  } else if(rnd.frac() > 0.5) {
    size = master.data.size * 4;
    offset.copyFrom(master.movement.position);
    offset.add(rnd.realInRange(-size, size), rnd.realInRange(-size, size));
    ship.movement.plot({ x: offset.x-p1.x, y: offset.y-p1.y }, engine.Math.clamp(fence/1024, 0.4, 1.0));
  };
};

Object.defineProperty(Squadron.prototype, 'fence', {
  get: function() {
    return this.ship.master.movement.position.distance(this.ship.movement.position);
  }
});

module.exports = Squadron;
