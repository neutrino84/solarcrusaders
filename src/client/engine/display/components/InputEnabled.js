
var InputHandler = require('../../controls/InputHandler');

function InputEnabled() {};

InputEnabled.prototype = {
  input: null,
  inputEnabled: {
    get: function() {
      return (this.input && this.input.enabled);
    },

    set: function(value) {
      if(value) {
        if(this.input === null) {
          this.input = new InputHandler(this);
          this.input.start();
        } else if(this.input && !this.input.enabled) {
          this.input.start();
        }
      } else {
        if(this.input && this.input.enabled) {
          this.input.stop();
        }
      }
    }
  }
};

module.exports = InputEnabled;
