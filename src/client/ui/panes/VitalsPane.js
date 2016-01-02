
var engine = require('engine'),
    Panel = require('../Panel'),
    Layout = require('../Layout'),
    Pane = require('../components/Pane'),
    Label = require('../components/Label'),
    ProgressBar = require('../components/ProgressBar'),
    BorderLayout = require('../layouts/BorderLayout'),
    BackgroundView = require('../views/BackgroundView'),
    Class = engine.Class;

function VitalsPane(game, string, settings) {
  Panel.call(this, game, new BorderLayout(0, 0));

  this.data = {};

  // default styles
  this.settings = Class.mixin(settings, {
    padding: [1, 4],
    border: [0],
    bg: {
      fillAlpha: 1.0,
      color: 0x3868b8,
      borderSize: 0.0,
      blendMode: engine.BlendMode.ADD,
      radius: 0.0
    },
    content: {
      padding: [1],
      bg: {
        fillAlpha: 0.8,
        color: 0x000000,
        radius: 0.0,
        borderSize: 0.0,
        blendMode: engine.BlendMode.MULTIPLY
      },
      layout: {
        direction: Layout.VERTICAL,
        gap: 1
      }
    },
    healthBar: {
      width: 189,
      height: 4,
      padding: [0],
      bg: {
        color: 0x000000
      },
      progress: {
        color: 0x00FF00
      }
    },
    reactorBar: {
      width: 189,
      height: 4,
      padding: [0],
      bg: {
        color: 0x000000
      },
      progress: {
        color: 0xFFAA00
      }
    }
  });

  if(this.settings.width || this.settings.height) {
    this.setPreferredSize(
      this.settings.width, this.settings.height);
  }

  this.setPadding.apply(this, this.settings.padding);
  this.setBorder.apply(this, this.settings.border);

  this.bg = new BackgroundView(game, this.settings.bg);
  this.content = new Pane(game, this.settings.content);

  this.healthBar = new ProgressBar(game, this.settings.healthBar);
  this.healthBar.setProgressBar(1.0);
  
  this.reactorBar = new ProgressBar(game, this.settings.reactorBar);
  this.reactorBar.setProgressBar(1.0);

  this.addContent(Layout.NONE, this.healthBar);
  this.addContent(Layout.NONE, this.reactorBar);

  this.addView(this.bg);
  this.addPanel(Layout.CENTER, this.content);

  this.game.on('gui/player/select', this._playerSelect, this);
};

VitalsPane.prototype = Object.create(Panel.prototype);
VitalsPane.prototype.constructor = VitalsPane;

VitalsPane.prototype.addContent = function(constraint, panel) {
  this.content.addPanel(constraint, panel);
};

VitalsPane.prototype._playerSelect = function(data) {
  if(this.data) {
    this.data = data;
    this.data.on('data', this._update, this);
  }
};

VitalsPane.prototype._update = function(data) {
  if(data.health) {
    this.healthBar.setProgressBar(
      global.Math.min(1.0, data.health / this.data.config.stats.health));
  }
  if(data.reactor) {
    this.reactorBar.setProgressBar(
      global.Math.min(1.0, data.reactor / this.data.config.stats.reactor));
  }
};

module.exports = VitalsPane;
