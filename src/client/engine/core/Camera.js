
var Rectangle = require('../geometry/Rectangle'),
    Point = require('../geometry/Point');

function Camera(game, x, y, width, height) {
  this.game = game;
  this.world = game.world;

  this.step = 0.1;
  this.target = null;
  this.shaking = 0.0;
  this.smooth = false;

  this.offset = new Point();
  this.smoothing = new Point();
  this.position = new Point();
  this.view = new Rectangle(x, y, width, height);

  this.style = Camera.FOLLOW_LOCKON;
};

Camera.FOLLOW_LOCKON = 0;
Camera.FOLLOW_SMOOTH = 1;

Camera.prototype.constructor = Camera;

Camera.prototype.shake = function(duration) {
  this.shaking = 0.0;
  this.tween && this.tween.stop();
  this.tween = this.game.tweens.create(this);
  this.tween.to({ shaking: 1.0 }, (duration || 250) / 2);
  this.tween.yoyo(true);
  this.tween.start();
};

Camera.prototype.pan = function(x, y) {
  this.offset.set(x, y);
};

Camera.prototype.focus = function(x, y) {
  this.offset.set(0, 0);
  this.set(x, y);
};

Camera.prototype.follow = function(target, style) {
  // set target
  this.target = target;
  this.style = style || this.style;
  this.offset.set(0, 0);

  // set style
  switch(this.style) {
    case Camera.FOLLOW_SMOOTH:
      this.smooth = true; 
      break;
    case Camera.FOLLOW_LOCKON:
      this.smooth = false
      break;
    default:
      break;
  }
};

Camera.prototype.unfollow = function() {
  this.target = null;
};

Camera.prototype.update = function() {
  var x = this.position.x,
      y = this.position.y,
      rnd = this.game.rnd,
      view = this.view,
      world = this.world,
      smoothing = this.smoothing;

  if(this.target) {
    if(this.smooth) {
      position = Point.interpolate(this.position, this.target, this.step, smoothing);
      x = smoothing.x;
      y = smoothing.y;
    } else {
      x = this.target.x;
      y = this.target.y;
    }
  }

  if(this.shaking > 0.0) {
    x += (rnd.realInRange(-20, 20) * this.shaking);
    y += (rnd.realInRange(-20, 20) * this.shaking);
  }

  this.set(x, y);
};

Camera.prototype.set = function(x, y) {
  var world = this.world,
      view = this.view,
      offset = this.offset,
      position = this.position;

  x = x + this.offset.x;
  y = y + this.offset.y;
  
  position.set(x, y);

  world.pivot.x = view.x = x;
  world.pivot.y = view.y = y;

  world.background.pivot.x = world.pivot.x / 6;
  world.background.pivot.y = world.pivot.y / 6;
  world.background.scale.x = world.scale.x / 3 + 0.5;
  world.background.scale.y = world.scale.y / 3 + 0.5;
  
  world.foreground.pivot.x = world.pivot.x / 4;
  world.foreground.pivot.y = world.pivot.y / 4;
  world.foreground.scale.x = world.scale.x / 2 + 0.5;
  world.foreground.scale.y = world.scale.y / 2 + 0.5;
};

Camera.prototype.resize = function(width, height) {
  var world = this.world,
      view = this.view;
      
  view.width = width;
  view.height = height;
  
  world.x = view.halfWidth;
  world.y = view.halfHeight;

  world.background.x = view.halfWidth;
  world.background.y = view.halfHeight;

  world.foreground.x = view.halfWidth;
  world.foreground.y = view.halfHeight;
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
  }
});

Object.defineProperty(Camera.prototype, 'y', {
  get: function() {
    return this.view.y;
  },

  set: function(value) {
    this.view.y = value;
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
