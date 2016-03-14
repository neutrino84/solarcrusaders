
var engine = require('engine'),
    Layout = require('../Layout'),
    Pane = require('../components/Pane'),
    Button = require('../components/Button'),
    Class = engine.Class;

function MenuPane(game, settings) {
  Pane.call(this, game, {
    padding: [0],
    layout: {
      ax: Layout.CENTER,
      ay: Layout.CENTER,
      direction: Layout.HORIZONTAL,
      gap: 5
    },
    bg: {
      fillAlpha: 0.0,
      color: 0x000000,
      radius: 0.0
    },
    button: {
      padding: [1],
      border: [0],
      bg: {
        radius: 0.0,
        fillAlpha: 1.0,
        color: 0x3868b8,
        blendMode: engine.BlendMode.ADD,
        alertColor: 0x000000
      },
      label: {
        padding: [5, 14],
        bg: {
          highlight: false,
          fillAlpha: 0.8,
          color: 0x000000,
          blendMode: engine.BlendMode.MULTIPLY,
          borderSize: 0.0,
          radius: 0.0
        },
        text: {
          fontName: 'medium'
        }
      }
    }
  });

  this.homeButton = new Button(game, 'home', this.settings.button);
  this.forumsButton = new Button(game, 'forums', this.settings.button);
  this.inviteButton = new Button(game, 'invite friends', this.settings.button);
  this.registerButton = new Button(game, 'register',
    Class.mixin({
      label: { padding: [8, 16] }
    }, this.settings.button));


  this.homeButton.on('inputUp', this._home);
  this.inviteButton.on('inputUp', this._invite);
  this.forumsButton.on('inputUp', this._forums);
  this.registerButton.on('inputUp', this._register, this);
  this.registerButton.alert();

  this.addPanel(Layout.CENTER, this.homeButton);
  this.addPanel(Layout.CENTER, this.registerButton);
  this.addPanel(Layout.CENTER, this.inviteButton);
  this.addPanel(Layout.CENTER, this.forumsButton);
};

MenuPane.prototype = Object.create(Pane.prototype);
MenuPane.prototype.constructor = MenuPane;

MenuPane.prototype.login = function() {
  this.registerButton.stop();
  this.registerButton.visible = false;
  this.inviteButton.start();
  this.inviteButton.visible = true;
  this.inviteButton.alert();
  this.invalidate(true);
};

MenuPane.prototype.logout = function() {
  this.registerButton.start();
  this.registerButton.visible = true;
  this.inviteButton.stop();
  this.inviteButton.visible = false;
  this.invalidate(true)
};

MenuPane.prototype._invite = function() {
  this.game.emit('gui/message', 'this feature is not yet supported', 1000, 1000);
};

MenuPane.prototype._home = function() {
  global.document.location.href = 'http://solarcrusaders.com/';
};

MenuPane.prototype._register = function() {
  this.game.emit('gui/registration');
};

MenuPane.prototype._forums = function() {
  global.document.location.href = 'http://forums.solarcrusaders.com/';
};

module.exports = MenuPane;
