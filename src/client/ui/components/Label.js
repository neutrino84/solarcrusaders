
var engine = require('engine'),
    Panel = require('../Panel'),
    TextView = require('../views/TextView'),
    BackgroundView = require('../views/BackgroundView'),
    Class = engine.Class;

function Label(game, string, settings) {
  Panel.call(this, game, this);

  this.settings = Class.mixin(settings, {
    padding: [6, 12],
    border: [0]
  });

  this.setPadding.apply(this, this.settings.padding);
  this.setBorder.apply(this, this.settings.border);

  this.bg = new BackgroundView(game, settings.bg);
  this.textView = new TextView(game, string, settings.text);
  
  // create label
  this.addView(this.bg);
  this.addView(this.textView);
};

Label.prototype = Object.create(Panel.prototype);
Label.prototype.constructor = Label;

Label.prototype.calcPreferredSize = function(target) {
  return { width: this.textView.width, height: this.textView.height };
};

Label.prototype.doLayout = function() {
  this.textView.position.set(this.left, this.top);
};

Object.defineProperty(Label.prototype, 'tint', {
  get: function() {
    return this.textView.tint;
  },

  set: function(value) {
    this.textView.tint = value;
    this.invalidate();
  }
});

Object.defineProperty(Label.prototype, 'text', {
  get: function() {
    return this.textView.fontTexture.text;
  },

  set: function(value) {
    this.textView.fontTexture.text = value.toString();
    this.invalidate();
  }
});

module.exports = Label;
