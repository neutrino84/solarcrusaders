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

  this.vector = new Point(0, 0);
  this.velocity = new Point(0, 0);

  this.minParticleScale = 1.0;
  this.maxParticleScale = 1.0;

  this.startTint = 0xFFFFFF;
  this.endTint = 0xFFFFFF;

  this.minRotation = 0.0;
  this.maxRotation = 0.0;

  this.minParticleAlpha = 1.0;
  this.maxParticleAlpha = 1.0;

  this.angularDrag = 0.0;

  this.frequency = 100;
  this.lifespan = 2000;

  this.particleAnchor = new Point(0.5, 0.5);
  this.particleDrag = new Point(0, 0);

  this.blendMode = Const.BlendMode.NORMAL;

  this.emitX = x;
  this.emitY = y;

  this.on = false;
  this.pooling = [];

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
    if(this.children[i].visible) {
      this.children[i].update();
    }
  }
};

Emitter.prototype.makeParticles = function(keys, frames, quantity) {
  if(frames === undefined) { frames = 0; }
  if(quantity === undefined) { quantity = this.maxParticles; }

  var particle,
      i = 0,
      key = keys,
      frame = frames;

  // save frames
  this._frames = frames;

  if(quantity > this.maxParticles) {
    this.maxParticles = quantity;
  }

  while(i<quantity) {
    if(Array.isArray(keys)) {
      key = this.game.rnd.pick(keys);
    }

    if(Array.isArray(frames)) {
      frame = this.game.rnd.pick(frames);
    }

    // create particle
    particle = new Particle(this, key, frame);
    particle.anchor.copy(this.particleAnchor);
    particle.visible = false;

    // add to pool
    this.add(particle);
    this.pooling.push(particle);

    i++;
  }
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

    this.on = true;
    this._counter += quantity;
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
  var frame, rnd = this.game.rnd,
      particle = this.pooling.pop(); //this.getFirstVisible(false);
  if(particle) {
    particle.reset(this.emitX, this.emitY);
    particle.lifespan = this.lifespan;

    if(Array.isArray(this._frames)) {
      frame = rnd.pick(this._frames);
    } else {
      frame = this._frames;
    }
    particle.setFrameByName(frame);

    if(this.scaleData) {
      particle.setScaleData(this.scaleData);
    } else if(this.minParticleScale !== 1 || this.maxParticleScale !== 1) {
      particle.scale.set(rnd.realInRange(this.minParticleScale, this.maxParticleScale));
    }

    if(this.alphaData) {
      particle.setAlphaData(this.alphaData);
    } else {
      particle.alpha = rnd.realInRange(this.minParticleAlpha, this.maxParticleAlpha);
    }

    if(this.tintData) {
      particle.setTintData(this.tintData);
    } else {
      particle.tint = rnd.realInRange(this.minParticleTint, this.maxParticleTint);
    }

    particle.blendMode = this.blendMode;

    particle.vector.x = this.vector.x;
    particle.vector.y = this.vector.y;

    particle.velocity.x = this.velocity.x;
    particle.velocity.y = this.velocity.y

    particle.drag.x = this.particleDrag.x;
    particle.drag.y = this.particleDrag.y;

    particle.angularVelocity = Math.degToRad(rnd.between(this.minRotation, this.maxRotation));
    particle.angularDrag = Math.degToRad(this.angularDrag);

    particle.emit();

    return true;
  } else {
    return false;
  }
};

Emitter.prototype.setVector = function(x, y) {
  var x = x || 0,
      y = y || 0;

  this.vector.set(x, y);
};

Emitter.prototype.setVelocity = function(x, y) {
  var x = x || 0,
      y = y || 0;

  this.velocity.set(x, y);
};

Emitter.prototype.setRotation = function(min, max) {
  var min = min || 0,
      max = max || 0;

  this.minRotation = min;
  this.maxRotation = max;
};

Emitter.prototype.setAlpha = function(min, max, rate, ease, yoyo) {
  if(min === undefined) { min = 1; }
  if(max === undefined) { max = 1; }
  if(rate === undefined) { rate = 100; }
  if(ease === undefined) { ease = Easing.Linear.None; }
  if(yoyo === undefined) { yoyo = false; }

  var game = this.game,
      easing = Easing.getNameFromValue(ease),
      key = 'alpha:' + min + ':' + max + ':' + rate + ':' + easing + ':' + yoyo;

  this.minParticleAlpha = min;
  this.maxParticleAlpha = max;

  if(game.cache.checkBinaryKey(key)) {
    this.alphaData = game.cache.getBinary(key);
  } else if(rate > 0 && min !== max) {
    var data,
        tweenData = { v: min },
        tween = this.game.tweens.create(tweenData).to({ v: max }, rate, ease);
        tween.yoyo(yoyo);

    data = tween.generateData(60);
    data.reverse();

    game.cache.addBinary(key, data);

    this.alphaData = data;
  }
};

Emitter.prototype.setScale = function(min, max, rate, ease, yoyo) {
  if(min === undefined) { min = 1; }
  if(max === undefined) { max = 1; }
  if(rate === undefined) { rate = 100; }
  if(ease === undefined) { ease = Easing.Linear.None; }
  if(yoyo === undefined) { yoyo = false; }

  var game = this.game,
      easing = Easing.getNameFromValue(ease),
      key = 'scale:' + min + ':' + max + ':' + rate + ':' + easing + ':' + yoyo

  this.minParticleScale = min;
  this.maxParticleScale = max;

  if(game.cache.checkBinaryKey(key)) {
    this.scaleData = game.cache.getBinary(key);
  } else if(rate > 0 && (min !== max)) {
    var data,
        tweenData = { x: min, y: min },
        tween = this.game.tweens.create(tweenData).to( { x: max, y: max }, rate, ease);
        tween.yoyo(yoyo);

    data = tween.generateData(60);
    data.reverse();

    this.scaleData = game.cache.addBinary(key, data);
  }
};

Emitter.prototype.setTint = function(startTint, endTint, rate, ease, yoyo) {
  if(startTint === undefined) { startTint = 0xFFFFFF; }
  if(endTint === undefined) { endTint = 0xFFFFFF; }
  if(rate === undefined) { rate = 100; }
  if(ease === undefined) { ease = Easing.Linear.None; }

  var game = this.game,
      easing = Easing.getNameFromValue(ease),
      key = 'tint:' + startTint + ':' + endTint + ':' + rate + ':' + easing + ':' + yoyo;

  this.startTint = startTint;
  this.endTint = endTint;

  if(game.cache.checkBinaryKey(key)) {
    this.tintData = game.cache.getBinary(key);
  } else if(rate > 0 && (startTint !== endTint)) {
    var data, tints = [],
        tweenData = { step: 0 },
        tween = game.tweens.create(tweenData).to({ step: 100 }, rate, ease);
        tween.yoyo(yoyo);

    // generate cached
    data = tween.generateData(60);
    for(var i=0; i<data.length; i++) {
      tints.push({ t: Color.interpolateColor(startTint, endTint, 100, data[i].step)});
    }
    tints.reverse();

    // store
    this.tintData = game.cache.addBinary(key, tints);
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

Emitter.prototype.destroy = function(options) {
  this.game.particles.remove(this);

  Group.prototype.destroy.call(this, options);
};

module.exports = Emitter;
