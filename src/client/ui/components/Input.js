
var engine = require('engine'),
    Label = require('./Label'),
    TextView = require('../views/TextView'),
    Class = engine.Class;

function Input(game, settings) {
  Label.call(this, game, Class.mixin(settings, {
    height: 8,
    width: 128,
    margin: [0],
    padding: [8],
    limit: 20,
    password: false,
    font: {
      name: 'full',
      color: 0xffffff
    },
    placeholder: {
      color: 0xffffff,
      text: '',
      alpha: 0.5
    },
    bg: {
      color: 0xffffff,
      fillAlpha: 1.0,
      borderAlpha: 1.0,
      borderSize: 1.0,
      borderColor: 0x000000
    }
  }));

  // register
  this.game.emit('ui/focus/register', this);

  // create placeholder
  this.placeholder = new TextView(game, this.settings.font);
  this.placeholder.scale.set(this.settings.font.scale, this.settings.font.scale);
  this.placeholder.tint = this.settings.placeholder.color;
  this.placeholder.font.text = this.settings.placeholder.text;
  this.placeholder.alpha = this.settings.placeholder.alpha;

  // add placeholder view
  this.addView(this.placeholder);

  // cursor location
  this.cursor = new engine.Graphics(this.game);
  this.cursor.beginFill(0xffffff, 0.75);
  this.cursor.drawRect(0, 0, 6, this.height);
  this.cursor.endFill();
  this.cursor.position.set(this.left, this.top);
  this.cursor.visible = false;
  this.addChild(this.cursor);

  // masker input mask
  this.masker = new engine.Graphics(this.game);
  this.masker.beginFill(0xffffff, 1.0);
  this.masker.drawRect(0, 0, 128, 8);
  this.masker.endFill();
  this.masker.position.set(this.left, this.top);
  this.masker.visible = true;
  this.view.mask = this.masker;
  this.addChild(this.masker);

  // even handling
  this.bg.on('inputUp', this._inputUp, this);
  this.bg.on('inputDown', this._inputDown, this);
};

Input.prototype = Object.create(Label.prototype);
Input.prototype.constructor = Input;

Input.prototype.doLayout = function() {
  this.placeholder.position.set(this.left, this.top);
};

Input.prototype.start = function() {
  this.bg.inputEnabled = true;
};

Input.prototype.stop = function() {
  this.bg.inputEnabled = false;
};

Input.prototype.focus = function() {
  this.cursor.visible = true;
  this.placeholder.visible = false;

  // listen to keys
  this.game.input.on('keypress', this.keypress, this);
  this.game.input.on('keydown', this.keydown, this);

  // add cursor timer
  this.timer = this.game.clock.events.loop(350, function() {
    this.cursor.visible = !this.cursor.visible;
  }, this);

  // // capture keys
  // this.game.input.keyboard.addKeyCapture([
  //   engine.Keyboard.TAB,
  //   engine.Keyboard.BACKSPACE,
  //   engine.Keyboard.DELETE,
  //   engine.Keyboard.ENTER
  // ]);
};

Input.prototype.blur = function() {
  this.cursor.visible = false;

  // placeholder
  if(this.text.length == 0) {
    this.placeholder.visible = true;
  }

  // listen to keys
  this.game.input.removeListener('keypress', this.keypress, this);
  this.game.input.removeListener('keydown', this.keydown, this);

  // remove cursor timer
  this.game.clock.events.remove(this.timer);

  // // remove capture keys
  // this.game.input.keyboard.removeKeyCapture([
  //   engine.Keyboard.TAB,
  //   engine.Keyboard.BACKSPACE,
  //   engine.Keyboard.DELETE,
  //   engine.Keyboard.ENTER
  // ]);
};

Input.prototype.keydown = function(event) {
  var keyCode = event.keyCode;
  switch(keyCode) {
    case engine.Keyboard.ENTER:
      //..
      break;
    case engine.Keyboard.TAB:
      event.preventDefault();
      break;
    case engine.Keyboard.DELETE:
    case engine.Keyboard.BACKSPACE:
      this.text = this.text.slice(0, this.text.length-1);
      break;
  }
};

Input.prototype.keypress = function(event, key) {
  var view = this.view,
      keyCode = event.keyCode ? event.keyCode : event.which;
  if(view.font.keys[keyCode] >= 0 ||
      keyCode === engine.Keyboard.SPACEBAR) {
    this.text += key;
  }
};

Input.prototype._inputUp = function() {
  this.game.emit('ui/focus/capture', this);
};

Input.prototype._inputDown = function() {
};

Object.defineProperty(Input.prototype, 'text', {
  get: function() {
    return this.view.font.text;
  },

  set: function(value) {
    var settings = this.settings,
        offset = {
          cursor: global.Math.min(value.length, settings.limit)*6,
          view: global.Math.min(settings.limit-value.length, 0)*6
        };

    // update cursor
    this.cursor.position.x = this.left + offset.cursor;
    this.cursor.position.y = this.top;

    // update text and texture
    this.view.font.text = value.toString();
    this.view.position.set(this.left + offset.view, this.top);

    // update preferred size
    this.setPreferredSize(
      settings.width || view.width,
      settings.height || view.height);
  }
});

module.exports = Input;
