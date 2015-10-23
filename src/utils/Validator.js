var validator = require('validator');

module.exports = {
  isEmailValid: function(string) {
    return validator.isEmail(string);
  },

  isUsernameValid: function(name) {
    return name && name !== '' && /^[a-zA-Z0-9]+$/.test(name);
  }
};
