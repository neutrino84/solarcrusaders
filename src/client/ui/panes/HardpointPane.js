
var engine = require('engine'),
    Layout = require('../Layout'),
    Pane = require('../components/Pane'),
    Image = require('../components/Image'),
    Label = require('../components/Label'),
    ButtonIcon = require('../components/ButtonIcon');

function HardpointPane(game, data) {
  Pane.call(this, game, {
    padding: [0],
    bg: {
      fillAlpha: 0.0
    },
    image: {
      padding: [0, 0, 0, 14],
      border: [0],
      bg: {
        fillAlpha: 0.0
      }
    },
    dpsAreaPane: {
      padding: [1, 2, 1, 2],
      layout: {
        type: 'percent',
        direction: Layout.HORIZONTAL,
        gap: 0,
        stretch: false
      },
      bg: {
        fillAlpha: 0.25,
        color: 0x000000
      }
    },
    dpsPane: {
      padding: [10],
      layout: {
        ax: Layout.CENTER,
        ay: Layout.CENTER
      },
      bg: {
        fillAlpha: 0.0,
        borderSize: 0.0,
        borderColor: 0x3868b8,
        borderAlpha: 1.0
      }
    },
    dpsValueLabel: {
      padding: [5],
      border: [0],
      text: {
        fontName: 'medium'
      },
      bg: {
        color: 0x000000,
        fillAlpha: 0.0,
        borderSize: 0.0
      }
    },
    dpsUnitsLabel: {
      padding: [0, 5, 5, 5],
      border: [0],
      text: {
        fontName: 'small'
      },
      bg: {
        color: 0x000000,
        fillAlpha: 0.0,
        borderSize: 0.0
      }
    },
    hardpointPane: {
      padding: [0],
      layout: {
        ax: Layout.CENTER,
        ay: Layout.CENTER,
        direction: Layout.VERTICAL,
        gap: 1
      },
      bg: {
        fillAlpha: 0.1,
        color: 0x000000
      }
    },
    enhancementPane: {
      padding: [1],
      layout: {
        ax: Layout.LEFT,
        ay: Layout.TOP,
        direction: Layout.HORIZONTAL,
        gap: 1
      },
      bg: {
        fillAlpha: 0.25,
        color: 0x000000
      }
    },
    enhancementDataPane: {
      width: 26,
      height: 26,
      padding: [0, 1, 1, 1],
      layout: {
        type: 'percent',
        direction: Layout.HORIZONTAL,
        gap: 1,
        stretch: false
      },
      bg: {
        fillAlpha: 0.0
      }
    },
    enhancementDataPaneLabel: {
      padding: [10, 5, 5, 5],
      text: {
        fontName: 'small'
      },
      align: 'center',
      bg: {
        fillAlpha: 0.25,
        borderSize: 0.0,
        color: 0x3868b8
      }
    }
  });

  // enhancement buttons
  this.buttons = [];

  // build
  this.create(data);

  // listen
  this.game.on('gui/fitting/enhancement', this._enhancementSelect, this);
  this.game.on('gui/fitting/enhancement/reset', this._enhancementButtonReset, this);
};

HardpointPane.prototype = Object.create(Pane.prototype);
HardpointPane.prototype.constructor = HardpointPane;

HardpointPane.prototype.create = function(data) {
  var config = data.config,
      enhancement, enhance,
      enhancements = data.enhancements,
      len = enhancements.length,
      button;

  this.image = new Image(game, data.chasis + '-outline', this.settings.image);
  this.image.image.alpha = 0.4;

  this.dpsAreaPane = new Pane(game, this.settings.dpsAreaPane);
  this.hardpointPane = new Pane(game, this.settings.hardpointPane);
  this.enhancementPane = new Pane(game, this.settings.enhancementPane);
  this.enhancementDataPane = this.createEnhancementDataPane();

  this.dpsAreaPane.addPanel(33, this.createDpsPane('12.1', 'critical'));
  this.dpsAreaPane.addPanel(33, this.createDpsPane(engine.Math.roundTo(data.damage * data.accuracy, 3).toString(), 'average', true));
  this.dpsAreaPane.addPanel(33, this.createDpsPane(data.damage.toString(), 'max'));

  for(var e=0; e<len; e++) {
    enhance = enhancements[e];
    enhancement = data.config.enhancement[enhance];

    button = this.createEnhancementButton(enhance);
    button.data = enhancement;
    button.on('inputUp', this._enhancementButtonSelect, this);

    this.buttons.push(button);
    this.enhancementPane.addPanel(Layout.NONE, button);
  }

  for(var e=e; e<7; e++) {
    button = this.createEnhancementButton('slot');
    button.disabled = true;
    button.tint = 0xAACCFF;

    this.enhancementPane.addPanel(Layout.NONE, button);
  }

  this.hardpointPane.addPanel(Layout.NONE, this.image);
  this.hardpointPane.addPanel(Layout.STRETCH, this.dpsAreaPane);

  this.addPanel(Layout.STRETCH, this.hardpointPane);
  this.addPanel(Layout.STRETCH, this.enhancementPane);
  this.addPanel(Layout.STRETCH, this.enhancementDataPane);
};

HardpointPane.prototype.createDpsPane = function(value, units, large) {
  var dpsPane = new Pane(game, this.settings.dpsPane),
      valueLabel = new Label(game, value, this.settings.dpsValueLabel),
      unitsLabel = new Label(game, units, this.settings.dpsUnitsLabel);

  large && valueLabel.textView.scale.set(2.0, 2.0);

  unitsLabel.tint = 0x4797C7;
  unitsLabel.blendMode = engine.BlendMode.ADD;

  dpsPane.addPanel(Layout.NONE, valueLabel);
  dpsPane.addPanel(Layout.NONE, unitsLabel);

  return dpsPane;
};

HardpointPane.prototype.createEnhancementButton = function(enhancement) {
  return new ButtonIcon(game,
    'texture-atlas', {
      padding: [0],
      bg: {
        fillAlpha: 1.0,
        color: 0x3868b8,
        radius: 0.0
      },
      icon: {
        padding: [1],
        border: [0],
        width: 38,
        height: 38,
        frame: 'enhancement-' + enhancement + '.png',
        bg: {
          fillAlpha: 0.0,
          borderSize: 0.0,
          radius: 0.0
        }
      }
    }
  );
};

HardpointPane.prototype.createEnhancementDataPane = function() {
  var enhancementDataPane = new Pane(game, this.settings.enhancementDataPane),
      costLabel = this.costLabel = new Label(game, 'cost --', this.settings.enhancementDataPaneLabel),
      activeLabel = this.activeLabel = new Label(game, 'active --', this.settings.enhancementDataPaneLabel)
      cooldownLabel = this.cooldownLabel = new Label(game, 'cooldown --', this.settings.enhancementDataPaneLabel);

  enhancementDataPane.addPanel(33, costLabel);
  enhancementDataPane.addPanel(33, activeLabel);
  enhancementDataPane.addPanel(33, cooldownLabel);

  return enhancementDataPane;
};

HardpointPane.prototype._enhancementSelect = function(enhancement) {
  this.costLabel.text = 'cost ' + enhancement.cost + ' gj';
  this.activeLabel.text = 'active ' + enhancement.active + ' s';
  this.cooldownLabel.text = 'cooldown ' + enhancement.cooldown + ' s';

  this.enhancementDataPane.invalidate(true);
};

HardpointPane.prototype._enhancementButtonReset = function() {
  var bu,
      buttons = this.buttons
  for(var i in buttons) {
    bu = buttons[i];
    bu.selected = false;
  }
};

HardpointPane.prototype._enhancementButtonSelect = function(button) {
  var data = button.data;
  if(!button.selected) {
    this._enhancementButtonReset();
    button.selected = true;
    this.game.emit('gui/fitting/enhancement', data);
  } else {
    this.game.emit('gui/fitting/enhancement/reset');
  }
};

module.exports = HardpointPane;
