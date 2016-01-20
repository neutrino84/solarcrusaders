
var engine = require('engine');

function ColorBlend(game, target) {
  this.game = game;
  this.target = target;
  this.loop = true;
  this.colorData = [];
};

ColorBlend.CACHE = {};
ColorBlend.FRAMERATE = 30;
ColorBlend.STEPS = 100;

ColorBlend.prototype.constructor = ColorBlend;

ColorBlend.prototype.start = function() {
  this.setTintData();
  this.isRunning = true;
  this.target.update = this.update.bind(this);
};

ColorBlend.prototype.stop = function() {
  if(this.loop) {
    this.target.tint = 0xFFFFFF;
  } else {
    this.target.tint = 0x000000;
  }
  delete this.target.update;
};

ColorBlend.prototype.update = function() {
  if(this.isRunning) {
    this._t--;

    if(this._t) {
      this.target.tint = this.colorData[this._t].color;
    } else if(this.loop) {
      this.setTintData();
    } else {
      this.stop();
    }
  }
};

ColorBlend.prototype.setTintData = function() {
  this._t = this.colorData.length - 1;
  this.target.tint = this.colorData[this._t].color;
};

ColorBlend.prototype.setColor = function(startColor, endColor, rate, ease, yoyo) {
  if(startColor === undefined) { minX = 0xFFFFFF; }
  if(endColor === undefined) { maxX = 0xFFFFFF; }
  if(rate === undefined) { rate = 1000; }
  if(ease === undefined) { ease = engine.Easing.Linear.None; }
  if(yoyo === undefined) { yoyo = false; }

  this.startColor = startColor;
  this.endColor = endColor;

  var key = startColor.toString() + endColor.toString() + rate.toString() + ease.toString() + yoyo.toString();
  if(ColorBlend.CACHE[key]) {
    this.colorData = ColorBlend.CACHE[key];
  } else if(rate > 0 && (startColor !== endColor)) {
    var tweenData = { step: 0 },
        tween = this.game.tweens.create(tweenData).to({ step: ColorBlend.STEPS }, rate, ease);
        tween.yoyo(yoyo);

    ColorBlend.CACHE[key] = this.colorData = tween.generateData(ColorBlend.FRAMERATE);

    for(var i=0; i<this.colorData.length; i++) {
      this.colorData[i].color = engine.Color.interpolateColor(startColor, endColor, ColorBlend.STEPS, this.colorData[i].step);
    }

    // inverse it so we don't have to do array
    // length look-ups in Particle update loops
    this.colorData.reverse();
  }
};

module.exports = ColorBlend;
