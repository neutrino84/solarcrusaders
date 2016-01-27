
var engine = require('engine'),
    Panel = require('../Panel'),
    Layout = require('../Layout'),
    StackLayout = require('../layouts/StackLayout'),
    BorderLayout = require('../layouts/BorderLayout'),
    FlowLayout = require('../layouts/FlowLayout'),
    PercentLayout = require('../layouts/PercentLayout'),
    ListLayout = require('../layouts/ListLayout'),
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
      gap: 0,
      columns: 3,
      stretch: true
    },
    bg: {
      fillAlpha: 1.0,
      color: 0x3868b8,
      borderSize: 0.0
    }
  });

  // layout
  switch(this.settings.layout.type) {
    case 'stack':
      this.layout = new StackLayout();
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

  this.setPadding.apply(this, this.settings.padding);
  this.setBorder.apply(this, this.settings.border);

  // bg
  if(this.settings.bg) {
    this.bg = new BackgroundView(game, this.settings.bg);
    this.addView(this.bg);
  }
};

Pane.prototype = Object.create(Panel.prototype);
Pane.prototype.constructor = Pane;

module.exports = Pane;
