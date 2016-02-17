var Key = require('./Key');

function Keyboard(game) {
  this.game = game;
  this.enabled = true;
  this.event = null;

  this.pressEvent = null;

  this.callbackContext = this;
  this.onDownCallback = null;
  this.onPressCallback = null;
  this.onUpCallback = null;

  this._keys = [];
  this._capture = [];

  this._onKeyDown = null;
  this._onKeyPress = null;
  this._onKeyUp = null;

  this._i = 0;
  this._k = 0;
};

Keyboard.prototype = {

  addCallbacks: function(context, onDown, onUp, onPress) {
    this.callbackContext = context;

    if(onDown !== undefined && onDown !== null) {
      this.onDownCallback = onDown;
    }

    if(onUp !== undefined && onUp !== null) {
      this.onUpCallback = onUp;
    }
    
    if(onPress !== undefined && onPress !== null) {
      this.onPressCallback = onPress;
    }
  },

  addKey: function(keycode) {
    if(!this._keys[keycode]) {
      this._keys[keycode] = new Key(this.game, keycode);
      this.addKeyCapture(keycode);
    }
    return this._keys[keycode];
  },

  addKeys: function(keys) {
    var output = {};
    for(var key in keys) {
      output[key] = this.addKey(keys[key]);
    }
    return output;
  },

  removeKey: function(keycode) {
    if(this._keys[keycode]) {
      this._keys[keycode] = null;
      this.removeKeyCapture(keycode);
    }
  },

  createCursorKeys: function() {
    return this.addKeys({
      'up': Keyboard.UP, 'down': Keyboard.DOWN,
      'left': Keyboard.LEFT, 'right': Keyboard.RIGHT
    });
  },

  start: function() {
    if(this._onKeyDown !== null) {
      //  Avoid setting multiple listeners
      return;
    }

    var self = this;
    this._onKeyDown = function(event) {
      return self.processKeyDown(event);
    };

    this._onKeyUp = function(event) {
      return self.processKeyUp(event);
    };

    this._onKeyPress = function(event) {
      return self.processKeyPress(event);
    };

    global.addEventListener('keydown', this._onKeyDown, false);
    global.addEventListener('keyup', this._onKeyUp, false);
    global.addEventListener('keypress', this._onKeyPress, false);
  },

  stop: function() {
    global.removeEventListener('keydown', this._onKeyDown);
    global.removeEventListener('keyup', this._onKeyUp);
    global.removeEventListener('keypress', this._onKeyPress);

    this._onKeyDown = null;
    this._onKeyUp = null;
    this._onKeyPress = null;
  },

  destroy: function() {
    this.stop();
    this.clearCaptures();

    this._keys.length = 0;
    this._i = 0;
  },

  addKeyCapture: function(keycode) {
    if(typeof keycode === 'object') {
      for(var key in keycode) {
        this._capture[keycode[key]] = true;
      }
    } else {
      this._capture[keycode] = true;
    }
  },

  removeKeyCapture: function(keycode) {
    if(typeof keycode === 'object') {
      for(var key in keycode) {
        delete this._capture[keycode[key]];
      }
    } else {
      delete this._capture[keycode];
    }
  },

  clearCaptures: function() {
    this._capture = {};
  },

  update: function() {
    this._i = this._keys.length;
    while (this._i--) {
      if(this._keys[this._i]) {
        this._keys[this._i].update();
      }
    }
  },

  processKeyDown: function(event) {
    this.event = event;

    if(!this.game.input.enabled || !this.enabled) {
      return;
    }

    //   The event is being captured but another hotkey may need it
    if(this._capture[event.keyCode]) {
      event.preventDefault();
    }

    if(!this._keys[event.keyCode]) {
      this._keys[event.keyCode] = new Key(this.game, event.keyCode);
    }

    this._keys[event.keyCode].processKeyDown(event);
    this._k = event.keyCode;

    if(this.onDownCallback) {
      this.onDownCallback.call(this.callbackContext, event, global.String.fromCharCode(event.charCode));
    }
  },

  processKeyPress: function(event) {
    this.pressEvent = event;

    if(!this.game.input.enabled || !this.enabled) {
      return;
    }

    if(this.onPressCallback) {
      this.onPressCallback.call(this.callbackContext, event, global.String.fromCharCode(event.charCode));
    }
  },

  processKeyUp: function(event) {
    this.event = event;

    if(!this.game.input.enabled || !this.enabled) {
      return;
    }

    if(this._capture[event.keyCode]) {
      event.preventDefault();
    }

    if(!this._keys[event.keyCode]) {
      this._keys[event.keyCode] = new Key(this.game, event.keyCode);
    }

    this._keys[event.keyCode].processKeyUp(event);

    if(this.onUpCallback) {
      this.onUpCallback.call(this.callbackContext, event, global.String.fromCharCode(event.charCode));
    }
  },

  reset: function(hard) {
    if(hard === undefined) { hard = true; }

    this.event = null;

    var i = this._keys.length;
    while (i--) {
      if(this._keys[i]) {
        this._keys[i].reset(hard);
      }
    }
  },

  downDuration: function(keycode, duration) {
    if(this._keys[keycode]) {
      return this._keys[keycode].downDuration(duration);
    } else {
      return null;
    }
  },

  upDuration: function(keycode, duration) {
    if(this._keys[keycode]) {
      return this._keys[keycode].upDuration(duration);
    } else {
      return null;
    }
  },

  isDown: function(keycode) {
    if(this._keys[keycode]) {
      return this._keys[keycode].isDown;
    } else {
      return null;
    }
  }
};

Object.defineProperty(Keyboard.prototype, 'lastChar', {
  get: function() {
    if(this.event.charCode === 32) {
      return '';
    } else {
      return String.fromCharCode(this.pressEvent.charCode);
    }
  }
});


Object.defineProperty(Keyboard.prototype, 'lastKey', {
  get: function() {
    return this._keys[this._k];
  }
});

Keyboard.prototype.constructor = Keyboard;

Keyboard.A = "A".charCodeAt(0);
Keyboard.B = "B".charCodeAt(0);
Keyboard.C = "C".charCodeAt(0);
Keyboard.D = "D".charCodeAt(0);
Keyboard.E = "E".charCodeAt(0);
Keyboard.F = "F".charCodeAt(0);
Keyboard.G = "G".charCodeAt(0);
Keyboard.H = "H".charCodeAt(0);
Keyboard.I = "I".charCodeAt(0);
Keyboard.J = "J".charCodeAt(0);
Keyboard.K = "K".charCodeAt(0);
Keyboard.L = "L".charCodeAt(0);
Keyboard.M = "M".charCodeAt(0);
Keyboard.N = "N".charCodeAt(0);
Keyboard.O = "O".charCodeAt(0);
Keyboard.P = "P".charCodeAt(0);
Keyboard.Q = "Q".charCodeAt(0);
Keyboard.R = "R".charCodeAt(0);
Keyboard.S = "S".charCodeAt(0);
Keyboard.T = "T".charCodeAt(0);
Keyboard.U = "U".charCodeAt(0);
Keyboard.V = "V".charCodeAt(0);
Keyboard.W = "W".charCodeAt(0);
Keyboard.X = "X".charCodeAt(0);
Keyboard.Y = "Y".charCodeAt(0);
Keyboard.Z = "Z".charCodeAt(0);
Keyboard.ZERO = "0".charCodeAt(0);
Keyboard.ONE = "1".charCodeAt(0);
Keyboard.TWO = "2".charCodeAt(0);
Keyboard.THREE = "3".charCodeAt(0);
Keyboard.FOUR = "4".charCodeAt(0);
Keyboard.FIVE = "5".charCodeAt(0);
Keyboard.SIX = "6".charCodeAt(0);
Keyboard.SEVEN = "7".charCodeAt(0);
Keyboard.EIGHT = "8".charCodeAt(0);
Keyboard.NINE = "9".charCodeAt(0);
Keyboard.NUMPAD_0 = 96;
Keyboard.NUMPAD_1 = 97;
Keyboard.NUMPAD_2 = 98;
Keyboard.NUMPAD_3 = 99;
Keyboard.NUMPAD_4 = 100;
Keyboard.NUMPAD_5 = 101;
Keyboard.NUMPAD_6 = 102;
Keyboard.NUMPAD_7 = 103;
Keyboard.NUMPAD_8 = 104;
Keyboard.NUMPAD_9 = 105;
Keyboard.NUMPAD_MULTIPLY = 106;
Keyboard.NUMPAD_ADD = 107;
Keyboard.NUMPAD_ENTER = 108;
Keyboard.NUMPAD_SUBTRACT = 109;
Keyboard.NUMPAD_DECIMAL = 110;
Keyboard.NUMPAD_DIVIDE = 111;
Keyboard.F1 = 112;
Keyboard.F2 = 113;
Keyboard.F3 = 114;
Keyboard.F4 = 115;
Keyboard.F5 = 116;
Keyboard.F6 = 117;
Keyboard.F7 = 118;
Keyboard.F8 = 119;
Keyboard.F9 = 120;
Keyboard.F10 = 121;
Keyboard.F11 = 122;
Keyboard.F12 = 123;
Keyboard.F13 = 124;
Keyboard.F14 = 125;
Keyboard.F15 = 126;
Keyboard.COLON = 186;
Keyboard.EQUALS = 187;
Keyboard.COMMA = 188;
Keyboard.UNDERSCORE = 189;
Keyboard.PERIOD = 190;
Keyboard.QUESTION_MARK = 191;
Keyboard.TILDE = 192;
Keyboard.OPEN_BRACKET = 219;
Keyboard.BACKWARD_SLASH = 220;
Keyboard.CLOSED_BRACKET = 221;
Keyboard.QUOTES = 222;
Keyboard.BACKSPACE = 8;
Keyboard.TAB = 9;
Keyboard.CLEAR = 12;
Keyboard.ENTER = 13;
Keyboard.SHIFT = 16;
Keyboard.CONTROL = 17;
Keyboard.ALT = 18;
Keyboard.CAPS_LOCK = 20;
Keyboard.ESC = 27;
Keyboard.SPACEBAR = 32;
Keyboard.PAGE_UP = 33;
Keyboard.PAGE_DOWN = 34;
Keyboard.END = 35;
Keyboard.HOME = 36;
Keyboard.LEFT = 37;
Keyboard.UP = 38;
Keyboard.RIGHT = 39;
Keyboard.DOWN = 40;
Keyboard.PLUS = 43;
Keyboard.MINUS = 44;
Keyboard.INSERT = 45;
Keyboard.DELETE = 46;
Keyboard.HELP = 47;
Keyboard.NUM_LOCK = 144;

module.exports = Keyboard;
