
var xhr = require('xhr'),
    engine = require('engine'),
    Layout = require('../Layout'),
    Pane = require('../components/Pane'),
    Input = require('../components/Input'),
    Button = require('../components/Button');

function LoginPane(game, settings) {
  Pane.call(this, game, {
    padding: [1],
    bg: {
      fillAlpha: 1.0,
      color: 0x3868b8,
      borderSize: 0.0,
      blendMode: engine.BlendMode.ADD,
      radius: 0.0
    },
    content: {
      padding: [3, 4, 4, 3],
      layout: {
        direction: Layout.HORIZONTAL,
        gap: 4
      },
      bg: {
        fillAlpha: 0.8,
        color: 0x000000,
        radius: 0.0,
        borderSize: 0.0,
        blendMode: engine.BlendMode.MULTIPLY
      }
    },
    login: {
      padding: [1],
      border: [0],
      bg: {
        radius: 0.0,
        color: 0x336699,
        fillAlpha: 1.0
      },
      label: {
        padding: [4, 5, 3, 5],
        bg: {
          fillAlpha: 0.2,
          color: 0x000000,
          radius: 0.0,
          borderSize: 0.0,
          blendMode: engine.BlendMode.MULTIPLY
        },
        text: {
          fontName: 'full'
        }
      }
    }
  });

  this.content = new Pane(game, this.settings.content);

  this.usernameInput = new Input(game, 'username');
  this.passwordInput = new Input(game, 'password', { password: true });
  this.usernameInput.next = this.passwordInput;
  this.passwordInput.next = this.usernameInput;
  this.passwordInput.on('inputEnter', this._login, this);

  this.loginButton = new Button(game, 'login', this.settings.login);
  this.loginButton.on('inputUp', this._login, this);

  this.content.addPanel(Layout.NONE, this.usernameInput);
  this.content.addPanel(Layout.NONE, this.passwordInput);
  this.content.addPanel(Layout.NONE, this.loginButton);

  this.addPanel(Layout.STRETCH, this.content);
};

LoginPane.prototype = Object.create(Pane.prototype);
LoginPane.prototype.constructor = LoginPane;

LoginPane.prototype.start = function() {
  this.loginButton.start();
  this.usernameInput.start();
  this.passwordInput.start();
};

LoginPane.prototype.stop = function() {
  this.loginButton.stop();
  this.usernameInput.stop();
  this.passwordInput.stop();
};

LoginPane.prototype.login = function() {
  this.visible = false;
  this.invalidate(true);
};

LoginPane.prototype.logout = function() {
  this.visible = true;
  this.invalidate(true)
};

LoginPane.prototype._login = function() {
  var self = this;

  if(this.usernameInput.value !== '' && this.passwordInput.value !== '') {
    xhr({
      method: 'post',
      body: JSON.stringify({
        'username': this.usernameInput.value,
        'password': this.passwordInput.value
      }),
      uri: '/login',
      headers: {
        'Content-Type': 'application/json'
      }
    }, function(err, resp, body) {
      var response = JSON.parse(body),
          user = response.user,
          error = response.error;
      if(error) {
        switch(error) {
          case '[[error:invalid-credentials]]':
            self.game.emit('gui/alert', 'you have entered invalid login credentials\nonly 5 login attempts allowed');
            break;
          case '[[error:user-banned]]':
            self.game.emit('gui/alert', 'your account has been banned\nplease contact support');
            break;
          case '[[error:ip-locked]]':
            self.game.emit('gui/alert', 'you are temporarily blocked for too many logins\nplease try again later');
            break;
          case '[[error:server-locked]]':
            self.game.emit('gui/alert', 'the server is temporarily locked to new logins');
            break;
          case '[[error:unknown-error]]':
          default:
            self.game.emit('gui/alert', 'an unknown error has occurred\nplease try again later');
            break;
        }
      } else if(user) {
        self.game.emit('gui/login', user);
      }
    });
  } else {
    self.game.emit('gui/alert', 'you have not entered valid login credentials');
  }
};

module.exports = LoginPane;
