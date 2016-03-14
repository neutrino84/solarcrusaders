
var engine = require('engine'),    
    Layout = require('../Layout'),
    Panel = require('../Panel'),
    Pane = require('../components/Pane'),
    Label = require('../components/Label'),
    BackgroundView = require('../views/BackgroundView'),
    Class = engine.Class;

function FlashMessage(game, settings) {
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
      padding: [5, 7, 5, 5],
      border: [0],
      text: {
        fontName: 'medium',
        characterSpacing: 1,
        lineSpacing: 4
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

FlashMessage.prototype = Object.create(Pane.prototype);
FlashMessage.prototype.constructor = FlashMessage;

FlashMessage.prototype._message = function(message, duration, delay) {
  duration = duration || 3500;
  delay = delay || 3000;

  this.message.text = message || '';

  this.alpha = 1.0;

  this.messageTween && this.messageTween.isRunning && this.messageTween.stop();
  this.messageTween = this.game.tweens.create(this);
  this.messageTween.to({ alpha: 0.0 }, duration, engine.Easing.Quadratic.Out);
  this.messageTween.on('complete', this._close, this);
  this.messageTween.delay(delay);
  this.messageTween.start();

  this.game.emit('gui/modal', true, this, false, false);
  // this.game.once('gui/modal', this._cancel, this);
};

// FlashMessage.prototype._cancel = function() {
//   this.messageTween.stop();
// };

FlashMessage.prototype._close = function() {
  this.game.removeListener('gui/modal', this._cancel, this);
  this.game.emit('gui/modal', false);
};

module.exports = FlashMessage;
