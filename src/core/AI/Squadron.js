var engine = require('engine'),
    Basic = require('./Basic');

function Squadron(ship) {
  Basic.call(this, ship);

  this.type = 'squadron';
  this.settings = {
    friendly: [],
    sensor: {
      aim: 1.25,
      range: 2048
    }
  };
};

Squadron.prototype = Object.create(Basic.prototype);
Squadron.prototype.constructor = Squadron;

Squadron.prototype.friendly = function(target) {
  var parent = this.parent,
      master = parent.master;
  if(master && master.ai) {
    if(master.ai.friendly(target)) { return true; }
    if(target.master && master.ai.friendly(target.master)) { return true; }
  }
  return false;
};

Squadron.prototype.plot = function() {
  var game = this.game,
      home = this.home,
      parent = this.parent,
      target = this.target,
      master = parent.master,
      movement = parent.movement,
      destination = {};

  // hold formation
  if(master && master.commands['formation']) {
    // get position in formation
    master.formation.position(parent, destination);

    // plot course
    parent.movement.plot({
      x: destination.x-movement.position.x,
      y: destination.y-movement.position.y
    });
  } else {
    // call super
    Basic.prototype.plot.call(this);
  }
};

module.exports = Squadron;
