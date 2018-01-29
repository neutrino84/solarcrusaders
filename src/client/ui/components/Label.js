
var engine = require('engine'),
    Layout = require('../Layout'),
    Pane = require('./Pane'),
    TextView = require('../views/TextView'),
    Class = engine.Class;

function Label(game, settings) {
  Pane.call(this, game, Class.mixin(settings, {
    constraint: Layout.USE_PS_SIZE,
    layout: {
      type: 'none'
    },
    font: {
      name: 'medium',
      text: '',
      color: 0xffffff,
      scale: 1.0
    }
  }));

  // create view
  this.view = new TextView(game, this.settings.font);
  this.view.scale.set(this.settings.font.scale, this.settings.font.scale);
  this.view.tint = this.settings.font.color;
  this.view.font.text = this.settings.font.text;

  // update preferred size
  this.setPreferredSize(
    this.settings.width || this.view.width,
    this.settings.height || this.view.height);

  // add text view
  this.addView(this.view);
};

Label.prototype = Object.create(Pane.prototype);
Label.prototype.constructor = Label;

Label.prototype.doLayout = function() {
  this.view.position.set(this.left, this.top);
};

Object.defineProperty(Label.prototype, 'blendMode', {
  get: function() {
    return this.view.blendMode;
  },

  set: function(value) {
    this.view.blendMode = value;
  }
});

Object.defineProperty(Label.prototype, 'tint', {
  get: function() {
    return this.view.tint;
  },

  set: function(value) {
    this.view.tint = value;
  }
});

Object.defineProperty(Label.prototype, 'text', {
  get: function() {
    return this.view.font.text;
  },

  set: function(value) {
    var view = this.view,
        settings = this.settings;

    // update text and texture
    view.font.text = value.toString();

    // update preferred size
    this.setPreferredSize(
      settings.width || view.width,
      settings.height || view.height);
  }
});

module.exports = Label;
