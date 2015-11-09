
function Tile(layer, index, x, y, width, height) {
  this.layer = layer;

  this.index = index;
  
  this.x = x;
  this.y = y;
  
  this.rotation = 0;
  this.flipped = false;
  
  this.worldX = x * width;
  this.worldY = y * height;

  this.width = width;
  this.height = height;

  this.centerX = global.Math.abs(width / 2);
  this.centerY = global.Math.abs(height / 2);

  this.alpha = 1;
  this.properties = {};

  this.scanned = false;
  
  this.faceTop = false;
  this.faceBottom = false;
  this.faceLeft = false;
  this.faceRight = false;

  this.collideLeft = false;
  this.collideRight = false;
  this.collideUp = false;
  this.collideDown = false;

  this.collisionCallback = null;
  this.collisionCallbackContext = this;
};

Tile.prototype = {

  containsPoint: function(x, y) {
    return !(x < this.worldX || y < this.worldY || x > this.right || y > this.bottom);
  },

  intersects: function(x, y, right, bottom) {
    if(right <= this.worldX) {
      return false;
    }

    if(bottom <= this.worldY) {
      return false;
    }

    if(x >= this.worldX + this.width) {
      return false;
    }

    if(y >= this.worldY + this.height) {
      return false;
    }

    return true;
  },

  setCollisionCallback: function(callback, context) {
    this.collisionCallback = callback;
    this.collisionCallbackContext = context;
  },

  destroy: function() {
    this.collisionCallback = null;
    this.collisionCallbackContext = null;
    this.properties = null;
  },

  setCollision: function(left, right, up, down) {
    this.collideLeft = left;
    this.collideRight = right;
    this.collideUp = up;
    this.collideDown = down;

    this.faceLeft = left;
    this.faceRight = right;
    this.faceTop = up;
    this.faceBottom = down;
  },

  resetCollision: function() {
    this.collideLeft = false;
    this.collideRight = false;
    this.collideUp = false;
    this.collideDown = false;

    this.faceTop = false;
    this.faceBottom = false;
    this.faceLeft = false;
    this.faceRight = false;
  },

  isInteresting: function(collides, faces) {
    if(collides && faces) {
      //  Does this tile have any collide flags OR interesting face?
      return (this.collideLeft || this.collideRight || this.collideUp || this.collideDown || this.faceTop || this.faceBottom || this.faceLeft || this.faceRight || this.collisionCallback);
    } else if(collides) {
      //  Does this tile collide?
      return (this.collideLeft || this.collideRight || this.collideUp || this.collideDown);
    } else if(faces) {
      //  Does this tile have an interesting face?
      return (this.faceTop || this.faceBottom || this.faceLeft || this.faceRight);
    }

    return false;
  },

  copy: function(tile) {
    this.index = tile.index;
    this.alpha = tile.alpha;
    this.properties = tile.properties;

    this.collideUp = tile.collideUp;
    this.collideDown = tile.collideDown;
    this.collideLeft = tile.collideLeft;
    this.collideRight = tile.collideRight;

    this.collisionCallback = tile.collisionCallback;
    this.collisionCallbackContext = tile.collisionCallbackContext;
  }

};

Tile.prototype.constructor = Tile;

Object.defineProperty(Tile.prototype, "collides", {
  get: function() {
    return (this.collideLeft || this.collideRight || this.collideUp || this.collideDown);
  }
});

Object.defineProperty(Tile.prototype, "canCollide", {
  get: function() {
    return (this.collideLeft || this.collideRight || this.collideUp || this.collideDown || this.collisionCallback);
  }
});

Object.defineProperty(Tile.prototype, "left", {
  get: function() {
    return this.worldX;
  }
});

Object.defineProperty(Tile.prototype, "right", {
  get: function() {
    return this.worldX + this.width;
  }
});

Object.defineProperty(Tile.prototype, "top", {
  get: function() {
    return this.worldY;
  }
});

Object.defineProperty(Tile.prototype, "bottom", {
  get: function() {
    return this.worldY + this.height;
  }
});

module.exports = Tile;
