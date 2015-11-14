
var engine = require('engine'),
    xhr = require('xhr');

function LoginForm(game) {
  this.game = game;

  this.sectorState = this.game.state.states['sector'];

  this.formElement = global.document.getElementById('login-form');
  this.emailElement = global.document.getElementById('login-email');
  this.passwordElement = global.document.getElementById('login-password');
  this.loginElement = global.document.getElementById('login-button');
  this.registerElement = global.document.getElementById('register-button');

  // add listeners
  this.loginElement.addEventListener('click', this._loginBind = this._login.bind(this));
  this.registerElement.addEventListener('click', this._registerBind = this._register.bind(this));

  this.emailElement.addEventListener('focus', this._focusBind = this._focus.bind(this));
  this.emailElement.addEventListener('blur', this._blurBind = this._blur.bind(this));
  this.passwordElement.addEventListener('focus', this._focusBind);
  this.passwordElement.addEventListener('blur', this._blurBind);

  this.game.input.on('onDown', this._clear, this);
  this.game.input.on('keypress', this._keypress, this);
};

LoginForm.prototype.constructor = LoginForm;

LoginForm.prototype.destroy = function() {
  this.game.input.removeListener('onDown', this._clear);
  this.game.input.removeListener('keypress', this._keypress);

  this.loginElement.removeEventListener('click', this._loginBind);
  this.registerElement.removeEventListener('click', this._registerBind);
  this.emailElement.removeEventListener('focus', this._focusBind);
  this.emailElement.removeEventListener('blur', this._blurBind);
  this.passwordElement.removeEventListener('focus', this._focusBind);
  this.passwordElement.removeEventListener('blur', this._blurBind);

  this.formElement.parentNode.removeChild(this.formElement);

  this.game = this.sectorState = this.formElement = this.emailElement =
    this.passwordElement = this.loginElement =
    this.registerElement = undefined;
};

LoginForm.prototype._keypress = function(key, event) {
  switch(event.keyCode) {
    case 13:
      this._blur();
      this._login();
      break;
  }
};

LoginForm.prototype._clear = function() {
  this.emailElement.blur();
  this.passwordElement.blur();
};

LoginForm.prototype._focus = function() {
  this.sectorState.scrollLock = true;
};

LoginForm.prototype._blur = function() {
  this.sectorState.scrollLock = false;
};

LoginForm.prototype._register = function() {
  this.game.emit('gui/registration');
};

LoginForm.prototype._login = function() {
  var self = this;

  this.formElement.style.display = 'none';

  if(this.passwordElement.value !== '' && this.emailElement.value !== '') {
    xhr({
      method: 'post',
      body: JSON.stringify({
        'username': this.emailElement.value,
        'password': this.passwordElement.value
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
          case '[[error:unknown-error]]':
          default:
            self.game.emit('gui/alert', 'an unknown error has occurred\nplease try again later');
            break;
        }
        this.formElement.style.display = '';
      } else if(user) {
        self.game.emit('gui/login', user);
      }
    });
  } else {
    this.formElement.style.display = '';
    self.game.emit('gui/alert', 'you have not entered valid login credentials');
  }
};

module.exports = LoginForm;
