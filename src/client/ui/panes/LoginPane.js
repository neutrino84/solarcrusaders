
var xhr = require('xhr'),
    engine = require('engine'),
    Layout = require('../Layout'),
    Pane = require('../components/Pane'),
    Label = require('../components/Label'),
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
    user: {
      padding: [3, 4, 4, 3],
      width: 384,
      height: 24,
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
    buttons: {
      padding: [0],
      layout: {
        type: 'percent',
        direction: Layout.HORIZONTAL,
        gap: 1,
        stretch: false
      },
      bg: {
        fillAlpha: 0.5,
        color: 0x000000,
        radius: 0.0,
        borderSize: 0.0,
        blendMode: engine.BlendMode.MULTIPLY
      }
    },
    button: {
      padding: [0],
      border: [0],
      bg: {
        radius: 0.0,
        alertColor: 0x000000
      },
      label: {
        padding: [3, 4],
        bg: {
          highlight: false,
          fillAlpha: 0.0,
          borderSize: 0.0,
          radius: 0.0
        },
        text: {
          fontName: 'medium'
        }
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

  this.user = new Pane(game, this.settings.user);
  this.content = new Pane(game, this.settings.content);
  this.buttons = new Pane(game, this.settings.buttons);

  this.usernameInput = new Input(game, 'username');
  this.passwordInput = new Input(game, 'password', { password: true });
  this.loginButton = new Button(game, 'login', this.settings.login);
  this.loginButton.on('inputUp', this._login, this);

  this.logoutButton = new Button(game, 'logout', this.settings.login);
  this.logoutButton.on('inputUp', this._logout, this);

  this.registerButton = new Button(game, 'beta signup', this.settings.button);
  this.preorderButton = new Button(game, 'pre-order', this.settings.button);
  this.aboutButton = new Button(game, 'about', this.settings.button);
  this.forumsButton = new Button(game, 'forums', this.settings.button);

  this.forumsButton.on('inputUp', this._forums, this);
  this.registerButton.on('inputUp', this._register, this);
  this.registerButton.alert();

  this.user.addPanel(Layout.NONE, this.logoutButton);

  this.content.addPanel(Layout.NONE, this.usernameInput);
  this.content.addPanel(Layout.NONE, this.passwordInput);
  this.content.addPanel(Layout.NONE, this.loginButton);

  this.buttons.addPanel(25, this.registerButton);
  this.buttons.addPanel(25, this.preorderButton);
  this.buttons.addPanel(25, this.forumsButton);
  this.buttons.addPanel(25, this.aboutButton);

  this.addPanel(Layout.STRETCH, this.user);
  this.addPanel(Layout.STRETCH, this.content);
  this.addPanel(Layout.STRETCH, this.buttons);
};

LoginPane.prototype = Object.create(Pane.prototype);
LoginPane.prototype.constructor = LoginPane;

LoginPane.prototype.start = function() {
  this.usernameInput.start();
  this.passwordInput.start();
};

LoginPane.prototype.stop = function() {
  this.usernameInput.stop();
  this.passwordInput.stop();
};

LoginPane.prototype.login = function() {
  this.user.visible = true;
  this.content.visible = false;
  this.registerButton.label.text = 'invite';
  this.invalidate(true);
};

LoginPane.prototype.logout = function() {
  this.user.visible = false;
  this.content.visible = true;
  this.registerButton.label.text = 'beta signup';
  this.invalidate(true)
};

LoginPane.prototype._register = function() {
  this.game.emit('gui/registration');
};

LoginPane.prototype._forums = function() {
  global.document.location.href = 'http://forums.solarcrusaders.com/';
};

LoginPane.prototype._login = function() {
  var self = this;

  // this.formElement.style.display = 'none';

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
        // self.formElement.style.display = '';
      } else if(user) {
        self.game.emit('gui/loggedin', user);
      }
    });
  } else {
    // this.formElement.style.display = '';
    self.game.emit('gui/alert', 'you have not entered valid login credentials');
  }
};

LoginPane.prototype._logout = function() {
  var self = this,
      header = {
        method: 'get',
        uri: '/logout',
        headers: {
          'Content-Type': 'application/json'
        }
      };
  xhr(header, function(err, resp, body) {
    var response = JSON.parse(body),
        user = response.user,
        error = err || response.error;
    if(error) {
      self.game.emit('gui/alert', 'an unknown error has occurred');
    }
    self.game.emit('gui/logout');
  });
};

module.exports = LoginPane;
