
var pixi = require('pixi'),
    fs = require('fs');

function OutlineFilter(width, height) {
  var matrix = [-1, -1, -1, -1, 8, -1, -1, -1, -1];
  pixi.AbstractFilter.call(this, null,
    fs.readFileSync(__dirname + '/OutlineFilter.frag', 'utf8'), {
      matrix: { type: '1fv', value: new Float32Array(matrix) },
      texelSize: { type: 'v2', value: { x: 1 / width, y: 1 / height } }
    }
  );
}

OutlineFilter.prototype = Object.create(pixi.AbstractFilter.prototype);
OutlineFilter.prototype.constructor = OutlineFilter;

Object.defineProperties(OutlineFilter.prototype, {
  matrix: {
    get: function() {
      return this.uniforms.matrix.value;
    },

    set: function(value) {
      this.uniforms.matrix.value = new Float32Array(value);
    }
  },

  width: {
    get: function() {
      return 1/this.uniforms.texelSize.value.x;
    },

    set: function(value) {
      this.uniforms.texelSize.value.x = 1/value;
    }
  },

  height: {
    get: function() {
      return 1/this.uniforms.texelSize.value.y;
    },

    set: function(value) {
      this.uniforms.texelSize.value.y = 1/value;
    }
  }
});

module.exports = OutlineFilter;
