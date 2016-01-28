
var xhr = require('xhr'),
    engine = require('engine'),
    Layout = require('../Layout'),
    ContentPane = require('./ContentPane'),
    HardpointPane = require('./HardpointPane'),
    CargoPane = require('./CargoPane'),
    StatPane = require('./StatPane'),
    Pane = require('../components/Pane'),
    ButtonIcon = require('../components/ButtonIcon'),
    Class = engine.Class;

function FittingPane(game, settings) {
  Pane.call(this, game,
    Class.mixin(settings, {
      bg: {
        blendMode: engine.BlendMode.ADD
      },
      layout: {
        direction: Layout.HORIZONTAL
      },
      cargoPane: {
        padding: [1, 4, 1, 0],
        content: {
          padding: [2],
          layout: {
            gap: 2
          }
        },
        bg: false
      },
      fittingPane: {
        padding: [1, 4],
        content: {
          padding: [1],
          layout: {
            ax: Layout.LEFT,
            ay: Layout.TOP,
            direction: Layout.HORIZONTAL,
            gap: 1
          }
        },
        bg: false
      },
      close: {
        padding: [0, 2],
        border: [0],
        icon: {
          padding: [0],
          border: [0],
          frame: 'icon-close.png',
          bg: {
            highlight: false,
            borderSize: 0.0,
            fillAlpha: 0.0,
            radius: 0.0
          }
        },
        bg: {
          fillAlpha: 1.0,
          borderSize: 0.0,
          radius: 0.0
        }
      }
    })
  );

  this.cargoPane = new CargoPane(game, this.settings.cargoPane);
  this.fittingPane = new ContentPane(game, 'ship fitting', this.settings.fittingPane);

  this.closeButton = new ButtonIcon(game, 'texture-atlas', this.settings.close);
  this.closeButton.on('inputUp', this.close, this);

  this.fittingPane.title.addPanel(Layout.RIGHT, this.closeButton);

  this.addPanel(Layout.STRETCH, this.cargoPane);
  this.addPanel(Layout.STRETCH, this.fittingPane);

  this.game.on('ship/fitting', this.open, this);
  // this.game.on('gui/player/select', this.open, this);
};

FittingPane.prototype = Object.create(Pane.prototype);
FittingPane.prototype.constructor = FittingPane;

FittingPane.prototype.reset = function() {
  this.hardpointPane && this.hardpointPane.reset();
  this.statPane && this.statPane.reset();
};

FittingPane.prototype.open = function(data) {
  this.reset();

  this.bg.inputEnabled = true;
  this.bg.input.priorityID = 2;

  if(!this.hardpointPane && !this.statPane) {
    this.hardpointPane = new HardpointPane(game, data);
    this.statPane = new StatPane(game, data);

    this.fittingPane.addContent(Layout.STRETCH, this.hardpointPane);
    this.fittingPane.addContent(Layout.STRETCH, this.statPane);
  }

  this.cargoPane.start();
  this.fittingPane.button.start();
  this.closeButton.start();
  this.hardpointPane.start();

  this.invalidate(true);

  this.game.emit('gui/modal', true, this);
};

FittingPane.prototype.close = function() {
  this.reset();

  this.cargoPane.stop();
  this.fittingPane.button.stop();
  this.closeButton.stop();
  this.hardpointPane.stop();
  this.bg.inputEnabled = false;

  this.game.emit('gui/modal', false);
};

module.exports = FittingPane;
