
var engine = require('engine'),
    View = require('../View'),
    Graphics = engine.Graphics,
    Class = engine.Class;

function BackgroundView(game, settings) {
  Graphics.call(this, game);
  View.call(this);

  this.settings = Class.mixin(settings, {
    color: 0x333333,
    fillAlpha: 1.0,
    blendMode: engine.BlendMode.NORMAL,
    radius: 0,
    borderSize: 1.0,
    borderColor: 0x000000,
    borderAlpha: 1.0
  });

  this.fillAlpha = this.settings.fillAlpha;
  this.blendMode = this.settings.blendMode;

  this._painted = false;
};

// multiple inheritence
BackgroundView.prototype = Object.create(Graphics.prototype);
BackgroundView.prototype.mixinPrototype(View.prototype);
BackgroundView.prototype.constructor = BackgroundView;

BackgroundView.prototype.paint = function(top, left, bottom, right) {
  var size = this.settings.size ? this.settings.size : this.parent.size,
      offset = this.settings.offset ? this.settings.offset : { x: 0, y: 0 },
      settings = this.settings,
      drawMethod = settings.radius > 0 ? 'drawRoundedRect' : 'drawRect';

  if(this._painted || settings.highlight || settings.fillAlpha > 0 ||
      (settings.borderSize > 0 && settings.borderAlpha > 0)) {
    this.clear();
    this._painted = false;
  }

  if(settings.highlight) {
    this.lineStyle(0);
    this.beginFill(settings.highlight, settings.highlightAlpha ? settings.highlightAlpha : 1.0);
    this[drawMethod](offset.x, offset.y, size.width, size.height/2, settings.radius);
    this.endFill();
    this._painted = true;
  }

  if(settings.borderSize > 0 && settings.borderAlpha > 0) {
    this.lineStyle(settings.borderSize, settings.borderColor, settings.borderAlpha);
  }
  if(settings.fillAlpha > 0) {
    this.beginFill(settings.color, settings.fillAlpha);
  }
  if(settings.fillAlpha > 0 || (settings.borderSize > 0 && settings.borderAlpha > 0)) {
    this[drawMethod](offset.x, offset.y, size.width, size.height, settings.radius);
    this._painted = true;
  }
  if(settings.fillAlpha > 0) {
    this.endFill();
  }
};

module.exports = BackgroundView;
