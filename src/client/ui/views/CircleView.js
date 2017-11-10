
var engine = require('engine'),
    Graphics = engine.Graphics,
    Ship = require('../../objects/sector/minimap/Ship');
    Class = engine.Class;

function CircleView(game, settings) {
  Graphics.call(this, game);

  this.settings = Class.mixin(settings, {
    color: 0x008080,
    fillAlpha: 0.25,
    radius: 100,
    borderSize: 0.0,
    borderColor: 0x000000,
    borderAlpha: 0.0,
    blendMode: engine.BlendMode.NORMAL
  });

  
  this.fillAlpha = this.settings.fillAlpha;
  this.blendMode = this.settings.blendMode;
};

// multiple inheritence
CircleView.prototype = Object.create(Graphics.prototype);
CircleView.prototype.constructor = CircleView;

CircleView.prototype.paint = function() {
  var parent = this.parent,
      settings = this.settings,
      modifier = this.modifier,
      padding = parent.padding,
      size = parent.size,
      margin = parent.margin,
      left = margin.left + modifier.left,
      top = margin.top + modifier.top,
      width = (size.width - margin.right - margin.left) * modifier.width,
      height = (size.height - margin.top - margin.bottom) * modifier.height,
      drawMethod = 'drawCircle';
  
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
    this[drawMethod](100,100, settings.radius);
    
    // end fill
    if(settings.fillAlpha > 0) {
      this.endFill();
    }
  }
};


module.exports = CircleView;
