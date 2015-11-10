
var engine = require('engine'),
    View = require('../View'),
    Sprite = engine.Sprite,
    Class = engine.Class;

function TextView(game, text, settings) {
  Sprite.call(this, game);
  View.call(this);

  this.defaultFont = settings && settings.fontName ? settings.fontName : 'vt323';
  this.fonts = {
    'vt323': {
      fontName: 'vt323',
      characterWidth: 8,
      characterHeight: 10,
      xSpacing: 2,
      ySpacing: 0,
      xOffset: 1,
      yOffset: 1,
      charsPerRow: 37,
      tint: 0xffffff
    },
    'medium': {
      fontName: 'medium',
      characterWidth: 7,
      characterWidth: 8,
      xSpacing: 0,
      ySpacing: 0,
      xOffset: 0,
      yOffset: 0,
      charsPerRow: 0,
      tint: 0xffffff
    },
    'small': {
      fontName: 'small',
      characterWidth: 5,
      characterWidth: 5,
      xSpacing: 0,
      ySpacing: 0,
      xOffset: 0,
      yOffset: 0,
      charsPerRow: 0,
      tint: 0xffffff
    }
  }

  // init settings
  this.settings = Class.mixin(settings, this.fonts[this.defaultFont]);

  // create font texture
  this.fontTexture = new engine.RetroFont(game, this.settings.fontName, this.settings);
  this.fontTexture.multiLine = true;
  this.fontTexture.text = text;
  this.fontTexture.customSpacingX = this.settings.characterSpacing || 0;
  this.fontTexture.customSpacingY = this.settings.lineSpacing || 0;
  
  // set tint
  this.tint = this.settings.tint;

  // set font texture
  this.texture = this.fontTexture;
};

// multiple inheritence
TextView.prototype = Object.create(engine.Sprite.prototype);
TextView.prototype.mixinPrototype(View.prototype);
TextView.prototype.constructor = TextView;

module.exports = TextView;
