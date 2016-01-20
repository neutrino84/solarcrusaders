
var engine = require('engine'),
    Layout = require('../Layout'),
    Pane = require('../components/Pane'),
    Label = require('../components/Label'),
    Image = require('../components/Image'),
    PaneFlash = require('../components/PaneFlash');

function StatPane(game, data) {
  Pane.call(this, game, {
    padding: [0],
    bg: { fillAlpha: 0.0 },
    title: {
      padding: [3, 5],
      bg: {
        color: 0x3868b8,
        fillAlpha: 0.12
      },
      layout: {
        ax: Layout.LEFT,
        ay: Layout.TOP,
        direction: Layout.HORIZONTAL,
        gap: 6
      } 
    },
    row: {
      padding: [6, 23, 6, 5],
      bg: {
        fillAlpha: 0.04,
        color: 0x3868b8
      },
      layout: {
        ax: Layout.LEFT,
        ay: Layout.TOP,
        direction: Layout.HORIZONTAL,
        gap: 0
      } 
    },
    key: {
      padding: [0],
      text: {
        fontName: 'medium'
      },
      bg: {
        fillAlpha: 0.0,
        borderSize: 0.0
      }
    },
    value: {
      padding: [0, 50, 0, 0],
      text: {
        fontName: 'medium'
      },
      bg: {
        fillAlpha: 0.0,
        borderSize: 0.0
      },
      align: 'right'
    }
  });

  this.data = data;
  this.statPanes = {};

  // build
  this.create(data);

  // listen
  this.game.on('gui/fitting/enhancement', this._enhancementSelect, this);
  this.game.on('gui/fitting/enhancement/reset', this.reset, this);
};

StatPane.prototype = Object.create(Pane.prototype);
StatPane.prototype.constructor = StatPane;

StatPane.prototype.reset = function() {
  var system,
      data = this.data,
      units = data.config.units,
      systems = data.config.systems,
      panes = this.statPanes,
      stat, stats, en, output, pane;
  for(var s in systems) {
    system = systems[s];
    stats = system.stats;
    for(var s in stats) {
      stat = stats[s];
      pane = panes[stat];
      if(pane) {
        label = pane.panels[1];
        label.text = this._calculateStatValue(data[stat], units[stat], 0) + ' ' + units[stat];
        label.tint = 0xBBBBBB;
        pane.invalidate(true);
      }
    }
  }
};

StatPane.prototype.create = function(data) {
  var system, systems = data.config.systems,
      stat, stats, units = data.config.units,
      en, output, pane;

  for(var s in systems) {
    system = systems[s];
    stats = system.stats;
    this.createSystemTitleRow(system.name);
    for(var s in stats) {
      stat = stats[s];
      output = this._calculateStatValue(data[stat], units[stat], 0);
      pane = this.createKeyValueRow(stat, output + ' ' + units[stat]);
      
      this.statPanes[stat] = pane;
      this.addPanel(Layout.STRETCH, pane);
    }
  }
};

StatPane.prototype.createSystemTitleRow = function(title) {
  var pane = new Pane(this.game, this.settings.title),
      label = new Label(this.game, title, this.settings.key),
      icon = new Image(this.game, 'texture-atlas', {
        padding: [0],
        border: [0],
        width: 12,
        height: 12,
        frame: 'system-' + title + '.png',
        bg: {
          fillAlpha: 0.0
        }
      });

  pane.layout.stretchLast = true;
  pane.addPanel(Layout.NONE, icon);
  pane.addPanel(Layout.NONE, label);
  
  this.addPanel(Layout.STRETCH, pane);
};

StatPane.prototype.createKeyValueRow = function(key, value) {
  var pane = new PaneFlash(this.game, this.settings.row),
      keyLabel = new Label(this.game, key, this.settings.key),
      valueLabel = new Label(this.game, value, this.settings.value);

  keyLabel.tint = 0x4797C7;
  keyLabel.blendMode = engine.BlendMode.ADD;

  valueLabel.tint = 0xBBBBBB;
  valueLabel.blendMode = engine.BlendMode.ADD;

  pane.layout.stretchLast = true;
  pane.addPanel(Layout.NONE, keyLabel);
  pane.addPanel(Layout.NONE, valueLabel);

  return pane;
};

StatPane.prototype._enhancementSelect = function(enhancement) {
  var stat, label,
      stats = enhancement.stats,
      panes = this.statPanes,
      data = this.data,
      config = data.config;

  // reset
  this.reset();

  for(var s in stats) {
    stat = stats[s];
    if(panes[s]) {
      label = panes[s].panels[1];
      label.text = this._calculateStatValue(data[s], config.units[s], stat.value) + ' ' + config.units[s];
      label.tint = 0x00FF00;
      
      panes[s].alert();
      panes[s].invalidate(true);
    }
  }
};

StatPane.prototype._calculateStatValue = function(stat, unit, bonus) {
  return engine.Math.roundTo((stat + bonus) * (unit === '%' ? 100 : 1), 3);
};

module.exports = StatPane;
