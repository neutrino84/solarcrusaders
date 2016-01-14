
var pixi = require('pixi'),
    engine = require('engine');

function Laser(parent, config) {
  this.parent = parent;
  this.game = parent.game;
  this.config = config;

  this.easing = engine.Easing.Default;

  this.start = new engine.Point();
  this.end = new engine.Point();

  this._start = new engine.Point();
  this._end = new engine.Point();
  
  this.glowSprite = new engine.Sprite(this.game, 'texture-atlas', 'laser-piercing.png');
  this.glowSprite.scale.set(1.25, 1.25);
  this.glowSprite.pivot.set(32, 32);
  this.glowSprite.tint = 0xFF6666;
  this.glowSprite.blendMode = engine.BlendMode.ADD;

  this.redTexture = new pixi.Texture(this.game.cache.getImage('laser-red', true).base);
  this.blueTexture = new pixi.Texture(this.game.cache.getImage('laser-blue', true).base);
  this.strip = new engine.Strip(this.game, this.blueTexture, [this._start, this._end]);

  this.startTween = this.game.tweens.create(this._start);
  this.endTween = this.game.tweens.create(this._end);
};

Laser.prototype.constructor = Laser;

Laser.prototype.isRunning = function() {
  return this.endTween.isRunning || this.startTween.isRunning;
};

Laser.prototype.fire = function(miss, enhancements, shields) {
  if(this.isRunning()) { return; }

  var start = engine.Line.pointAtDistance(this.start, this.end, 14),
      distance = this.start.distance(this.end) / 4,
      duration,
      parent = this.parent;

  this._start.copyFrom(start);
  this._end.copyFrom(start);

  this.startTween = game.tweens.create(this._start);
  this.endTween = game.tweens.create(this._end);

  if(enhancements && enhancements.piercing) {
    duration = 500;
    this.strip.texture = this.redTexture;
    
    this.glowSprite.position.copy(start);

    this.glowTween && this.glowTween.stop();
    this.glowTween = game.tweens.create(this.glowSprite.position);
    this.glowTween.to({ x: this.end.x, y: this.end.y }, (distance + duration) / 2, this.easing, false);
    this.glowTween.repeat(1);
    this.glowTween.start();
    this.glowTween.once('complete', function() {
      parent.flashEmitter.at({ center: this._end });
      parent.flashEmitter.explode(shields ? 10 : 2);

      parent.glowEmitter.color(0xFF6666);
      parent.glowEmitter.at({ center: this._end });
      parent.glowEmitter.explode(10);

      parent.explosionEmitter.at({ center: this._end });
      parent.explosionEmitter.explode(10);

      parent.fxGroup.removeChild(this.glowSprite);
    }, this);

    parent.fxGroup.addChild(this.glowSprite);
  } else {
    duration = 250;
    this.strip.texture = this.blueTexture;
  }

  this.startTween.to({ x: this.end.x, y: this.end.y }, distance, this.easing, false, duration);
  this.endTween.to({ x: this.end.x, y: this.end.y }, distance, this.easing, false);

  this.startTween.start();
  this.endTween.start();

  this.startTween.once('complete', function() {
    parent.fxGroup.removeChild(this.strip);
  }, this);

  this.endTween.once('complete', function() {
    parent.flashEmitter.at({ center: this._end });
    parent.flashEmitter.explode(shields ? 10 : 2);

    if(!miss) {
      parent.glowEmitter.color(shields ? 0x336699 : 0xFF6666);
      parent.glowEmitter.at({ center: this._end });
      parent.glowEmitter.explode(shields ? 10 : global.Math.round(3 * global.Math.random()) + 3);

      if(!shields) {
        parent.explosionEmitter.at({ center: this._end });
        parent.explosionEmitter.explode(1);

        if(parent.ship.target) {
          parent.ship.target.damage.inflict(parent.target);
        }
      }
    }
  }, this);
  
  parent.fxGroup.addChild(this.strip);
};

Laser.prototype.update = function() {
  var start, end = this.end;
  if(this.isRunning()) {
    start = engine.Line.pointAtDistance(this.start, end, 14);

    this._start.copyFrom(start);
    this.startTween.updateTweenData('vStart', { x: start.x, y: start.y }, 0);
    this.startTween.updateTweenData('vEnd', { x: end.x, y: end.y }, 0);

    this._end.copyFrom(end);
    this.endTween.updateTweenData('vStart', { x: start.x, y: start.y }, 0);
    this.endTween.updateTweenData('vEnd', { x: end.x, y: end.y }, 0);
  }
  if(this.glowSprite.parent) {
    start = engine.Line.pointAtDistance(this.start, end, 14);
    this.glowTween.updateTweenData('vStart', { x: start.x, y: start.y }, 0);
    this.glowTween.updateTweenData('vEnd', { x: end.x, y: end.y }, 0);
    this.glowSprite.rotation += 0.5;
  }
};

Laser.prototype.destroy = function() {
  this.startTween.stop();
  this.endTween.stop();

  this.startTween.removeAllListeners();
  this.endTween.removeAllListeners();

  this.strip && this.strip.destroy();

  this.redTexture.destroy();
  this.blueTexture.destroy();

  this.parent = this.game = this.config =
    this.easing = this.start = this.end =
    this._start = this._end = this.strip =
    this.redTexture = this.blueTexture =
    this.glowSprite = this.glowTween =
    this.startTween = this.endTween = undefined;
};

module.exports = Laser;
