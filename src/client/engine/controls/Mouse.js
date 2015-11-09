var Device = require('../system/Device'),
    Math = require('../utils/Math');

function Mouse(game) {
  this.game = game;
  this.input = game.input;

  this.callbackContext = this.game;

  this.mouseDownCallback = null;
  this.mouseUpCallback = null;
  this.mouseOutCallback = null;
  this.mouseOverCallback = null;
  this.mouseWheelCallback = null;

  this.capture = false;
  this.button = -1;
  this.wheelDelta = 0;
  this.enabled = true;
  this.locked = false;

  this.stopOnGameOut = false;

  this.event = null;

  this._onMouseDown = null;
  this._onMouseMove = null;
  this._onMouseUp = null;
  this._onMouseOut = null;
  this._onMouseOver = null;
  this._onMouseWheel = null;
  this._wheelEvent = null;
};

Mouse.NO_BUTTON = -1;
Mouse.LEFT_BUTTON = 0;
Mouse.MIDDLE_BUTTON = 1;
Mouse.RIGHT_BUTTON = 2;
Mouse.BACK_BUTTON = 3;
Mouse.FORWARD_BUTTON = 4;
Mouse.WHEEL_UP = 1;
Mouse.WHEEL_DOWN = -1;

Mouse.prototype = {

  start: function() {
    if(Device.android && Device.chrome === false) { return; }
    if(this._onMouseDown !== null) { return; }

    var self = this;

    this._onMouseDown = function(event) {
      return self.onMouseDown(event);
    };

    this._onMouseMove = function(event) {
      return self.onMouseMove(event);
    };

    this._onMouseUp = function(event) {
      return self.onMouseUp(event);
    };

    this._onMouseUpGlobal = function(event) {
      return self.onMouseUpGlobal(event);
    };

    this._onMouseOut = function(event) {
      return self.onMouseOut(event);
    };

    this._onMouseOver = function(event) {
      return self.onMouseOver(event);
    };

    this._onMouseWheel = function(event) {
      return self.onMouseWheel(event);
    };

    var canvas = this.game.canvas;

    canvas.addEventListener('mousedown', this._onMouseDown, true);
    canvas.addEventListener('mousemove', this._onMouseMove, true);
    canvas.addEventListener('mouseup', this._onMouseUp, true);

    global.addEventListener('mouseup', this._onMouseUpGlobal, true);
    canvas.addEventListener('mouseover', this._onMouseOver, true);
    canvas.addEventListener('mouseout', this._onMouseOut, true);

    var wheelEvent = Device.wheelEvent;
    if(wheelEvent) {
      canvas.addEventListener(wheelEvent, this._onMouseWheel, true);

      if(wheelEvent === 'mousewheel') {
        this._wheelEvent = new WheelEventProxy(-1/40, 1);
      } else if(wheelEvent === 'DOMMouseScroll') {
        this._wheelEvent = new WheelEventProxy(1, 1);
      }
    }
  },

  onMouseDown: function(event) {
    this.event = event;

    if(this.capture) {
      event.preventDefault();
    }

    if(this.mouseDownCallback) {
      this.mouseDownCallback.call(this.callbackContext, event);
    }

    if(!this.input.enabled || !this.enabled) { return; }

    event.identifier = 0;
    this.input.mousePointer.start(event);
  },

  onMouseMove: function(event) {
    this.event = event;

    if(this.capture) {
      event.preventDefault();
    }

    if(this.mouseMoveCallback) {
      this.mouseMoveCallback.call(this.callbackContext, event);
    }

    if(!this.input.enabled || !this.enabled) { return; }

    event.identifier = 0;
    this.input.mousePointer.move(event);
  },

  onMouseUp: function(event) {
    this.event = event;

    if(this.capture) {
      event.preventDefault();
    }

    if(this.mouseUpCallback) {
      this.mouseUpCallback.call(this.callbackContext, event);
    }

    if(!this.input.enabled || !this.enabled) { return; }

    event.identifier = 0;
    this.input.mousePointer.stop(event);
  },

  onMouseUpGlobal: function(event) {
    if(!this.input.mousePointer.withinGame) {
      if(this.mouseUpCallback) {
        this.mouseUpCallback.call(this.callbackContext, event);
      }

      event.identifier = 0;
      this.input.mousePointer.stop(event);
    }
  },

  onMouseOut: function(event) {
    this.event = event;

    if(this.capture) {
      event.preventDefault();
    }

    this.input.mousePointer.withinGame = false;

    if(this.mouseOutCallback) {
      this.mouseOutCallback.call(this.callbackContext, event);
    }

    if(!this.input.enabled || !this.enabled) { return; }

    if(this.stopOnGameOut) {
      event.identifier = 0;
      this.input.mousePointer.stop(event);
    }
  },

  onMouseOver: function (event) {
    this.event = event;

    if(this.capture) {
      event.preventDefault();
    }

    this.input.mousePointer.withinGame = true;

    if(this.mouseOverCallback) {
      this.mouseOverCallback.call(this.callbackContext, event);
    }
  },

  onMouseWheel: function (event) {
    if(this._wheelEvent) {
      event = this._wheelEvent.bindEvent(event);
    }

    this.event = event;

    if(this.capture) {
      event.preventDefault();
    }

    // reverse detail for firefox
    this.wheelDelta = Math.clamp(-event.deltaY, -1, 1);

    if(this.mouseWheelCallback) {
      this.mouseWheelCallback.call(this.callbackContext, event);
    }
  },

  stop: function() {
    var canvas = this.game.canvas;
        canvas.removeEventListener('mousedown', this._onMouseDown, true);
        canvas.removeEventListener('mousemove', this._onMouseMove, true);
        canvas.removeEventListener('mouseup', this._onMouseUp, true);
        canvas.removeEventListener('mouseover', this._onMouseOver, true);
        canvas.removeEventListener('mouseout', this._onMouseOut, true);

    var wheelEvent = Device.wheelEvent;
    if(wheelEvent) {
      canvas.removeEventListener(wheelEvent, this._onMouseWheel, true);
    }

    global.removeEventListener('mouseup', this._onMouseUpGlobal, true);
  }
};

Mouse.prototype.constructor = Mouse;

function WheelEventProxy(scaleFactor, deltaMode) {
  this._scaleFactor = scaleFactor;
  this._deltaMode = deltaMode;
  this.originalEvent = null;
}

WheelEventProxy.prototype = {};
WheelEventProxy.prototype.constructor = WheelEventProxy;
WheelEventProxy.prototype.bindEvent = function(event) {
  // Generate stubs automatically
  if(!WheelEventProxy._stubsGenerated && event) {
      var makeBinder = function(name) {
        return function() {
          var v = this.originalEvent[name];
          return typeof v !== 'function' ? v : v.bind(this.originalEvent);
        };
      };

      for(var prop in event) {
        if(!(prop in WheelEventProxy.prototype)) {
          Object.defineProperty(WheelEventProxy.prototype, prop, {
            get: makeBinder(prop)
          });
        }
      }
      
      WheelEventProxy._stubsGenerated = true;
  }

  this.originalEvent = event;
  return this;
};

Object.defineProperties(WheelEventProxy.prototype, {
  'type': { value: 'wheel' },
  'deltaMode': { get: function() { return this._deltaMode; } },
  'deltaY': {
    get: function() {
      return (this._scaleFactor * (this.originalEvent.wheelDelta || this.originalEvent.detail)) || 0;
    }
  },
  'deltaX': {
    get: function() {
      return (this._scaleFactor * this.originalEvent.wheelDeltaX) || 0;
    }
  },
  'deltaZ': { value: 0 }
});

module.exports = Mouse;
