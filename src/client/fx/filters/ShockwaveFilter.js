
var pixi = require('pixi'),
    engine = require('engine'),
    glslify = require('glslify');

function ShockwaveFilter(shockwave) {
  pixi.Filter.call(this,
    glslify('./shockwave.vert', 'utf8'),
    glslify('./shockwave.frag', 'utf8')
  );

  this.game = shockwave.game;
  this.shockwave = shockwave;
  this.matrix = new pixi.Matrix();

  this.padding = 0;
  this.time = 0;

  this.autoFit = false;
};

ShockwaveFilter.prototype = Object.create(pixi.Filter.prototype);
ShockwaveFilter.prototype.constructor = ShockwaveFilter;

ShockwaveFilter.prototype.apply = function(filterManager, input, output) {
  this.uniforms.dimensions[0] = input.sourceFrame.width
  this.uniforms.dimensions[1] = input.sourceFrame.height
  this.uniforms.time = this.shockwave.percent;

  // draw the filter...
  filterManager.applyFilter(this, input, output);
}

Object.defineProperties(ShockwaveFilter.prototype, {
  time: {
    get: function () {
      return this.uniforms.time;
    },
    set: function (value) {
      this.uniforms.time = value;
    }
  }
});

module.exports = ShockwaveFilter;
