
var engine = require('engine'),
    Label = require('./Label'),
    TextView = require('../views/TextView'),
    Class = engine.Class;

function Input(game, settings) {
  Label.call(this, game, Class.mixin(settings, {
    height: 13,
    width:100,
    margin: [0],
    padding: [8],
    limit: 20,
    password: false,
    text: {
      fontName: 'full',
      color: 0xffffff
    },
    color: 0xFFFFFF,
    align: 'left',
    placeholder: {
      color: 0xffffff,
      text: 'heyo what up',
      alpha: 0.5
    },
    bg: {
      fillAlpha: 0.05,
      color: 0xffffff
    },
    string: ''
  }));

  


  // create placeholder
  this.placeholder = new TextView(game, '', this.settings.placeholder);
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
  // this.masker = new engine.Graphics(this.game);
  // this.masker.beginFill(0xffffff, 1.0);
  // this.masker.drawRect(0, 0, 128, 8);
  // this.masker.endFill();
  // this.masker.position.set(this.left, this.top);
  // this.masker.visible = true;
  // this.label.mask = this.masker;
  // this.addChild(this.masker);

  // even handling
  this.bg.on('inputUp', this._inputUp, this);
  this.bg.on('inputDown', this._inputDown, this);


  this.true = false; 

  this.label.font.text = ' ';
};

Input.prototype = Object.create(Label.prototype);
Input.prototype.constructor = Input;

Input.prototype.doLayout = function() {
  // this.placeholder.position.set(this.left, this.top);
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
  this.bg.filters = null;

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
  if(this.text.length == 0 || this.text == ' ') {
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
  var view = this.label,
      keyCode = event.keyCode ? event.keyCode : event.which;

  //rebuild version uses view.font.keys instead of frameKeys
  if(view.font.frameKeys[keyCode] >= 0 ||
      keyCode === engine.Keyboard.SPACEBAR) {
    this.text += key;
  }
};

Input.prototype._inputUp = function() {
  this.game.emit('ui/focus/capture', this);
};

Input.prototype._inputDown = function() {
  if(!this.true){
    this.game.emit('ui/focus/register', this); 
  };
  this.true = true;
};

Object.defineProperty(Input.prototype, 'text', {
  get: function() {
    return this.label.font.text;
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
      this.label.font.text = value.toString();
      this.label.position.set(this.left + offset.view, this.top);

    // update preferred size
    this.setPreferredSize(
      settings.width || view.width,
      settings.height || view.height);
  }
});

module.exports = Input;
