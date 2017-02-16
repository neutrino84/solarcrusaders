
var pixi = require('pixi'),
    glslify = require('glslify');

function OutlineFilter(width, height) {
  pixi.Filter.call(this,
    glslify('./outline.vert', 'utf8'),
    glslify('./outline.frag', 'utf8')
  );

  this.matrix = [-1, -1, -1, -1, 8,-1, -1, -1, -1];
  this.width = width;
  this.height = height;
  this.padding = 4;
};

OutlineFilter.prototype = Object.create(pixi.Filter.prototype);
OutlineFilter.prototype.constructor = OutlineFilter;

Object.defineProperties(OutlineFilter.prototype, {
  matrix: {
    get: function() {
      return this.uniforms.matrix;
    },

    set: function(value) {
      this.uniforms.matrix = new Float32Array(value);
    }
  },

  width: {
    get: function() {
      return 1/this.uniforms.texelSize.x;
    },

    set: function(value) {
      this.uniforms.texelSize.x = 1/value;
    }
  },

  height: {
    get: function() {
      return 1/this.uniforms.texelSize.y;
    },

    set: function(value) {
      this.uniforms.texelSize.y = 1/value;
    }
  }
});

module.exports = OutlineFilter;
