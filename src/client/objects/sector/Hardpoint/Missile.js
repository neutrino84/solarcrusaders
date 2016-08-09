
var engine = require('engine'),
    Projectile = require('./Projectile');

function Missile(parent) {
  this.parent = parent;
  this.game = parent.game;
  this.data = parent.data;

  this.isRunning = false;

  this.projectiles = [];
};

Missile.prototype.constructor = Missile;

Missile.prototype.start = function(origin, destination, distance) {
  var missile = new Projectile(this);
      missile.start(origin, destination, distance);
  this.projectiles.push(missile);
  this.isRunning = true;
};

Missile.prototype.update = function(origin, destination) {
  var projectile,
      projectiles = this.projectiles,
      length = projectiles.length,
      remove = [];
  
  // animate
  for(var i=0; i<length; i++) {
    projectile = projectiles[i]
    projectile.update(origin, destination);

    if(!projectile.isRunning) {
      remove.push(projectiles.indexOf(projectile));
    }
  }

  while(remove.length > 0) {
    projectiles.splice(remove.pop(), 1);
  }

  // stop
  if(length == 0) {
    this.isRunning = false;
  }
};

Missile.prototype.destroy = function() {
  this.isRunning = false;

  while(this.projectiles.length > 0) {
    this.projectiles.pop().destroy();
  }

  this.parent = this.game =
    this.data = undefined;
};

module.exports = Missile;
