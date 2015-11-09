var Rectangle = require('../geometry/Rectangle'),
    Point = require('../geometry/Point');

function Camera(game, x, y, width, height) {
  this.game = game;
  this.world = game.world;

  this.target = null;
  this.deadzone = null;
  
  this.view = new Rectangle(x, y, width, height);
  this.bounds = new Rectangle(x, y, width, height);

  this.smooth = false;
  this.roundPx = false;
  this.atLimit = { x: false, y: false };
  this.totalInView = 0;

  this._position = new Point();
  this._smoothPosition = new Point();
  this._targetPosition = new Point();
};

Camera.FOLLOW_LOCKON = 0;
Camera.FOLLOW_SMOOTH = 1;
Camera.FOLLOW_TOPDOWN = 2;
Camera.FOLLOW_TOPDOWN_TIGHT = 3;

Camera.prototype.constructor = Camera;

Camera.prototype.preUpdate = function() {
  this.totalInView = 0;
};

Camera.prototype.follow = function(target, style) {
  if(style === undefined) { style = Camera.FOLLOW_LOCKON; }

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
      display = this.displayObject;

  if(this.target) {
    this.updateTarget();
  }

  if(this.bounds) {
    this.checkBounds();
  }

  if(this.roundPx) {
    view.floor();
  }

  display.pivot.x = view.x + view.halfWidth;
  display.pivot.y = view.y + view.halfHeight;
};

Camera.prototype.updateTarget = function() {
  var x, y;

  this._targetPosition.copyFrom(this.target);

  // if(this.target.parent) {
  //   this._targetPosition.multiply(this.target.parent.worldTransform.a, this.target.parent.worldTransform.d);
  // }

  if(this.deadzone) {
    this._edge = this._targetPosition.x - this.view.x;

    if(this._edge < this.deadzone.left) {
      x = this._targetPosition.x - this.deadzone.left;
    } else if(this._edge > this.deadzone.right) {
      x = this._targetPosition.x - this.deadzone.right;
    }

    this._edge = this._targetPosition.y - this.view.y;

    if(this._edge < this.deadzone.top) {
      y = this._targetPosition.y - this.deadzone.top;
    } else if(this._edge > this.deadzone.bottom) {
      y = this._targetPosition.y - this.deadzone.bottom;
    }
  } else {
    x = this._targetPosition.x;
    y = this._targetPosition.y;
  }

  if(this.smooth) {
    this._smoothPosition = Point.interpolate(this.position, { x: x, y: y },  0.04, this._smoothPosition);
    x = this._smoothPosition.x;
    y = this._smoothPosition.y;
  }

  this.setPosition(x, y);
};

Camera.prototype.unfollow = function() {
  this.target = null;
};

Camera.prototype.focusOn =
  function(displayObject) {
    this.setPosition(displayObject.x, displayObject.y);
  };


Camera.prototype.focusOnXY =
  function(x, y) {
    this.setPosition(x, y);
  };

Camera.prototype.setBoundsToWorld =
  function() {
    if(this.bounds) {
      this.bounds.copyFrom(this.game.world.bounds);
    }
  };

Camera.prototype.checkBounds =
  function() {
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

Camera.prototype.setPosition =
  function(x, y) {
    var view = this.view;

    view.x = x-view.halfWidth;
    view.y = y-view.halfHeight;

    if(this.bounds) {
      this.checkBounds();
    }
  };

Camera.prototype.setSize =
  function(width, height) {
    var view = this.view,
        display = this.displayObject;
    view.width = width;
    view.height = height;
    display.x = view.halfWidth;
    display.y = view.halfHeight;
  };

Camera.prototype.reset =
  function() {
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
