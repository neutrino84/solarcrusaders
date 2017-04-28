var pixi = require('pixi'),
    Const = require('../const'),
    Point = require('../geometry/Point'),
    Core = require('./components/Core');

function Particle(game, key, frame) {
  pixi.Sprite.call(this);

  this.type = Const.PARTICLE;
  this.clock = game.clock;

  this.vector = new Point(0, 0);
  this.velocity = new Point(0, 0);
  this.drag = new Point(0, 0);

  this.angularVelocity = 0;
  this.angularDrag = 0;

  this.scaleData = null;
  this.alphaData = null;
  this.tintData = null;

  this._s = null;
  this._a = null;
  this._t = null;

  this.rotation = global.Math.random() * global.Math.PI;

  Core.init.call(this, game, key, frame);
};

Particle.prototype = Object.create(pixi.Sprite.prototype);
Particle.prototype.constructor = Particle;

Core.install.call(
  Particle.prototype, [
    'Mixin',
    'Destroy',
    'LoadTexture'
  ]
);

Particle.prototype.update = function() {
  this.step = this.clock.elapsedMS / 1000
  this.elapsed = this.clock.time - this.started;

  // spin
  this.rotation += this.angularVelocity * this.step;
  this.angularVelocity -= this.angularDrag * this.step;

  // momentum
  this.position.set(
    this.position.x + this.velocity.x * this.vector.x * this.step,
    this.position.y + this.velocity.y * this.vector.y * this.step
  );

  // friction
  this.velocity.subtract(
    this.drag.x * this.step,
    this.drag.y * this.step
  );

  // auto scale
  if(this._s) {
    this._s--;
    this.scale.set(this.scaleData[this._s].x, this.scaleData[this._s].y);
  }

  // auto alpha
  if(this._a) {
    this._a--;
    this.alpha = this.alphaData[this._a].v;
  }

  // auto tint
  if(this._t) {
    this._t--;
    this.tint = this.tintData[this._t].t;
  }

  // check if dead
  if(this.elapsed >= this.lifespan) {
    this.visible = false;
  }
};

Particle.prototype.onEmit = function() {
  this.visible = true;
};

Particle.prototype.setAlphaData = function(data) {
  this.alphaData = data;
  this._a = data.length - 1;
  this.alpha = this.alphaData[this._a].v;
};

Particle.prototype.setScaleData = function(data) {
  this.scaleData = data;
  this._s = data.length - 1;
  this.scale.set(this.scaleData[this._s].x, this.scaleData[this._s].y);
};

Particle.prototype.setTintData = function(data) {
  this.tintData = data;
  this._t = data.length - 1;
  this.tint = this.tintData[this._t].t;
}

Particle.prototype.reset = function(x, y) {
  this.position.set(x, y);
  this.elapsed = 0;
  this.started = this.clock.time;
};

module.exports = Particle;
