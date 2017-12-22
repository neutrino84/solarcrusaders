
function Key(game, keycode) {
  this.game = game;

  this._enabled = true;
  this.event = null;

  this.isDown = false;
  this.isUp = true;

  this.altKey = false;
  this.ctrlKey = false;
  this.shiftKey = false;

  this.timeDown = 0;
  this.duration = 0;
  this.timeUp = -2500;

  this.repeats = 0;

  this.keyCode = keycode;

  // this.onUp = new Phaser.Signal();
  // this.onDown = new Phaser.Signal();

  this.onHoldCallback = null;
  this.onHoldContext = null;

  this._justDown = false;
  this._justUp = false;
};

Key.prototype = {
  update: function() {
    if(!this._enabled) { return; }

    if(this.isDown) {
      this.duration = this.game.clock.time - this.timeDown;
      this.repeats++;

      if(this.onHoldCallback) {
        this.onHoldCallback.call(this.onHoldContext, this);
      }
    }
  },

  processKeyDown: function(event) {
    if(!this._enabled) { return; }

    this.event = event;

    // exit if this key down is from auto-repeat
    if(this.isDown) {
      return;
    }

    this.altKey = event.altKey;
    this.ctrlKey = event.ctrlKey;
    this.shiftKey = event.shiftKey;

    this.isDown = true;
    this.isUp = false;
    this.timeDown = this.game.clock.time;
    this.duration = 0;
    this.repeats = 0;

    // _justDown will remain true until it is read via the justDown Getter
    // this enables the game to poll for past presses, or reset it at the start of a new game state
    this._justDown = true;

    // this.onDown.dispatch(this);
  },

  processKeyUp: function(event) {
    if(!this._enabled) { return; }

    this.event = event;

    if(this.isUp) {
      return;
    }

    this.isDown = false;
    this.isUp = true;
    this.timeUp = this.game.clock.time;
    this.duration = this.game.clock.time - this.timeDown;

    // _justUp will remain true until it is read via the justUp Getter
    // this enables the game to poll for past presses, or reset it at the start of a new game state
    this._justUp = true;

    // this.onUp.dispatch(this);
  },

  reset: function(hard) {
    if(hard === undefined) { hard = true; }

    this.isDown = false;
    this.isUp = true;
    this.timeUp = this.game.clock.time;
    this.duration = 0;
    this._enabled = true; // .enabled causes reset(false)
    this._justDown = false;
    this._justUp = false;

    if(hard) {
      // this.onDown.removeAll();
      // this.onUp.removeAll();
      this.onHoldCallback = null;
      this.onHoldContext = null;
    }
  },

  downDuration: function(duration) {
    if(duration === undefined) { duration = 50; }
    return (this.isDown && this.duration < duration);
  },

  upDuration: function(duration) {
    if(duration === undefined) { duration = 50; }
    return (!this.isDown && ((this.game.clock.time - this.timeUp) < duration));
  }
};


Object.defineProperty(Key.prototype, 'justDown', {
  get: function() {
    var current = this._justDown;
    this._justDown = false;
    return current;
  }
});


Object.defineProperty(Key.prototype, 'justUp', {
  get: function() {
    var current = this._justUp;
    this._justUp = false;
    return current;
  }
});

Object.defineProperty(Key.prototype, 'enabled', {
  get: function() {
    return this._enabled;
  },

  set: function(value) {
    value = !!value;

    if(value !== this._enabled) {
      if(!value) {
        this.reset(false);
      }
      this._enabled = value;
    }
  }
});

Key.prototype.constructor = Key;

module.exports = Key;
