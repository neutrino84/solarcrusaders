
var engine = require('engine'),
    Panel = require('../Panel'),
    Layout = require('../Layout'),
    BorderLayout = require('../layouts/BorderLayout'),
    FlowLayout = require('../layouts/FlowLayout'),
    BackgroundView = require('../views/BackgroundView'),
    Class = engine.Class;

function Pane(game, settings) {
  Panel.call(this, game, true);

  this.settings = Class.mixin(settings, {
    padding: [0],
    border: [0],
    layout: {
      ax: Layout.LEFT,
      ay: Layout.TOP,
      direction: Layout.VERTICAL,
      gap: 0
    },
    bg: {
      fillAlpha: 1.0,
      color: 0x3868b8,
      borderSize: 0.0
    }
  });

  // layout
  switch(this.settings.layout.type) {
    case 'border':
      this.layout = new BorderLayout(
        this.settings.layout.ax, this.settings.layout.ay);
      break;
    default:
      this.layout = new FlowLayout(
        this.settings.layout.ax, this.settings.layout.ay,
        this.settings.layout.direction, this.settings.layout.gap);
      break;
  }
  
  // set size
  if(this.settings.width || this.settings.height) {
    this.setPreferredSize(
      this.settings.width,
      this.settings.height);
  }

  this.bg = new BackgroundView(game, this.settings.bg);

  this.setPadding.apply(this, this.settings.padding);
  this.setBorder.apply(this, this.settings.border);

  this.addView(this.bg);
};

Pane.prototype = Object.create(Panel.prototype);
Pane.prototype.constructor = Pane;

module.exports = Pane;
