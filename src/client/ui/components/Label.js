
var engine = require('engine'),
    Panel = require('../Panel'),
    TextView = require('../views/TextView'),
    BackgroundView = require('../views/BackgroundView'),
    Class = engine.Class;

function Label(game, string, settings) {
  Panel.call(this, game, this, settings.constraint);

  this.settings = Class.mixin(settings, {
    padding: [0],
    margin: [0],
    color: 0xFFFFFF,
    text: {},
    align: 'left'
  });

  this.setPadding.apply(this, this.settings.padding);
  this.setMargin.apply(this, this.settings.margin);

  if(this.settings.bg) {
    this.bg = new BackgroundView(game, this.settings.bg);
    this.addView(this.bg);
  }
  
  this.textView = new TextView(game, string, this.settings.text);
  this.textView.tint = this.settings.color;
  
  this.addView(this.textView);
};

Label.prototype = Object.create(Panel.prototype);
Label.prototype.constructor = Label;

Label.prototype.calcPreferredSize = function(target) {
  return {
    width: this.textView.width,
    height: this.textView.height
  };
};

Label.prototype.doLayout = function() {
  var left = this.left,
      settings = this.settings;
  if(settings.align === 'right') {
    left = this.size.width-this.textView.width-this.right;
  } else if(settings.align === 'center') {
    left = global.Math.floor(this.size.width/2-(this.textView.width/2));
  }
  this.textView.position.set(left, this.top);
};

Object.defineProperty(Label.prototype, 'blendMode', {
  get: function() {
    return this.textView.blendMode;
  },

  set: function(value) {
    this.textView.blendMode = value;
  }
});

Object.defineProperty(Label.prototype, 'tint', {
  get: function() {
    return this.textView.tint;
  },

  set: function(value) {
    this.textView.tint = value;
  }
});

Object.defineProperty(Label.prototype, 'text', {
  get: function() {
    return this.textView.font.text;
  },

  set: function(value) {
    this.textView.font.text = value.toString();
  }
});

module.exports = Label;
