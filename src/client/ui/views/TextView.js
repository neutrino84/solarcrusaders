
var engine = require('engine'),
    Sprite = engine.Sprite,
    Class = engine.Class;

function TextView(game, text, settings) {
  Sprite.call(this, game);

  this.defaultFont = settings && settings.fontName ? settings.fontName : 'medium';
  this.fonts = {
    'full': {
      fontName: 'full',
      multiline: true,
      charset: engine.Font.CHAR_SET_FULL,
      character: {
        width: 6,
        height: 8,
        size: 0,
        spacing: { x: 0, y: 2 },
        offset: { x: 0, y: 0 }
      }
    },
    'medium': {
      fontName: 'medium',
      multiline: true,
      autouppercase: true,
      character: {
        width: 8,
        height: 7,
        size: 0,
        spacing: { x: 0, y: 2 },
        offset: { x: 0, y: 0 }
      }
    },
    'small': {
      fontName: 'small',
      multiline: true,
      autouppercase: true,
      character: {
        width: 5,
        height: 5,
        size: 0,
        spacing: { x: 0, y: 2 },
        offset: { x: 0, y: 0 }
      }
    }
  }

  this.settings = Class.mixin(settings, this.fonts[this.defaultFont]);

  this.font = new engine.Font(game, this.settings.fontName, this.settings);
  this.font.text = text;

  this.texture = this.font.texture;
};

// multiple inheritence
TextView.prototype = Object.create(engine.Sprite.prototype);
TextView.prototype.constructor = TextView;

TextView.prototype.paint = function() {
  var parent = this.parent,
      settings = this.settings,
      padding = parent.padding,
      margin = parent.margin,
      left = margin.left,
      top = margin.top;
  
  this.position.set(margin.left + padding.left, margin.top + padding.top);
};

module.exports = TextView;
