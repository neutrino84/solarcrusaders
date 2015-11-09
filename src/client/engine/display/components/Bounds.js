
function Bounds() {};

Bounds.prototype = {

  offsetX: {
    get: function () {
      return this.anchor.x * this.width;
    }
  },

  offsetY: {
    get: function () {
      return this.anchor.y * this.height;
    }
  },

  left: {
    get: function () {
      return this.x - this.offsetX;
    }
  },

  right: {
    get: function () {
      return (this.x + this.width) - this.offsetX;
    }
  },

  top: {
    get: function () {
      return this.y - this.offsetY;
    }
  },

  bottom: {
    get: function () {
      return (this.y + this.height) - this.offsetY;
    }
  }
  
};

module.exports = Bounds;