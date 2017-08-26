
var pixi = require('pixi'),
    glslify = require('glslify');

function OutlineFilter(size, color) {
  pixi.Filter.call(this,
    glslify('./default.vert', 'utf8'),
    glslify('./outline.frag', 'utf8').replace(/%SIZE%/gi, size.toFixed(7))
  );

  this.padding = size;
  this.color = color;
};

OutlineFilter.prototype = Object.create(pixi.Filter.prototype);
OutlineFilter.prototype.constructor = OutlineFilter;

Object.defineProperties(OutlineFilter.prototype, {
  color: {
    get: function() {
      return pixi.utils.rgb2hex(this.uniforms.color);
    },
    set: function(value) {
      pixi.utils.hex2rgb(value, this.uniforms.color);
    }
  }
});

module.exports = OutlineFilter;
