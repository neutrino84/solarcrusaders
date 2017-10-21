var engine = require('engine'),
    Basic = require('./Basic');

function Squadron(ship, home) {
  Basic.call(this, ship);

  this.type = 'squadron';
  this.settings = {
    disengage: 9216,
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
      master = ship.master,
      p1 = ship.movement.position,
      p2, size, distance;

  // plot destination
  if(target) {
    size = target.data.size * 4;
    offset.copyFrom(target.movement.position);
    offset.add(rnd.realInRange(-size, size), rnd.realInRange(-size, size));
    ship.movement.plot({ x: offset.x-p1.x, y: offset.y-p1.y }, this.throttle);
  } else {
    size = master.data.size * 4;
    offset.copyFrom(master.movement.position);
    offset.add(rnd.realInRange(-size, size), rnd.realInRange(-size, size));
    ship.movement.plot({ x: offset.x-p1.x, y: offset.y-p1.y });
  };
};

module.exports = Squadron;
