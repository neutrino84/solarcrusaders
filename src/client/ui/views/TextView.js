
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

TextView.prototype.typewriter = function(string, interval) {
  interval = interval || 300;
  index = 0;

  this.game.clock.events.loop(interval, function() {
    this.font.text = string.slice(0, index);
    // console.log(this.font.text)
    index++;

    if(index > string.length){
      //access this event to call .stop() to stop the loop
    }
  }, this);
};

TextView.prototype.blink = function(interval) {
  var interval = interval || 500,
      on = true;

  this.game.clock.events.loop(interval, function() {
    if(on){
      this.alpha = 0;
      on = !on
    }else{
      this.alpha = 1;
      on = !on
    }
  }, this);
}

module.exports = TextView;
