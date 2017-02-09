
var engine = require('engine'),
    Graphics = engine.Graphics,
    Class = engine.Class;

function BackgroundView(game, settings) {
  Graphics.call(this, game);

  this.settings = Class.mixin(settings, {
    color: 0x000000,
    fillAlpha: 1.0,
    radius: 0,
    borderSize: 0.0,
    borderColor: 0x000000,
    borderAlpha: 0.0,
    blendMode: engine.BlendMode.NORMAL
  });

  // modify values
  this.modifier = { left: 1.0, top: 1.0, width: 1.0, height: 1.0 };

  // fill and blend mode
  this.fillAlpha = this.settings.fillAlpha;
  this.blendMode = this.settings.blendMode;
};

// multiple inheritence
BackgroundView.prototype = Object.create(Graphics.prototype);
BackgroundView.prototype.constructor = BackgroundView;

BackgroundView.prototype.paint = function() {
  var parent = this.parent,
      settings = this.settings,
      modifier = this.modifier,
      padding = parent.padding,
      size = parent.size,
      margin = parent.margin,
      left = margin.left * modifier.left,
      top = margin.top * modifier.top,
      width = (size.width - margin.right - margin.left) * modifier.width,
      height = (size.height - margin.top - margin.bottom) * modifier.height,
      drawMethod = settings.radius > 0 ? 'drawRoundedRect' : 'drawRect';
  
  if(settings.fillAlpha > 0 || (settings.borderSize > 0 && settings.borderAlpha > 0)) {
    this.clear();

    // draw border
    if(settings.borderSize > 0 && settings.borderAlpha > 0) {
      this.lineStyle(settings.borderSize, settings.borderColor, settings.borderAlpha);
    }
    
    // draw fill
    if(settings.fillAlpha > 0) {
      this.beginFill(settings.color, settings.fillAlpha);
    }
    
    // draw
    this[drawMethod](left, top, width, height, settings.radius);
    
    // end fill
    if(settings.fillAlpha > 0) {
      this.endFill();
    }
  }
};

module.exports = BackgroundView;
