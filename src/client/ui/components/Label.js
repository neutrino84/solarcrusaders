
var engine = require('engine'),
    Layout = require('../Layout'),
    Pane = require('./Pane'),
    TextView = require('../views/TextView'),
    Class = engine.Class;

function Label(game, settings) {
  Pane.call(this, game, Class.mixin(settings, {
    constraint: Layout.USE_PS_SIZE,
    font: {
      name: 'medium',
      color: 0xffffff
    },
    bg: false
  }));
  
  // create view
  this.view = new TextView(game, settings.font);

  // set preferred size
  this.setPreferredSize(
    settings.width || this.view.width,
    settings.height || this.view.height);

  // add text view
  this.addView(this.view);
};

Label.prototype = Object.create(Pane.prototype);
Label.prototype.constructor = Label;

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
    view.texture = view.font.texture;

    // update preferred size
    this.setPreferredSize(
      settings.width || view.width,
      settings.height || view.height);
  }
});

module.exports = Label;
