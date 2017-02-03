
var engine = require('engine'),
    View = require('../View'),
    Graphics = engine.Graphics,
    Class = engine.Class;

function BackgroundView(game, settings) {
  Graphics.call(this, game);
  View.call(this);

  this.settings = Class.mixin(settings, {
    color: 0x000000,
    fillAlpha: 1.0,
    blendMode: engine.BlendMode.NORMAL,
    radius: 0,
    borderSize: 0.0,
    borderColor: 0x000000,
    borderAlpha: 0.0
  });

  this.fillAlpha = this.settings.fillAlpha;
  this.blendMode = this.settings.blendMode;
};

// multiple inheritence
BackgroundView.prototype = Object.create(Graphics.prototype);
BackgroundView.prototype.mixinPrototype(View.prototype);
BackgroundView.prototype.constructor = BackgroundView;

BackgroundView.prototype.paint = function() {
  var settings = this.settings,
      parent = this.parent,
      size = settings.size ? settings.size : {
        width: parent.size.width - parent.margin.right - parent.margin.left,
        height: parent.size.height - parent.margin.bottom - parent.margin.top
      },
      offset = settings.offset ? settings.offset : {
        x: parent.margin.left,
        y: parent.margin.top
      },
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
    this[drawMethod](offset.x, offset.y, size.width, size.height, settings.radius);
    
    // end fill
    if(settings.fillAlpha > 0) {
      this.endFill();
    }
  }

};

module.exports = BackgroundView;
