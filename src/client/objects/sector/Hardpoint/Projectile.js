
var pixi = require('pixi'),
    engine = require('engine');

function Projectile(parent) {
  this.parent = parent;
  this.game = parent.game;
  this.data = parent.data;
  this.ship = parent.ship;
  this.manager = parent.manager;
  this.clock  = parent.game.clock;
  this.rnd = parent.game.rnd;

  this.started = 0;
  this.length = 0;
  this.duration = 0;
  this.multiple = true;
  this.isRunning = false;

  this.position = new engine.Point();
  this.origin = new engine.Point();
  this.destination = new engine.Point();
  this.vector = new engine.Point();

  this.glow = new engine.Sprite(this.game, 'texture-atlas', 'explosion-d.png');
  this.glow.pivot.set(64, 64);
  this.glow.position.set(16, 16);
  this.glow.scale.set(0.25, 0.25);
  this.glow.tint = global.parseInt(this.data.glow);
  this.glow.blendMode = engine.BlendMode.ADD;

  this.projectile = new engine.Sprite(this.game, 'texture-atlas', this.data.texture);
  this.projectile.scale.set(1.0, 1.0);
  this.projectile.pivot.set(16, 16);
  this.projectile.blendMode = engine.BlendMode.ADD;
  this.projectile.addChild(this.glow);
};

Projectile.prototype.start = function(destination, distance) {
  this.length = this.data.length;
  this.duration = distance*this.data.projection;
  this.offset = this.parent.ship.data.rate*this.parent.slot/this.parent.total;
  this.delay = this.data.delay + this.rnd.realInRange(this.offset/4, this.offset);
  this.started = this.clock.time + this.delay;

  // running
  this.isRunning = true;

  // reset alpha
  this.glow.alpha = 1.0;
  this.projectile.alpha = 1.0;

  // update origin
  this.parent.updateTransform(this.origin, this.destination);

  // update projectile
  this.projectile.position.set(this.origin.x, this.origin.y);

  // update destination
  this.destination.set(destination.x, destination.y);
  this.destination.add(
    this.rnd.realInRange(-this.data.spread, this.data.spread),
    this.rnd.realInRange(-this.data.spread, this.data.spread));

  // add to display
  this.manager.fxGroup.addChild(this.projectile);
};

Projectile.prototype.stop = function() {
  // explosion fx
  this.game.emitters.explosion.projectile();
  this.game.emitters.explosion.at({ center: this.projectile.position });
  this.game.emitters.explosion.explode(1);

  this.game.emitters.glow.projectile();
  this.game.emitters.glow.at({ center: this.projectile.position });
  this.game.emitters.glow.explode(1);

  // cleanup
  this.isRunning = false;
  this.manager.fxGroup.removeChild(this.projectile);
};

Projectile.prototype.update = function() {
  var f1, f2, f3,
      game = this.game,
      parent = this.parent,
      position = this.position,
      origin = this.origin,
      destination = this.destination,
      vector = this.vector,
      glow = this.glow,
      projectile = this.projectile,
      elapsed = this.clock.time-this.started;

  if(this.isRunning === true) {
    // update orig / dest
    parent.updateTransform(origin, destination);

    // rotation
    projectile.rotation = destination.angle(projectile.position);

    // animate glow scale at start
    if(elapsed < 0) {
      // update project position
      projectile.position.set(origin.x, origin.y);

      // charge glow effect
      f1 = 1-(-elapsed/this.delay);
      projectile.alpha = f1;
    } else {
      if(elapsed > 0) {
        f1 = elapsed/this.duration;
        origin.interpolate(destination, f1, position);
        engine.Point.subtract(projectile.position, position, vector);
        projectile.position.set(position.x, position.y);

        game.emitters.fire.projectile();
        game.emitters.fire.at({ center: projectile.position });
        game.emitters.fire.explode(1);

        for(var i=1; i<4; i++) {
          game.emitters.fire.projectile();
          game.emitters.fire.at({ center: {
            x: position.x+vector.x*(i/4),
            y: position.y+vector.y*(i/4)
          }});
          game.emitters.fire.explode(1);
        }
      }

      // stop once stop
      if(elapsed >= this.duration) {
        this.stop();
      }
    }
  }
};

Projectile.prototype.destroy = function() {
  this.isRunning && this.stop();

  this.projectile.destroy();

  this.game = this.parent = this.manager =
    this.data = this.clock = this.destination = this.origin =
    this.temp = undefined;
};

module.exports = Projectile;
