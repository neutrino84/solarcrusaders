
var engine = require('engine'),
    Panel = require('../Panel'),
    Layout = require('../Layout'),
    RasterLayout = require('../layouts/RasterLayout'),
    StackLayout = require('../layouts/StackLayout'),
    BorderLayout = require('../layouts/BorderLayout'),
    FlowLayout = require('../layouts/FlowLayout'),
    PercentLayout = require('../layouts/PercentLayout'),
    ListLayout = require('../layouts/ListLayout'),
    BackgroundView = require('../views/BackgroundView'),
    Class = engine.Class;

function Pane(game, settings) {
  Panel.call(this, game, true, settings.constraint || Layout.CENTER);

  this.settings = Class.mixin(settings, {
    padding: [0],
    margin: [0],
    layout: {
      type: 'stack'
    },
    bg: false
  });

  // layout
  switch(this.settings.layout.type) {
    case 'stack':
      this.layout = new StackLayout();
      break;
    case 'raster':
      this.layout = new RasterLayout(
        this.settings.layout.flat);
      break;
    case 'border':
      this.layout = new BorderLayout(
        this.settings.layout.gap[0],
        this.settings.layout.gap[1]);
      break;
    case 'percent':
      this.layout = new PercentLayout(
        this.settings.layout.direction,
        this.settings.layout.gap,
        this.settings.layout.stretch);
      break;
    case 'list':
      this.layout = new ListLayout(
        this.settings.layout.columns,
        this.settings.layout.gap[0],
        this.settings.layout.gap[1]);
      break;
    case 'flow':
      this.layout = new FlowLayout(
        this.settings.layout.ax, this.settings.layout.ay,
        this.settings.layout.direction, this.settings.layout.gap);
      break;
    case 'none':
      this.layout = this;
      break;
    default:
      throw Error('Pane requres a layout type');
      break;
  }

  // set padding and margin
  this.setPadding.apply(this, this.settings.padding);
  this.setMargin.apply(this, this.settings.margin);

  // set size
  if(this.settings.width || this.settings.height) {
    this.setPreferredSize(
      this.settings.width,
      this.settings.height);
  }

  // bg
  if(this.settings.bg) {
    this.bg = new BackgroundView(this.game, this.settings.bg);
    this.addView(this.bg);
  }
};

Pane.prototype = Object.create(Panel.prototype);
Pane.prototype.constructor = Pane;

module.exports = Pane;
