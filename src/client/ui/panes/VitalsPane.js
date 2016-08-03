
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

  // default styles
  this.settings = Class.mixin(settings, {
    padding: [0, 2, 2, 2],
    border: [0],
    bg: {
      fillAlpha: 1.0,
      color: 0x3868b8,
      borderSize: 0.0,
      blendMode: engine.BlendMode.ADD,
      radius: 0.0
    },
    content: {
      padding: [2],
      bg: {
        // fillAlpha: 0.8,
        color: 0x000000
      },
      layout: {
        direction: Layout.VERTICAL,
        gap: 2
      }
    },
    healthBar: {
      width: 205,
      height: 9,
      padding: [0],
      label: {
        color: 0x336699,
        padding: [2],
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
      width: 205,
      height: 9,
      padding: [0],
      label: {
        color: 0x336699,
        padding: [2],
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

  this.game.on('ship/player', this._player, this);
};

VitalsPane.prototype = Object.create(Panel.prototype);
VitalsPane.prototype.constructor = VitalsPane;

VitalsPane.prototype.addContent = function(constraint, panel) {
  this.content.addPanel(constraint, panel);
};

VitalsPane.prototype._player = function(ship) {
  var stats,
      game = this.game;

  this.data && this.data.removeListener('data', this._update, this);
  this.data = ship.details;
  this.data.on('data', this._update, this);

  this.healthBar.setMinMax(0, this.data.config.ship.stats.health);
  this.energyBar.setMinMax(0, this.data.config.ship.stats.energy);

  this._update(this.data);
};

VitalsPane.prototype._update = function(data) {
  var stats = this.data.config.ship.stats,
      healthBar = this.healthBar,
      energyBar = this.energyBar;
  data.health && healthBar.setProgressBar(global.Math.min(1.0, data.health / stats.health));
  data.energy && energyBar.setProgressBar(global.Math.min(1.0, data.energy / stats.energy));
};

module.exports = VitalsPane;
