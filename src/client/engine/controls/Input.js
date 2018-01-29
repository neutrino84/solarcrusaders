var pixi = require('pixi'),
    Pointer = require('./Pointer'),
    EventEmitter = require('eventemitter3'),
    Mouse = require('./Mouse'),
    Keyboard = require('./Keyboard'),
    Point = require('../geometry/Point'),
    ArraySet = require('../utils/ArraySet');

function Input(game) {
  this.game = game;

  this.hitCanvas = null;
  this.hitContext = null;

  this.moveCallbacks = [];

  this.pollRate = 1;
  this.enabled = true;

  this.multiInputOverride = Input.MOUSE_TOUCH_COMBINE;

  this.position = null;
  this.speed = null;
  this.scale = null;

  this.maxPointers = -1;

  this.tapRate = 200;
  this.doubleTapRate = 300;
  this.holdRate = 2000;

  this.justPressedRate = 200;
  this.justReleasedRate = 200;

  this.recordPointerHistory = false;
  this.recordRate = 100;
  this.recordLimit = 100;

  this.activePointer = null;
  this.mousePointer = null;
  this.mouse = null;
  this.keyboard = null;

  this.minPriorityID = 0;
  this.resetLocked = false;
  
  this.interactiveItems = new ArraySet();

  this._pollCounter = 0;
  this._oldPosition = null;
  this._localPoint = new Point();
  
  this._x = 0;
  this._y = 0;

  EventEmitter.call(this);
};

Input.MOUSE_OVERRIDES_TOUCH = 0;
Input.TOUCH_OVERRIDES_MOUSE = 1;
Input.MOUSE_TOUCH_COMBINE = 2;

Input.prototype = Object.create(EventEmitter.prototype);
Input.prototype.constructor = Input;

Input.prototype.boot = function() {
  this.mousePointer = new Pointer(this.game, 0, Pointer.MODE.CURSOR);
  this.mouse = new Mouse(this.game);

  this.keyboard = new Keyboard(this.game);
  this.keyboard.addCallbacks(this,
    function(event, key) { this.emit('keydown', event, key); }, 
    function(event, key) { this.emit('keyup', event, key); },
    function(event, key) { this.emit('keypress', event, key); }
  );

  this.scale = new Point(1, 1);
  this.speed = new Point();
  this.position = new Point();
  this._oldPosition = new Point();

  this.activePointer = this.mousePointer;

  this.hitCanvas = document.createElement('canvas');
  this.hitCanvas.width = 1;
  this.hitCanvas.height = 1;
  this.hitContext = this.hitCanvas.getContext('2d');

  this.mouse.start();
  this.mousePointer.active = true;

  this.keyboard.start();

  var self = this;
  this._onClickTrampoline = function(event) {
    self.onClickTrampoline(event);
  };

  this.game.canvas.addEventListener('click', this._onClickTrampoline, false);
};

Input.prototype.destroy = function() {
  this.mouse.stop();
  this.keyboard.stop();
  
  this.moveCallbacks = [];

  this.game.canvas.removeEventListener('click', this._onClickTrampoline);
};

Input.prototype.addMoveCallback = function(callback, context) {
  this.moveCallbacks.push({ callback: callback, context: context });
};

Input.prototype.deleteMoveCallback = function(callback, context) {
  var i = this.moveCallbacks.length;
  while (i--) {
    if(this.moveCallbacks[i].callback === callback && this.moveCallbacks[i].context === context) {
      this.moveCallbacks.splice(i, 1);
      return;
    }
  }
};

Input.prototype.update = function() {
  this.keyboard.update();

  if(this.pollRate > 0 && this._pollCounter < this.pollRate) {
    this._pollCounter++;
    return;
  }

  this.speed.x = this.position.x - this._oldPosition.x;
  this.speed.y = this.position.y - this._oldPosition.y;

  this._oldPosition.copyFrom(this.position);
  this.mousePointer.update();

  this._pollCounter = 0;
};

Input.prototype.reset = function(hard) {
  if(!this.game.isBooted || this.resetLocked) { return; }
  if(hard === undefined) { hard = false; }

  this.mousePointer.reset();
  this.keyboard.reset(hard);

  if(this.game.canvas.style.cursor !== 'none') {
    this.game.canvas.style.cursor = 'inherit';
  }

  if(hard) {
    this.removeAllListeners();
    this.moveCallbacks = [];
  }

  this._pollCounter = 0;
};

Input.prototype.resetSpeed = function(x, y) {
  this._oldPosition.setTo(x, y);
  this.speed.setTo(0, 0);
};

Input.prototype.getLocalPosition = function(displayObject, pointer, output) {
  if(output === undefined) { output = new Point(); }

  var wt = displayObject.worldTransform;
  var id = 1 / (wt.a * wt.d + wt.c * -wt.b);
  return output.setTo(
    wt.d * id * pointer.x + -wt.c * id * pointer.y + (wt.ty * wt.c - wt.tx * wt.d) * id,
    wt.a * id * pointer.y + -wt.b * id * pointer.x + (-wt.ty * wt.a + wt.tx * wt.b) * id
  );
};

Input.prototype.hitTest = function(displayObject, pointer, localPoint) {
  if(!displayObject.worldVisible) { return false; }

  this.getLocalPosition(displayObject, pointer, this._localPoint);
  localPoint.copyFrom(this._localPoint);

  if(displayObject.hitArea && displayObject.hitArea.contains) {
    return (displayObject.hitArea.contains(this._localPoint.x, this._localPoint.y));
  }
  // else if(displayObject instanceof Phaser.TileSprite) {
  //   var width = displayObject.width;
  //   var height = displayObject.height;
  //   var x1 = -width * displayObject.anchor.x;

  //   if(this._localPoint.x >= x1 && this._localPoint.x < x1 + width) {
  //     var y1 = -height * displayObject.anchor.y;
  //     if(this._localPoint.y >= y1 && this._localPoint.y < y1 + height) {
  //       return true;
  //     }
  //   }
  // } 
  else if(displayObject instanceof pixi.Sprite) {
    var width = displayObject.texture.frame.width;
    var height = displayObject.texture.frame.height;
    var x1 = -width * displayObject.anchor.x;

    if(this._localPoint.x >= x1 && this._localPoint.x < x1 + width) {
      var y1 = -height * displayObject.anchor.y;

      if(this._localPoint.y >= y1 && this._localPoint.y < y1 + height) {
        return true;
      }
    }
  } else if(displayObject instanceof pixi.Graphics) {
    for(var i = 0; i < displayObject.graphicsData.length; i++) {
      var data = displayObject.graphicsData[i];
      if(!data.fill) {
        continue;
      }

      // Only deal with fills..
      if(data.shape && data.shape.contains(this._localPoint.x, this._localPoint.y)) {
        return true;
      }
    }
  }

  //  Didn't hit the parent, does it have any children?
  for(var i = 0, len = displayObject.children.length; i < len; i++) {
    if(this.hitTest(displayObject.children[i], pointer, localPoint)) {
      return true;
    }
  }

  return false;
};

Input.prototype.onClickTrampoline = function() {
  // It might not always be the active pointer, but this does work on
  // Desktop browsers (read: IE) with Mouse or MSPointer input.
  this.activePointer.processClickTrampolines();
}

Object.defineProperty(Input.prototype, 'x', {
  get: function() {
    return this._x;
  },

  set: function(value) {
    this._x = Math.floor(value);
  }
});

Object.defineProperty(Input.prototype, 'y', {
  get: function() {
    return this._y;
  },

  set: function(value) {
    this._y = Math.floor(value);
  }
});

Object.defineProperty(Input.prototype, 'pollLocked', {
  get: function() {
    return (this.pollRate > 0 && this._pollCounter < this.pollRate);
  }
});


Object.defineProperty(Input.prototype, 'worldX', {
  get: function() {
    return this.game.camera.view.x + this.x;
  }
});

Object.defineProperty(Input.prototype, 'worldY', {
  get: function() {
    return this.game.camera.view.y + this.y;
  }
});

module.exports = Input;
