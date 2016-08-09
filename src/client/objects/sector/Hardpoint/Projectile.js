
var engine = require('engine');

function Projectile(parent) {
  this.parent = parent.parent;
  this.game = parent.game;
  this.data = parent.data;
  this.clock  = parent.game.clock;

  this.started = 0;
  this.elapsed = 0;

  this.delay = 200;
  this.duration = 800;
  this.isRunning = false;
  this.hasExploded = false;
  this.easing = engine.Easing.Sinusoidal.In;

  this.origin = new engine.Point();
  this.destination = new engine.Point();
  this.position = new engine.Point();

  this.projectile = new engine.Sprite(this.game, 'texture-atlas', 'turret-rocket-a.png');
  this.projectile.scale.set(1.0, 1.0);
  this.projectile.pivot.set(17, 25);
};

Projectile.prototype.start = function(origin, destination, distance) {
  this.started = this.clock.time;
  this.elapsed = 0;

  this.delay = distance/2;
  this.duration = distance;
  this.isRunning = true;
  this.hasExploded = false;

  this.origin.copyFrom(origin);
  this.destination.copyFrom(destination);

  this.projectile.rotation = this.origin.angle(this.destination) - (global.Math.PI / 2);

  this.parent.fxGroup.addChild(this.projectile);
};

Projectile.prototype.stop = function() {
  this.isRunning = false;
  this.parent.fxGroup.removeChild(this.projectile);
  this.projectile.destroy();
  this.destroy();
};

Projectile.prototype.explode = function() {
  this.hasExploded = true;

  this.parent.explosionEmitter.at({ center: this.destination });
  this.parent.explosionEmitter.explode(1);
  
  this.parent.explode(this.destination);
};

Projectile.prototype.update = function(origin, destination) {
  if(this.isRunning === true) {
    this.elapsed = this.clock.time - this.started;

    // update
    this.origin.copyFrom(origin);
    
    // percent complete
    var percent = this.elapsed / this.duration;
    if(this.elapsed <= this.duration) {
      this.origin.interpolate(this.destination, this.easing(percent), this.position);
      this.projectile.position.set(this.position.x, this.position.y);
    } else {
      this.projectile.position.set(this.destination.x, this.destination.y);
    }

    if(this.elapsed >= this.delay) {
      this.parent.flashEmitter.at({ center: this.position });
      this.parent.flashEmitter.explode(1);
    }

    if(this.elapsed >= this.duration) {
      if(this.hasExploded == false) {
        this.explode();
      }
      this.stop();
    }
  }
};

Projectile.prototype.destroy = function() {
  this.stop();
  this.projectile.destroy();

  this.parent = this.game = this.data = this.clock
    this.easing = this.origin = this.destination =
    this.position = this.projectile = undefined;
};

module.exports = Projectile;
