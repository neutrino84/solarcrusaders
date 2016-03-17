var Const = require('../const'),
    Rectangle = require('../geometry/Rectangle'),
    Point = require('../geometry/Point'),
    Particle = require('../display/Particle'),
    Group = require('../core/Group'),
    Easing = require('../tween/Easing'),
    Color = require('../utils/Color'),
    Math = require('../utils/Math');

function Emitter(game, x, y, maxParticles) {
  Group.call(this, game);

  this.maxParticles = maxParticles || 50;
  
  this.name = 'emitter' + this.game.particles.ID++;
  this.type = Const.EMITTER;
  this.area = new Rectangle(x, y, 1, 1);

  this.gravity = 0;
  this.vector = new Point(0, 0);

  this.minParticleSpeed = new Point(15, 15);
  this.maxParticleSpeed = new Point(25, 25);

  this.minParticleScale = 1;
  this.maxParticleScale = 1;
  this.scaleData = null;

  this.startTint = 0xFFFFFF;
  this.endTint = 0xFFFFFF;
  this.tintData = null;
  this.tintCache = {};

  this.minRotation = -6;
  this.maxRotation = 6;

  this.minParticleAlpha = 1;
  this.maxParticleAlpha = 1;
  this.alphaData = null;

  this.particleClass = Particle;

  this.angularDrag = 1;
  this.frequency = 100;
  this.lifespan = 2000;

  this.bounce = new Point();
  this.particleAnchor = new Point(0.5, 0.5);
  this.particleDrag = new Point(0, 0);

  this.blendMode = Const.BlendMode.NORMAL;

  this.emitX = x;
  this.emitY = y;

  this.on = false;
  this.autoScale = false;
  this.autoAlpha = false;
  this.autoTint = false;

  this.particleBringToTop = false;
  this.particleSendToBack = false;

  this._minParticleScale = new Point(1, 1);
  this._maxParticleScale = new Point(1, 1);

  this._quantity = 0;
  this._timer = 0;
  this._counter = 0;
  this._flowQuantity = 0;
  this._flowTotal = 0;
  this._explode = true;
  this._frames = null;
};

Emitter.prototype = Object.create(Group.prototype);
Emitter.prototype.constructor = Emitter;

Emitter.prototype.update = function() {
  if(this.on && this.game.clock.time >= this._timer) {
    this._timer = this.game.clock.time + this.frequency * this.game.clock.slowMotion;


    if(this._flowTotal !== 0) {
      if(this._flowQuantity > 0) {
        for (var i = 0; i < this._flowQuantity; i++) {
          if(this.emitParticle()) {
            this._counter++;

            if(this._flowTotal !== -1 && this._counter >= this._flowTotal) {
              this.on = false;
              break;
            }
          }
        }
      } else {
        if(this.emitParticle()) {
          this._counter++;

          if(this._flowTotal !== -1 && this._counter >= this._flowTotal) {
            this.on = false;
          }
        }
      }
    } else {
      if(this.emitParticle()) {
        this._counter++;

        if(this._quantity > 0 && this._counter >= this._quantity) {
          this.on = false;
        }
      }
    }
  }

  var i = this.children.length;
  while(i--) {
    if(this.children[i].exists) {
      this.children[i].update();
    }
  }
};

Emitter.prototype.makeParticles = function(keys, frames, quantity, collide, collideWorldBounds) {
  if(frames === undefined) { frames = 0; }
  if(quantity === undefined) { quantity = this.maxParticles; }
  if(collide === undefined) { collide = false; }
  if(collideWorldBounds === undefined) { collideWorldBounds = false; }

  var particle;
  var i = 0;
  var rndKey = keys;
  var rndFrame = frames;

  this._frames = frames;

  if(quantity > this.maxParticles) {
    this.maxParticles = quantity;
  }

  while(i < quantity) {
    if(Array.isArray(keys)) {
      rndKey = this.game.rnd.pick(keys);
    }

    if(Array.isArray(frames)) {
      rndFrame = this.game.rnd.pick(frames);
    }

    particle = new this.particleClass(this.game, rndKey, rndFrame);

    // this.game.physics.arcade.enable(particle, false);

    // if(collide) {
    //   particle.body.checkCollision.any = true;
    //   particle.body.checkCollision.none = false;
    // } else {
    //   particle.body.checkCollision.none = true;
    // }

    // particle.body.collideWorldBounds = collideWorldBounds;
    // particle.body.skipQuadTree = true;

    particle.exists = false;
    particle.visible = false;
    particle.anchor.copy(this.particleAnchor);

    this.add(particle);

    i++;
  }

  return this;
};

Emitter.prototype.kill = function() {
  this.on = false;
  this.exists = false;
};

Emitter.prototype.revive = function() {
  this.exists = true;
};

Emitter.prototype.explode = function(quantity) {
  this._flowTotal = 0;
  this.start(true, this.lifespan, this.frequency, quantity);
};

Emitter.prototype.flow = function(lifespan, frequency, quantity, total, immediate) {
  if(quantity === undefined || quantity === 0) { quantity = 1; }
  if(total === undefined) { total = -1; }
  if(immediate === undefined) { immediate = true; }

  if(quantity > this.maxParticles) {
    quantity = this.maxParticles;
  }

  this._counter = 0;
  this._flowQuantity = quantity;
  this._flowTotal = total;

  if(immediate) {
    this.start(true, lifespan, frequency, quantity);

    this._counter += quantity;
    this.on = true;
    this._timer = this.game.clock.time + frequency * this.game.clock.slowMotion;
  } else {
    this.start(false, lifespan, frequency, quantity);
  }
};

Emitter.prototype.start = function(explode, lifespan, frequency, quantity) {
  if(explode === undefined) { explode = true; }
  if(lifespan === undefined) { lifespan = this.lifespan; }
  if(frequency === undefined || frequency === null) { frequency = 250; }
  if(quantity === undefined) { quantity = 0; }

  if(quantity > this.maxParticles) {
    quantity = this.maxParticles;
  }

  this.revive();
  this.visible = true;
  this.lifespan = lifespan;
  this.frequency = frequency;

  if(explode) {
    for(var i=0; i<quantity; i++) {
      this.emitParticle();
    }
  } else {
    this.on = true;
    this._quantity += quantity;
    this._counter = 0;
    this._timer = this.game.clock.time + frequency * this.game.clock.slowMotion;
  }
};

Emitter.prototype.emitParticle = function() {
  var particle = this.getFirstExists(false);

  if(particle === null) {
    return false;
  }

  if(this.width > 1 || this.height > 1) {
    particle.reset(this.game.rnd.integerInRange(this.left, this.right), this.game.rnd.integerInRange(this.top, this.bottom));
  } else {
    particle.reset(this.emitX, this.emitY);
  }

  particle.lifespan = this.lifespan;

  if(this.particleBringToTop) {
    this.bringToTop(particle);
  } else if(this.particleSendToBack) {
    this.sendToBack(particle);
  }

  if(this.autoScale) {
    particle.setScaleData(this.scaleData);
  } else if(this.minParticleScale !== 1 || this.maxParticleScale !== 1) {
    particle.scale.set(this.game.rnd.realInRange(this.minParticleScale, this.maxParticleScale));
  } else if((this._minParticleScale.x !== this._maxParticleScale.x) || (this._minParticleScale.y !== this._maxParticleScale.y)) {
    particle.scale.set(this.game.rnd.realInRange(this._minParticleScale.x, this._maxParticleScale.x), this.game.rnd.realInRange(this._minParticleScale.y, this._maxParticleScale.y));
  }

  if(Array.isArray(this._frames === 'object')) {
    particle.frame = this.game.rnd.pick(this._frames);
  } else {
    particle.frame = this._frames;
  }

  if(this.autoAlpha) {
    particle.setAlphaData(this.alphaData);
  } else {
    particle.alpha = this.game.rnd.realInRange(this.minParticleAlpha, this.maxParticleAlpha);
  }

  if(this.autoTint) {
    particle.setTintData(this.tintData);
  }

  particle.vector = this.vector;
  particle.blendMode = this.blendMode;

  // particle.body.updateBounds();
  // particle.body.bounce.setTo(this.bounce.x, this.bounce.y);

  particle.velocity.x = this.game.rnd.between(this.minParticleSpeed.x, this.maxParticleSpeed.x);
  particle.velocity.y = this.game.rnd.between(this.minParticleSpeed.y, this.maxParticleSpeed.y);
  
  particle.drag.x = this.particleDrag.x;
  particle.drag.y = this.particleDrag.y;

  particle.angularVelocity = Math.degToRad(this.game.rnd.between(this.minRotation, this.maxRotation));
  particle.angularDrag = Math.degToRad(this.angularDrag);

  particle.onEmit();

  return true;
};

Emitter.prototype.destroy = function() {
  this.game.particles.remove(this);
  Group.prototype.destroy.call(this, true, false);
};

Emitter.prototype.setSize = function(width, height) {
  this.area.width = width;
  this.area.height = height;
};

Emitter.prototype.setXSpeed = function(min, max) {
  min = min || 0;
  max = max || 0;

  this.minParticleSpeed.x = min;
  this.maxParticleSpeed.x = max;
};

Emitter.prototype.setYSpeed = function(min, max) {
  min = min || 0;
  max = max || 0;

  this.minParticleSpeed.y = min;
  this.maxParticleSpeed.y = max;
};

Emitter.prototype.setRotation = function(min, max) {
  min = min || 0;
  max = max || 0;

  this.minRotation = min;
  this.maxRotation = max;
};

Emitter.prototype.setAlpha = function(min, max, rate, ease, yoyo) {
  if(min === undefined) { min = 1; }
  if(max === undefined) { max = 1; }
  if(rate === undefined) { rate = 0; }
  if(ease === undefined) { ease = Easing.Linear.None; }
  if(yoyo === undefined) { yoyo = false; }

  this.minParticleAlpha = min;
  this.maxParticleAlpha = max;
  this.autoAlpha = false;

  if(rate > 0 && min !== max) {
    var tweenData = { v: min },
        tween = this.game.tweens.create(tweenData).to({ v: max }, rate, ease);
        tween.yoyo(yoyo);

    this.alphaData = tween.generateData(60);

    //  Inverse it so we don't have to do array length look-ups in Particle update loops
    this.alphaData.reverse();
    this.autoAlpha = true;
  }
};

Emitter.prototype.setScale = function(minX, maxX, minY, maxY, rate, ease, yoyo) {
  if(minX === undefined) { minX = 1; }
  if(maxX === undefined) { maxX = 1; }
  if(minY === undefined) { minY = 1; }
  if(maxY === undefined) { maxY = 1; }
  if(rate === undefined) { rate = 0; }
  if(ease === undefined) { ease = Easing.Linear.None; }
  if(yoyo === undefined) { yoyo = false; }

  //  Reset these
  this.minParticleScale = 1;
  this.maxParticleScale = 1;

  this._minParticleScale.set(minX, minY);
  this._maxParticleScale.set(maxX, maxY);

  this.autoScale = false;

  if(rate > 0 && ((minX !== maxX) || (minY !== maxY))) {
    var tweenData = { x: minX, y: minY },
        tween = this.game.tweens.create(tweenData).to( { x: maxX, y: maxY }, rate, ease);
        tween.yoyo(yoyo);

    this.scaleData = tween.generateData(60);

    //  Inverse it so we don't have to do array length look-ups in Particle update loops
    this.scaleData.reverse();
    this.autoScale = true;
  }
};

Emitter.prototype.setTint = function(startTint, endTint, rate, ease, yoyo) {
  if(startTint === undefined) { minX = 0xFFFFFF; }
  if(endTint === undefined) { maxX = 0xFFFFFF; }
  if(rate === undefined) { rate = 0; }
  if(ease === undefined) { ease = Easing.Linear.None; }
  if(yoyo === undefined) { yoyo = false; }

  this.startTint = startTint;
  this.endTint = endTint;
  this.autoTint = false;

  var key = startTint.toString() + endTint.toString() + rate.toString() + ease.toString() + yoyo.toString();
  
  if(this.tintCache[key]) {
    this.tintData = this.tintCache[key];
    this.autoTint = true;
  } else if(rate > 0 && (startTint !== endTint)) {
    var tweenData = { step: 0 },
        tween = this.game.tweens.create(tweenData).to({ step: 100 }, rate, ease);
        tween.yoyo(yoyo);

    this.tintCache[key] = this.tintData = tween.generateData(60);

    for(var i=0; i<this.tintData.length; i++) {
      this.tintData[i].color = Color.interpolateColor(startTint, endTint, 100, this.tintData[i].step);
    }

    // inverse it so we don't have to do array
    // length look-ups in Particle update loops
    this.tintData.reverse();
    this.autoTint = true;
  }
};

Emitter.prototype.at = function(object) {
  if(object.center) {
    this.emitX = object.center.x;
    this.emitY = object.center.y;
  } else {
    this.emitX = object.world.x + (object.anchor.x * object.width);
    this.emitY = object.world.y + (object.anchor.y * object.height);
  }
};

Object.defineProperty(Emitter.prototype, 'width', {
  get: function() {
    return this.area.width;
  },

  set: function(value) {
    this.area.width = value;
  }
});

Object.defineProperty(Emitter.prototype, 'height', {
  get: function() {
    return this.area.height;
  },

  set: function(value) {
    this.area.height = value;
  }
});

Object.defineProperty(Emitter.prototype, 'x', {
  get: function() {
    return this.emitX;
  },

  set: function(value) {
    this.emitX = value;
  }
});

Object.defineProperty(Emitter.prototype, 'y', {
  get: function() {
    return this.emitY;
  },

  set: function(value) {
    this.emitY = value;
  }
});

Object.defineProperty(Emitter.prototype, 'left', {
  get: function() {
    return global.Math.floor(this.x - (this.area.width / 2));
  }
});

Object.defineProperty(Emitter.prototype, 'right', {
  get: function() {
    return global.Math.floor(this.x + (this.area.width / 2));
  }
});

Object.defineProperty(Emitter.prototype, 'top', {
  get: function() {
    return global.Math.floor(this.y - (this.area.height / 2));
  }
});

Object.defineProperty(Emitter.prototype, 'bottom', {
  get: function() {
    return global.Math.floor(this.y + (this.area.height / 2));
  }
});

module.exports = Emitter;
