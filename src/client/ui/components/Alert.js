
var engine = require('engine'),
    Layout = require('../Layout'),
    Panel = require('../Panel'),
    Pane = require('../components/Pane'),
    Label = require('../components/Label'),
    Button = require('../components/Button'),
    BackgroundView = require('../views/BackgroundView'),
    Class = engine.Class;

function Alert(game, settings) {
  Pane.call(this, game, {
    padding: [4, 4, 8, 4],
    border: [0],
    layout: { gap: 0 },
    bg: {
      fillAlpha: 1.0,
      color: 0x333333,
      borderSize: 2.0,
      borderColor: 0x666666,
      radius: 4.0
    },
    title: {
      padding: [4],
      border: [0],
      text: {
        tint: 0xFF3366,
        fontName: 'medium'
      },
      bg: {
        color: 0x222222,
        fillAlpha: 1.0,
        borderSize: 0
      }
    },
    message: {
      padding: [12, 4, 12, 4],
      border: [0],
      text: {
        fontName: 'medium',
        characterSpacing: 1,
        lineSpacing: 4
      },
      bg: {
        color: 0x333333,
        fillAlpha: 1.0,
        borderSize: 0
      }
    },
    button: {
      bg: {
        fillAlpha: 1.0,
        color: 0x333333,
        borderSize: 0.0,
        blendMode: engine.BlendMode.ADD,
        radius: 4.0
      },
      label: {
        padding: [4, 8],
        bg: {
          highlight: 0x333333,
          fillAlpha: 0.0,
          color: 0x222222,
          borderSize: 2.0,
          radius: 4.0
        }
      }
    }
  });

  // set size
  if(this.settings.width || this.settings.height) {
    this.setPreferredSize(
      this.settings.width, this.settings.height);
  }
  
  this.setPadding.apply(this, this.settings.padding);
  this.setBorder.apply(this, this.settings.border);

  this.bg = new BackgroundView(game, this.settings.bg);
  this.title = new Label(game, 'alert', this.settings.title);
  this.message = new Label(game, '', this.settings.message);
  this.button = new Button(game, 'close', this.settings.button);
  this.button.on('inputUp', this._close, this);

  this.addView(this.bg);

  this.addPanel(Layout.STRETCH, this.title);
  this.addPanel(Layout.USE_PS_SIZE, this.message);
  this.addPanel(Layout.USE_PS_SIZE, this.button);

  this.game.on('gui/alert', this._alert, this);
};

Alert.prototype = Object.create(Pane.prototype);
Alert.prototype.constructor = Alert;

Alert.prototype._alert = function(message, confirmation, title) {
  this.title.text = title || 'alert';
  this.message.text = message || '';
  if(confirmation === false) {
    this.button.visible = false;
  } else {
    this.button.label.text = confirmation || 'close';
  }
  this.game.emit('gui/modal', true, this);
};

Alert.prototype._close = function() {
  this.game.emit('gui/modal', false);
};

module.exports = Alert;
