
var engine = require('engine'),    
    Layout = require('../Layout'),
    Panel = require('../Panel'),
    Pane = require('../components/Pane'),
    Label = require('../components/Label'),
    BackgroundView = require('../views/BackgroundView'),
    Class = engine.Class;

function AlertMessage(game, settings) {
  Pane.call(this, game, {
    padding: [2, 0],
    border: [0],
    layout: { gap: 0 },
    bg: {
      fillAlpha: 0.4,
      color: 0x000000,
      borderSize: 0.0,
      radius: 0.0
    },
    message: {
      padding: [10, 12, 10, 10],
      border: [0],
      text: {
        fontName: 'medium',
        characterSpacing: 2
      },
      bg: {
        color: 0x000000,
        fillAlpha: 0.6,
        borderSize: 0
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
  this.message = new Label(game, '', this.settings.message);

  this.addView(this.bg);
  this.addPanel(Layout.USE_PS_SIZE, this.message);

  this.game.on('gui/message', this._message, this);
};

AlertMessage.prototype = Object.create(Pane.prototype);
AlertMessage.prototype.constructor = AlertMessage;

AlertMessage.prototype._message = function(message) {
  this.message.text = message || '';

  this.alpha = 1.0;
  this.messageTween = this.game.tweens.create(this);
  this.messageTween.to({ alpha: 0.0 }, 2500, engine.Easing.Quadratic.Out);
  this.messageTween.on('complete', this._close, this);
  this.messageTween.delay(6000);
  this.messageTween.start();

  this.game.emit('gui/modal', true, this, false, false);
};

AlertMessage.prototype._close = function() {
  this.game.emit('gui/modal', false);
};

module.exports = AlertMessage;
