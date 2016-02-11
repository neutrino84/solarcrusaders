
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
  this.glowSprite.scale.set(1.0, 1.0);
  this.glowSprite.pivot.set(32, 32);
  this.glowSprite.position.set(0, 16);
  this.glowSprite.tint = 0xFFAAAA;
  this.glowSprite.blendMode = engine.BlendMode.ADD;

  this.redTexture = new pixi.Texture(this.game.cache.getImage('laser-red', true).base);
  this.blueTexture = new pixi.Texture(this.game.cache.getImage('laser-red', true).base);
  this.strip = new engine.Strip(this.game, this.blueTexture, [this._start, this._end]);
  this.strip.blendMode = engine.BlendMode.ADD;

  this.startTween = this.game.tweens.create(this._start);
  this.endTween = this.game.tweens.create(this._end);
  this.fadeTween = this.game.tweens.create(this.strip);
  this.glowTween = this.game.tweens.create(this.glowSprite);

  this.startTween.create();
  this.endTween.create();
  this.fadeTween.create();
  this.glowTween.create();
};

Laser.prototype.constructor = Laser;

Laser.prototype.isRunning = function() {
  return this.endTween.isRunning || this.startTween.isRunning || this.fadeTween.isRunning;
};

Laser.prototype.fire = function(miss, enhancements, shields) {
  if(this.isRunning()) { return; }

  var game = this.game,
      duration = 750,
      end = this.end,
      start = engine.Line.pointAtDistance(this.start, this.end, 8),
      distance = this.start.distance(this.end) / 5.0,
      parent = this.parent;

  this._start.copyFrom(start);
  this._end.copyFrom(end);

  this.strip.alpha = 1.0;
  this.strip.texture = this.blueTexture;

  this.glowSprite.alpha = 1.0;

  this.glowTween.updateTweenData('vStart', { alpha: 1.0 }, 0);
  this.glowTween.updateTweenData('vEnd', { alpha: 0.0 }, 0);
  this.glowTween.updateTweenData('duration', distance, 0);
  this.glowTween.updateTweenData('delay', duration, 0);

  this.fadeTween.updateTweenData('vStart', { alpha: 1.0 }, 0);
  this.fadeTween.updateTweenData('vEnd', { alpha: 0.0 }, 0);
  this.fadeTween.updateTweenData('duration', distance+100, 0);
  this.fadeTween.updateTweenData('delay', duration-100, 0);

  this.startTween.updateTweenData('vStart', { x: start.x, y: start.y }, 0);
  this.startTween.updateTweenData('vEnd', { x: end.x, y: end.y }, 0);
  this.startTween.updateTweenData('duration', distance, 0);
  this.startTween.updateTweenData('delay', duration, 0);

  this.endTween.updateTweenData('vStart', { x: start.x, y: start.y }, 0);
  this.endTween.updateTweenData('vEnd', { x: end.x, y: end.y }, 0);
  this.endTween.updateTweenData('duration', distance, 0);

  this.startTween.start();
  this.endTween.start();
  this.fadeTween.start();
  this.glowTween.start();

  this.endTween.once('start', function() {
    parent.fxGroup.addChild(this.strip);
    parent.sprite.addChild(this.glowSprite);
  }, this);

  this.fadeTween.once('complete', function() {
    parent.fxGroup.removeChild(this.strip);
    parent.sprite.removeChild(this.glowSprite);
  }, this);

  this.endTween.once('complete', function() {
    if(!miss) {
      parent.glowEmitter.color(shields ? 0x336699 : 0xFF6666);
      parent.glowEmitter.at({ center: end });
      parent.glowEmitter.explode(shields ? 3 : 2);

      parent.explosionEmitter.at({ center: end });
      parent.explosionEmitter.explode(2);

      if(!shields) {
        this.timer2 = game.clock.events.repeat((distance + duration)/30, 30, function() {
          parent.fireEmitter.at({ center: end });
          parent.fireEmitter.explode(1);
        });

        if(parent.ship.target) {
          parent.ship.target.damage.inflict(parent.target);
        }
      }
    }
  }, this);
};

Laser.prototype.update = function() {
  var start, end = this.end;
  if(this.isRunning()) {
    start = engine.Line.pointAtDistance(this.start, end, 17);

    this._start.copyFrom(start);
    this.startTween.updateTweenData('vStart', { x: start.x, y: start.y }, 0);
    this.startTween.updateTweenData('vEnd', { x: end.x, y: end.y }, 0);

    this._end.copyFrom(end);
    this.endTween.updateTweenData('vStart', { x: start.x, y: start.y }, 0);
    this.endTween.updateTweenData('vEnd', { x: end.x, y: end.y }, 0);

    if(this.glowSprite.parent) {
      this.glowSprite.rotation += 0.05;
    }
  }
};

Laser.prototype.destroy = function() {
  this.timer1 && this.game.clock.events.remove(this.timer1);
  this.timer2 && this.game.clock.events.remove(this.timer2);

  this.startTween.stop();
  this.endTween.stop();
  this.fadeTween.stop();
  this.glowTween.stop();

  this.startTween.removeAllListeners();
  this.endTween.removeAllListeners();
  this.fadeTween.removeAllListeners();
  this.glowTween.removeAllListeners();

  this.strip && this.strip.destroy();
  this.glowSprite && this.glowSprite.destroy();

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
