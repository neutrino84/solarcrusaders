
var Sprite = require('./Sprite'),
    Point = require('../geometry/Point');
    // Reset = require('./components/Reset');

function Particle(game, key, frame) {
  Sprite.call(this, game, key, frame);

  // this.position = new Point(0, 0);
  this.vector = new Point(0, 0);
  this.velocity = new Point(0, 0);
  this.drag = new Point(0, 0);

  this.angularVelocity = 0;
  this.angularDrag = 0;

  this.autoScale = false;
  this.autoAlpha = false;

  this.scaleData = null;
  this.alphaData = null;
  this.tintData = null;

  this._s = 0;
  this._a = 0;
  this._t = 0;

  this.rotation = global.Math.random() * global.Math.PI;
};

Particle.prototype = Object.create(Sprite.prototype);
Particle.prototype.constructor = Particle;

Particle.prototype.update = function() {
  var timeStep = this.game.clock.elapsedMS / 1000;

  // spin
  this.rotation += this.angularVelocity * timeStep;
  // this.angularVelocity -= this.angularDrag * timeStep;

  // momentum
  this.position.set(
    this.position.x + this.velocity.x * this.vector.x * timeStep,
    this.position.y + this.velocity.y * this.vector.y * timeStep
  );

  // friction
  // this.velocity.subtract(
  //   this.drag.x * timeStep,
  //   this.drag.y * timeStep
  // );

  if(!this.autoScale && !this.autoAlpha && !this.autoTint) {
    this.exists = false
  }

  if(this.autoScale) {
    this._s--;

    if(this._s) {
      this.scale.set(this.scaleData[this._s].x, this.scaleData[this._s].y);
    } else {
      this.autoScale = false;
    }
  }

  if(this.autoAlpha) {
    this._a--;

    if(this._a) {
      this.alpha = this.alphaData[this._a].v;
    } else {
      this.autoAlpha = false;
    }
  }

  if(this.autoTint) {
    this._t--;

    if(this._t) {
      this.tint = this.tintData[this._t].color;
    } else {
      this.autoTint = false;
    }
  }
};

Particle.prototype.onEmit = function() {
};

Particle.prototype.setAlphaData = function(data) {
  this.alphaData = data;
  this._a = data.length - 1;
  this.alpha = this.alphaData[this._a].v;
  this.autoAlpha = true;
};

Particle.prototype.setScaleData = function(data) {
  this.scaleData = data;
  this._s = data.length - 1;
  this.scale.set(this.scaleData[this._s].x, this.scaleData[this._s].y);
  this.autoScale = true;
};

Particle.prototype.setTintData = function(data) {
  this.tintData = data;
  this._t = data.length - 1;
  this.tint = this.tintData[this._t].color;
  this.autoTint = true;
}

Particle.prototype.reset = function(x, y) { //, health) {
  // Component.Reset.prototype.reset.call(this, x, y, health);
  
  this.position.set(x, y);

  this.fresh = true;
  this.exists = true;
  this.visible = true;
  this.renderable = true;

  this.alpha = 1;
  this.scale.set(1);

  this.autoScale = false;
  this.autoAlpha = false;

  return this;
};

module.exports = Particle;
