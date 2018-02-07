
var engine = require('engine'),
    Label = require('./Label'),
    Class = engine.Class;

function Input(game, string, settings) {
  Label.call(this, game, string, Class.mixin(settings, {
    width: 144,
    height: 16,
    padding: [5, 3, 3, 3],
    border: [0],
    color: 0xFFFFFF,
    password: false,
    bg: {
      fillAlpha: 0.1,
      color: 0x000000,
      borderColor: 0x336699,
      blendMode: engine.BlendMode.ADD
    },
    text: {
      fontName: 'full'
    }
  }));

  this._value = '';
  this._placeholder = '';
  this._disabled = false;
  this._selected = false;

  this.next = null;

  this.cursor = new engine.Graphics(this.game);
  this.cursor.beginFill(0x6699CC, 1.0);
  this.cursor.drawRect(0, 0, 7, this.height);
  this.cursor.endFill();
  this.cursor.position.set(this.left, this.top);
  this.cursor.visible = false;

  this.addChild(this.cursor);

  this.placeholder = string.toUpperCase();
  
  this.textView.blendMode = engine.BlendMode.ADD;

  // even handling
  this.bg.on('inputUp', this._inputUp, this);
  this.bg.on('inputOver', this._inputOver, this);
  this.bg.on('inputOut', this._inputOut, this);
};

Input.prototype = Object.create(Label.prototype);
Input.prototype.constructor = Input;

Input.prototype.start = function() {
  this.bg.inputEnabled = true;
  this.bg.input.priorityID = 2;

  // listen for focus
  this.game.on('gui/focus/retain', this._retain, this);
};

Input.prototype.stop = function() {
  this.bg.inputEnabled = false;

  // ignore focus
  this.game.removeListener('gui/focus/retain', this._retain);
};

Input.prototype.focus = function() {
  this.selected = true;
  this.timer = this.game.clock.events.loop(250, this._cursor, this);
  this.game.input.on('keypress', this._keyPress, this);
  this.game.input.on('keydown', this._keyDown, this);
  this.cursor.visible = true;

  // capture keys
  this.game.input.keyboard.addKeyCapture([
    engine.Keyboard.TAB,
    engine.Keyboard.BACKSPACE,
    engine.Keyboard.DELETE,
    engine.Keyboard.ENTER
  ]);
};

Input.prototype.blur = function() {
  this.selected = false;
  this.game.clock.events.remove(this.timer);
  this.game.input.removeListener('keypress', this._keyPress, this);
  this.game.input.removeListener('keydown', this._keyDown, this);
  this.cursor.visible = false;

  // remove capture keys
  this.game.input.keyboard.removeKeyCapture([
    engine.Keyboard.TAB,
    engine.Keyboard.BACKSPACE,
    engine.Keyboard.DELETE,
    engine.Keyboard.ENTER
  ]);
};

Input.prototype._retain = function(object) {
  if(object !== this) {
    this.game.emit('gui/focus/release', this);
  }
};

Input.prototype._keyDown = function(event) {
  var keyCode = event.keyCode;
  switch(keyCode) {
    case engine.Keyboard.TAB:
      this.next && this.game.emit('gui/focus/retain', this.next);
      break;
    case engine.Keyboard.ENTER:
      this.emit('inputEnter', this);
      this.game.emit('gui/focus/release', this);
      break;
    case engine.Keyboard.DELETE:
    case engine.Keyboard.BACKSPACE:
      this.value = this._value.slice(0, this._value.length-1);
      break;
  }
};

Input.prototype._keyPress = function(event, key) {
  var textView = this.textView,
      keyCode = event.keyCode ? event.keyCode : event.which;
  switch(keyCode) {
    default:
      if(textView.font.frameKeys[keyCode] >= 0 || (
          this._value !== '' && keyCode === engine.Keyboard.SPACEBAR)) {
        this.value += key;
      }
      break;
  }
};

Input.prototype._inputUp = function() {
  this.emit('inputUp', this);
  this.game.emit('gui/focus/retain', this);
};

Input.prototype._inputOver = function() {
  this.bg.tint = 0x336699;
};

Input.prototype._inputOut = function() {
  this.bg.tint = 0xFFFFFF;
};

Input.prototype._update = function() {
  if(!this.selected && this._value === '') {
    this.text = this.placeholder;
    this.textView.visible = true;
    this.tint = 0x888888;
  } else {
    if(this._value === '') {
      this.textView.visible = false;
    } else {
      this.textView.visible = true;
      this.text = this._parsed();
    }
    this.tint = 0xFFFFFF;
  }
  this.cursor.position.x =
    this._value !== '' ?
      this.textView.width + this.left : this.left;
};

Input.prototype._cursor = function() {
  this.cursor.visible = !this.cursor.visible;
};

Input.prototype._encrypt = function() {
  var pass = '',
      length = this._value.length;
  for(var i=0; i<length; i++) {
    pass += '*';
  }
  return pass;
};

Input.prototype._parsed = function() {
  var value = this.settings.password ? this._encrypt() : this._value,
      length = value.length,
      character = this.textView.settings.character,
      width = this.size.width - this.left - this.right - 5,
      maxCharWidth = character.width + character.spacing.x + character.offset.x,
      maxChars = global.Math.floor(width / maxCharWidth);
  if(length < maxChars) {
    return value;
  } else {
    return value.slice(length-maxChars);
  }
};

Object.defineProperty(Input.prototype, 'placeholder', {
  set: function(value) {
    this._placeholder = value;
    this._update();
  },

  get: function() {
    return this._placeholder;
  }
});

Object.defineProperty(Input.prototype, 'value', {
  set: function(value) {
    this._value = value;
    this._update();
  },

  get: function() {
    return this._value;
  }
});

Object.defineProperty(Input.prototype, 'selected', {
  set: function(value) {
    this._selected = value;
    this._update();
  },

  get: function() {
    return this._selected;
  }
});

Object.defineProperty(Input.prototype, 'disabled', {
  set: function(value) {
    this._disabled = value;
  },

  get: function() {
    return this._disabled;
  }
});

module.exports = Input;
