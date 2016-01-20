
var xhr = require('xhr'),
    engine = require('engine'),
    Layout = require('../Layout'),
    ContentPane = require('./ContentPane'),
    HardpointPane = require('./HardpointPane'),
    StatPane = require('./StatPane'),
    Pane = require('../components/Pane'),
    ButtonIcon = require('../components/ButtonIcon'),
    Class = engine.Class;

function FittingPane(game, settings) {
  ContentPane.call(this, game, 'ship fittings',
    Class.mixin(settings, {
      padding: [1, 4, 1, 4],
      content: {
        padding: [1],
        layout: {
          ax: Layout.LEFT,
          ay: Layout.TOP,
          direction: Layout.HORIZONTAL,
          gap: 1
        },
        bg: {}
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

  this.closeButton = new ButtonIcon(game, 'texture-atlas', this.settings.close);
  this.closeButton.on('inputUp', this.close, this);

  this.title.addPanel(Layout.RIGHT, this.closeButton);

  this.game.on('ship/fitting', this.open, this);
  // this.game.on('gui/player/select', this.open, this);
};

FittingPane.prototype = Object.create(ContentPane.prototype);
FittingPane.prototype.constructor = FittingPane;

FittingPane.prototype.reset = function() {
  this.hardpointPane && this.removeContent(this.hardpointPane);
  this.statPane && this.removeContent(this.statPane);
  this.statPane = this.hardpointPane = undefined;
};

FittingPane.prototype.open = function(data) {
  this.reset();

  this.bg.inputEnabled = true;
  this.bg.input.priorityID = 2;

  this.hardpointPane = new HardpointPane(game, data);
  this.statPane = new StatPane(game, data);

  this.addContent(Layout.STRETCH, this.hardpointPane);
  this.addContent(Layout.STRETCH, this.statPane);

  this.invalidate(true);

  this.game.emit('gui/modal', true, this);
};

FittingPane.prototype.close = function() {
  this.reset();
  this.bg.inputEnabled = false;
  this.game.emit('gui/modal', false);
};


module.exports = FittingPane;
