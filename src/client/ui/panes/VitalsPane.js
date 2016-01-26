
var engine = require('engine'),
    Panel = require('../Panel'),
    Layout = require('../Layout'),
    Pane = require('../components/Pane'),
    Label = require('../components/Label'),
    ProgressBar = require('../components/ProgressBar'),
    BorderLayout = require('../layouts/BorderLayout'),
    BackgroundView = require('../views/BackgroundView'),
    Class = engine.Class;

function VitalsPane(game, settings) {
  Panel.call(this, game, new BorderLayout(0, 0));

  this.data = {};

  // default styles
  this.settings = Class.mixin(settings, {
    padding: [0, 4, 1, 4],
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
        // fillAlpha: 0.8,
        color: 0x000000
      },
      layout: {
        direction: Layout.VERTICAL,
        gap: 1
      }
    },
    healthBar: {
      width: 237,
      height: 7,
      padding: [0],
      label: {
        color: 0x336699,
        padding: [1],
        text: {
          fontName: 'small'
        }
      },
      bg: {
        fillAlpha: 0.25,
        color: 0x00FF00
      },
      progress: {
        color: 0x00FF00
      }
    },
    energyBar: {
      width: 237,
      height: 7,
      padding: [0],
      label: {
        color: 0x336699,
        padding: [1],
        text: {
          fontName: 'small'
        }
      },
      bg: {
        color: 0xFFAA00,
        fillAlpha: 0.25
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
  
  this.energyBar = new ProgressBar(game, this.settings.energyBar);
  this.energyBar.setProgressBar(1.0);

  this.addContent(Layout.NONE, this.healthBar);
  this.addContent(Layout.NONE, this.energyBar);

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
  var stats = data.config.ship.stats;
  if(this.data) {
    this.data = data;
    this.data.on('data', this._updateVitals, this);
    this.healthBar.setMinMax(0, stats.health);
    this.energyBar.setMinMax(0, stats.energy);
    this._updateVitals(data);
  }
};

VitalsPane.prototype._updateVitals = function(data) {
  var math = global.Math,
      stats = this.data.config.ship.stats,
      healthBar = this.healthBar,
      energyBar = this.energyBar;
  data.health && healthBar.setProgressBar(math.min(1.0, data.health / stats.health));
  data.energy && energyBar.setProgressBar(math.min(1.0, data.energy / stats.energy));
};

module.exports = VitalsPane;
