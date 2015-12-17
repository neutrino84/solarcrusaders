
var engine = require('engine');

function Laser(parent, config) {
  this.parent = parent;
  this.game = parent.game;
  this.config = config;

  this.easing = engine.Easing.Default;

  this.start = new engine.Point();
  this.end = new engine.Point();

  this._start = new engine.Point();
  this._end = new engine.Point();
  
  this.strip = new engine.Strip(this.game, config.sprite, [this._start, this._end]);

  this.startTween = this.game.tweens.create(this._start);
  this.endTween = this.game.tweens.create(this._end);
};

Laser.prototype.constructor = Laser;

Laser.prototype.isRunning = function() {
  return this.endTween.isRunning || this.startTween.isRunning;
};

Laser.prototype.fire = function() {
  if(this.isRunning()) { return; }

  var start = engine.Line.pointAtDistance(this.start, this.end, 14),
      distance = this.start.distance(this.end) / 5;

  this._start.copyFrom(start);
  this._end.copyFrom(start);

  this.startTween = game.tweens.create(this._start);
  this.endTween = game.tweens.create(this._end);

  this.startTween.to({ x: this.end.x, y: this.end.y }, distance, this.easing, false, 200);
  this.endTween.to({ x: this.end.x, y: this.end.y }, distance, this.easing, false);

  this.startTween.start();
  this.endTween.start();

  this.startTween.once('complete', function() {
    this.parent.fxGroup.removeChild(this.strip);
  }, this);

  this.endTween.once('complete', function() {
    this.parent.explosionEmitter.at({ center: this._end });
    this.parent.explosionEmitter.explode(4);
    
    this.parent.flashEmitter.at({ center: this._end });
    this.parent.flashEmitter.explode(2);
    
    this.parent.glowEmitter.at({ center: this._end });
    this.parent.glowEmitter.explode(global.Math.floor(3 * global.Math.random()) + 5);
    
    this.parent.ship.target.damage.inflict(this.parent.target);
  }, this);

  this.parent.fxGroup.addChild(this.strip);
};

Laser.prototype.update = function() {
  var start, end;
  if(this.isRunning()) {
    end = this.end;
    start = engine.Line.pointAtDistance(this.start, end, 14);

    this._start.copyFrom(start);
    this.startTween.updateTweenData('vStart', { x: start.x, y: start.y }, 0);
    this.startTween.updateTweenData('vEnd', { x: end.x, y: end.y }, 0);

    this._end.copyFrom(end);
    this.endTween.updateTweenData('vStart', { x: start.x, y: start.y }, 0);
    this.endTween.updateTweenData('vEnd', { x: end.x, y: end.y }, 0);
  }
};

module.exports = Laser;
