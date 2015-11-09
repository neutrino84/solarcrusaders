
var engine = require('engine'),
    xhr = require('xhr');

function RegistrationForm(game) {
  this.game = game;
  this.game.on('gui/registration', this._show, this);

  this.sectorState = this.game.state.states['sector'];

  this.modalElement = global.document.getElementById('registration-login');
  this.cancelElement = global.document.getElementById('registration-cancel');
  this.submitElement = global.document.getElementById('registration-submit');
  this.startElement = global.document.getElementById('registration-start');
  this.doneElement = global.document.getElementById('registration-done');

  this.formUsernameElement = global.document.getElementById('registration-username');
  this.formEmailElement = global.document.getElementById('registration-email');
  this.pass1Element = global.document.getElementById('registration-pass1');
  this.pass2Element = global.document.getElementById('registration-pass2');

  this.errorElement = global.document.getElementById('registration-error');

  // add events
  this.modalElement.addEventListener('click', this._hideBind = this._hide.bind(this));
  this.cancelElement.addEventListener('click', this._hideBind);
  this.submitElement.addEventListener('click', this._submitBind = this._submit.bind(this));
};

RegistrationForm.prototype.constructor = RegistrationForm;

RegistrationForm.prototype.destroy = function() {
  this.game.removeListener('gui/registration', this._show);

  this.modalElement.removeEventListener('click', this._hideBind);
  this.cancelElement.removeEventListener('click', this._hideBind);
  this.submitElement.removeEventListener('click', this._submitBind);

  this.modalElement.parentNode.removeChild(this.modalElement);

  this.game = this.sectorState = this.modalElement = this.cancelElement =
    this.submitElement = this.startElement = this.doneElement =
    this.formUsernameElement = this.formEmailElement = this.pass1Element =
    this.pass2Element = this.errorElement = undefined
};

RegistrationForm.prototype._show = function() {
  this.modalElement.style.display = 'block';
  this.sectorState.scrollLock = true;
};

RegistrationForm.prototype._hide = function(evt) {
  if(evt.target.id !== 'registration-login' && evt.target.id !== 'registration-cancel') { return; }
  this.modalElement.style.display = 'none';
  this.sectorState.scrollLock = false;
};

RegistrationForm.prototype._submit = function() {
  var self = this;

  self.startElement.style.display = 'none';

  // reset errors
  this.formUsernameElement.parentNode.style.border = '';
  this.formEmailElement.parentNode.style.border = '';
  this.pass1Element.parentNode.style.border = '';
  this.pass2Element.parentNode.style.border = '';
  this.errorElement.innerHTML = '';

  // submit form fields
  if(this.pass1Element.value === this.pass2Element.value) {
    xhr({
      method: 'post',
      body: JSON.stringify({
        'username': this.formUsernameElement.value,
        'email': this.formEmailElement.value,
        'password': this.pass1Element.value
      }),
      uri: '/register',
      headers: {
        'Content-Type': 'application/json'
      }
    }, function(err, resp, body) {
      var response = JSON.parse(body);
      if(response.error) {
        self.startElement.style.display = '';
        switch(response.error) {
          case '[[error:invalid-email]]':
            self.formEmailElement.parentNode.style.border = 'solid 1px #f00';
            self.errorElement.innerHTML = 'You have entered an invalid e-mail address.';
            break;
          case '[[error:invalid-username]]':
            self.formUsernameElement.parentNode.style.border = 'solid 1px #f00';
            self.errorElement.innerHTML = 'You have entered an invalid username.';
            break;
          case '[[error:username-too-short]]':
            self.formUsernameElement.parentNode.style.border = 'solid 1px #f00';
            self.errorElement.innerHTML = 'Your username is too short.';
            break;
          case '[[error:username-too-long]]':
            self.formUsernameElement.parentNode.style.border = 'solid 1px #f00';
            self.errorElement.innerHTML = 'Your username is too long.';
            break;
          case '[[error:invalid-password]]':
            self.pass1Element.parentNode.style.border = 'solid 1px #f00';
            self.pass2Element.parentNode.style.border = 'solid 1px #f00';
            self.errorElement.innerHTML = 'Your password is invalid.';
            break;
          case '[[error:password-too-short]]':
            self.pass1Element.parentNode.style.border = 'solid 1px #f00';
            self.pass2Element.parentNode.style.border = 'solid 1px #f00';
            self.errorElement.innerHTML = 'Your password is too short.';
            break;
          case '[[error:password-too-long]]':
            self.pass1Element.parentNode.style.border = 'solid 1px #f00';
            self.pass2Element.parentNode.style.border = 'solid 1px #f00';
            self.errorElement.innerHTML = 'Your password is too long.';
            break;
          case '[[error:email-exists]]':
            self.formEmailElement.parentNode.style.border = 'solid 1px #f00';
            self.errorElement.innerHTML = 'Your email has already been registered.';
            break;
          case '[[error:username-exists]]':
            self.formUsernameElement.parentNode.style.border = 'solid 1px #f00';
            self.errorElement.innerHTML = 'Your username has been taken.';
            break;
          default:
            self.errorElement.innerHTML = 'An unknown error has occurred.';
            break;
        }
      } else {
        self.startElement.style.display = 'none';
        self.doneElement.style.display = 'block';
      }
    });
  } else {
    self.startElement.style.display = '';
    this.pass1Element.parentNode.style.border = 'solid 1px #f00';
    this.pass2Element.parentNode.style.border = 'solid 1px #f00';
    this.errorElement.innerHTML = 'Passwords must match!';
  }
};

module.exports = RegistrationForm;
