var Rectangle = require('../geometry/Rectangle'),
    Point = require('../geometry/Point'),
    Easing = require('../tween/Easing');

function Camera(game, x, y, width, height) {
  this.game = game;
  this.world = game.world;

  this.target = null;
  this.deadzone = null;
  
  this.view = new Rectangle(x, y, width, height);
  this.bounds = new Rectangle(x, y, width, height);
  this.offset = new Point(0, 0);

  this.smooth = false;
  this.smoothStep = 0.1;
  this.smoothThreshhold = 128;

  this.roundPx = false;
  this.atLimit = { x: false, y: false };
  this.totalInView = 0;

  this._shaking = 0.0;
  this._smooth = false;
  this._position = new Point();
  this._targetPosition = new Point();
  this._smoothPosition = new Point();
};

Camera.FOLLOW_LOCKON = 0;
Camera.FOLLOW_SMOOTH = 1;
Camera.FOLLOW_TOPDOWN = 2;
Camera.FOLLOW_TOPDOWN_TIGHT = 3;

Camera.prototype.constructor = Camera;

Camera.prototype.shake = function(duration) {
  duration = duration || 500;

  this._shaking = 0.0;

  this.shakeTween && this.shakeTween.stop();
  this.shakeTween = this.game.tweens.create(this);
  this.shakeTween.to({ _shaking: 1.0 }, duration / 2);
  this.shakeTween.yoyo(true);
  this.shakeTween.start();
};

Camera.prototype.follow = function(target, style) {
  if(style === undefined) { style = Camera.FOLLOW_SMOOTH; }

  this.target = target;

  var helper;
  switch (style) {
    case Camera.FOLLOW_TOPDOWN:
      helper = global.Math.max(this.width, this.height) / 4;
      this.deadzone = new Rectangle((this.width - helper) / 2, (this.height - helper) / 2, helper, helper);
      break;
    case Camera.FOLLOW_TOPDOWN_TIGHT:
      helper = global.Math.max(this.width, this.height) / 8;
      this.deadzone = new Rectangle((this.width - helper) / 2, (this.height - helper) / 2, helper, helper);
      break;
    case Camera.FOLLOW_SMOOTH:
      this._smooth = false;
      this.smooth = true; 
      this.deadzone = null;
      break;
    case Camera.FOLLOW_LOCKON:
    default:
      this.deadzone = null;
      break;
  }
};

Camera.prototype.update = function() {
  var view = this.view,
      display = this.world,
      math = global.Math;

  this.target && this.updateTarget();
  this.bounds && this.checkBounds();
  this.roundPx && view.floor();

  if(this._shaking) {
    view.x += (math.random() * 20 - 10) * this._shaking;
    view.y += (math.random() * 20 - 10) * this._shaking;
  }

  display.pivot.x = view.x + view.halfWidth;
  display.pivot.y = view.y + view.halfHeight;
};

Camera.prototype.updateTarget = function() {
  var x, y, distance,
      offset = this.offset,
      smoothPosition = this._smoothPosition,
      targetPosition = this._targetPosition;
      targetPosition.copyFrom(this.target);

  if(this.deadzone) {
    this._edge = targetPosition.x - this.view.x;

    if(this._edge < this.deadzone.left) {
      x = targetPosition.x - this.deadzone.left;
    } else if(this._edge > this.deadzone.right) {
      x = targetPosition.x - this.deadzone.right;
    }

    this._edge = targetPosition.y - this.view.y;

    if(this._edge < this.deadzone.top) {
      y = targetPosition.y - this.deadzone.top;
    } else if(this._edge > this.deadzone.bottom) {
      y = targetPosition.y - this.deadzone.bottom;
    }
  } else {
    x = targetPosition.x + offset.x;
    y = targetPosition.y + offset.y;
  }

  if(this.smooth) {
    smoothPosition = Point.interpolate(this.position, { x: x, y: y }, 0.1, smoothPosition);
    x = smoothPosition.x;
    y = smoothPosition.y;
  }

  this.setPosition(x, y);
};

Camera.prototype.unfollow = function() {
  this.target = null;
};

Camera.prototype.focusOn = function(displayObject) {
  this.setPosition(displayObject.x, displayObject.y);
};

Camera.prototype.focusOnXY = function(x, y) {
  this.setPosition(x, y);
};

Camera.prototype.setBoundsToWorld = function() {
  if(this.bounds) {
    this.bounds.copyFrom(this.game.world.bounds);
  }
};

Camera.prototype.checkBounds = function() {
  this.atLimit.x = false;
  this.atLimit.y = false;

  if(this.view.x <= this.bounds.x) {
    this.atLimit.x = true;
    // this.view.x = this.bounds.x;
  }

  if(this.view.right >= this.bounds.right) {
    this.atLimit.x = true;
    // this.view.x = this.bounds.right - this.width;
  }

  if(this.view.y <= this.bounds.top) {
    this.atLimit.y = true;
    // this.view.y = this.bounds.top;
  }

  if(this.view.bottom >= this.bounds.bottom) {
    this.atLimit.y = true;
    // this.view.y = this.bounds.bottom - this.height;
  }
};

Camera.prototype.setPosition = function(x, y) {
  var view = this.view;
      view.x = x-view.halfWidth;
      view.y = y-view.halfHeight;
};

Camera.prototype.pan = function(x, y) {
  var view = this.view;
      view.x -= x;
      view.y -= y;
};

Camera.prototype.setSize = function(width, height) {
  var view = this.view,
      display = this.world;
  view.width = width;
  view.height = height;
  display.x = view.halfWidth;
  display.y = view.halfHeight;
};

Camera.prototype.reset = function() {
  this.view.x = 0;
  this.view.y = 0;
};

Object.defineProperty(Camera.prototype, 'x', {
  get: function() {
    return this.view.x;
  },

  set: function(value) {
    this.view.x = value;

    if(this.bounds)
      this.checkBounds();
  }
});

Object.defineProperty(Camera.prototype, 'y', {
  get: function() {
    return this.view.y;
  },

  set: function(value) {
    this.view.y = value;

    if(this.bounds) {
      this.checkBounds();
    }
  }
});

Object.defineProperty(Camera.prototype, 'shaking', {
  get: function() {
    return this._shaking;
  }
});

Object.defineProperty(Camera.prototype, 'position', {
  get: function() {
    this._position.set(this.view.centerX, this.view.centerY);
    return this._position;
  },

  set: function(value) {
    if(typeof value.x !== 'undefined') { this.view.x = value.x; }
    if(typeof value.y !== 'undefined') { this.view.y = value.y; }

    if(this.bounds) {
      this.checkBounds();
    }
  }
});

Object.defineProperty(Camera.prototype, 'width', {
  get: function() {
    return this.view.width;
  },

  set: function(value) {
    this.view.width = value;
  }
});


Object.defineProperty(Camera.prototype, 'height', {
  get: function() {
    return this.view.height;
  },

  set: function(value) {
    this.view.height = value;
  }
});

module.exports = Camera;
