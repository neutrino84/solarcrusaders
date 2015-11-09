
function DeviceButton(parent, buttonCode) {
  this.parent = parent;
  this.game = parent.game;

  this.event = null;

  this.isDown = false;
  this.isUp = true;

  this.timeDown = 0;
  this.timeUp = 0;

  this.altKey = false;
  this.shiftKey = false;
  this.ctrlKey = false;

  this.value = 0;

  // this.onDown = new Phaser.Signal();
  // this.onUp = new Phaser.Signal();
  // this.onFloat = new Phaser.Signal();
};

DeviceButton.prototype = {
  start: function(event, value) {
    if(this.isDown) { return; }

    this.isDown = true;
    this.isUp = false;
    this.timeDown = this.game.clock.time;

    this.event = event;
    this.value = value;

    if(event) {
      this.altKey = event.altKey;
      this.shiftKey = event.shiftKey;
      this.ctrlKey = event.ctrlKey;
    }
    
    // this.onDown.dispatch(this, value);
  },

  stop: function(event, value) {
    if(this.isUp) { return; }

    this.isDown = false;
    this.isUp = true;
    this.timeUp = this.game.clock.time;

    this.event = event;
    this.value = value;

    if(event) {
      this.altKey = event.altKey;
      this.shiftKey = event.shiftKey;
      this.ctrlKey = event.ctrlKey;
    }

    // this.onUp.dispatch(this, value);
  },

  reset: function() {
    this.timeDown = this.game.clock.time;

    this.isDown = false;
    this.isUp = true;

    this.altKey = false;
    this.shiftKey = false;
    this.ctrlKey = false;
  },

  destroy: function() {
    // this.onDown.dispose();
    // this.onUp.dispose();
    // this.onFloat.dispose();

    this.parent = null;
    this.game = null;
  }
};

DeviceButton.prototype.constructor = DeviceButton;

Object.defineProperty(DeviceButton.prototype, 'duration', {
    get: function() {
      if(this.isUp) {
        return -1;
      }
      return this.game.clock.time - this.timeDown;
    }
});

module.exports = DeviceButton;
