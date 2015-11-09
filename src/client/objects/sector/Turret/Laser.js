
var engine = require('engine'),
    ExplosionEmitter = require('../emitters/ExplosionEmitter'),
    FlashEmitter = require('../emitters/FlashEmitter');

function Laser(parent, config) {
  this.parent = parent;
  this.game = parent.game;
  this.config = config;

  this.easing = engine.Easing.Quadratic.InOut;

  this.start = new engine.Point();
  this.end = new engine.Point();

  this._start = new engine.Point();
  this._end = new engine.Point();
  
  this.strip = new engine.Strip(this.game, config.sprite, null, [this._start, this._end]);
  
  this.explosionEmitter = new ExplosionEmitter(this.game);
  this.explosionEmitter2 = new ExplosionEmitter(this.game);
  this.flashEmitter = new FlashEmitter(this.game);

  this.explosionEmitter2.setTint(0xffffff, 0x666666, 1000);

  this.game.particles.add(this.explosionEmitter);
  this.game.particles.add(this.explosionEmitter2);
  this.game.particles.add(this.flashEmitter);
  this.game.world.add(this.explosionEmitter2);
  this.game.world.add(this.explosionEmitter);
  this.game.world.add(this.flashEmitter);

  this.startTween = this.game.tweens.create(this._start);
  this.endTween = this.game.tweens.create(this._end);
  this.alphaTween = this.game.tweens.create(this.strip);

  this.parent.parent.fxGroup.addChild(this.strip);
};

Laser.prototype.constructor = Laser;

Laser.prototype.isRunning = function() {
  return this.startTween.isRunning || this.endTween.isRunning || this.alphaTween.isRunning;
};

Laser.prototype.fire = function() {
  if(this.isRunning()) { return; }

  var start = engine.Line.pointAtDistance(this.start, this.end, 16);

  this._start.copyFrom(start);
  this._end.copyFrom(start);

  this.strip.alpha = 1.0;
  this.alphaTween = game.tweens.create(this.strip);
  this.startTween = game.tweens.create(this._start);
  this.endTween = game.tweens.create(this._end);

  this.alphaTween.to({ alpha: 0.0 }, 250, this.easing, false, 50);
  this.startTween.to({ x: this.end.x, y: this.end.y }, 200, this.easing, false, 50);
  this.endTween.to({ x: this.end.x, y: this.end.y }, 50, this.easing, false);

  this.alphaTween.start();
  this.startTween.start();
  this.endTween.start();

  this.endTween.on('complete', function() {
    
    this.explosionEmitter.at({ center: this.end });
    this.explosionEmitter.explode(2);

    this.explosionEmitter2.at({ center: this.end });
    this.explosionEmitter2.explode(1);

    this.flashEmitter.at({ center: this.end });
    this.flashEmitter.explode(4);

    if(this.parent.ship.target) {
      this.parent.ship.target.damage(this.parent.target);
    }
  
  }, this);

  this.flashEmitter.at({ center: start });
  this.flashEmitter.explode(8);
};

module.exports = Laser;
