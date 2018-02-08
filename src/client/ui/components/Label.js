
var engine = require('engine'),
    Pane = require('./Pane'),
    Layout = require('../Layout'),
    TextView = require('../views/TextView'),
    Class = engine.Class;

function Label(game, settings) {
  Pane.call(this, game, Class.mixin(settings, {
    color: 0xFFFFFF,
    align: 'left',
    string: '',
    bg: false,
    text: {},
    font: {
      name: 'medium',
      text: '',
      color: 0xffffff,
      scale: 1.0
    }
  }));
  
  this.label = new TextView(game, this.settings.string, this.settings.text);
  this.label.tint = this.settings.color;

  this.setPreferredSize(this.label.width, this.label.height);
  
  this.addView(this.label);
};

Label.prototype = Object.create(Pane.prototype);
Label.prototype.constructor = Label;

Object.defineProperty(Label.prototype, 'blendMode', {
  get: function() {
    return this.label.blendMode;
  },

  set: function(value) {
    this.label.blendMode = value;
  }
});

Object.defineProperty(Label.prototype, 'tint', {
  get: function() {
    return this.label.tint;
  },

  set: function(value) {
    this.label.tint = value;
  }
});

Object.defineProperty(Label.prototype, 'text', {
  get: function() {
    return this.label.font.text;
  },

  set: function(value) {
    this.label.font.text = value.toString();
    this.setPreferredSize(this.label.width, this.label.height);
  }
});

module.exports = Label;
