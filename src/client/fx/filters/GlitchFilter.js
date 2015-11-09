
var pixi = require('pixi');
var fs = require('fs');

function GlitchFilter(game, width, height) {
  this.game = game;

  pixi.AbstractFilter.call(this, null,
    fs.readFileSync(__dirname + '/GlitchFilter.frag', 'utf8'), {
      resolution: { type: 'v2', value: { x: width, y: height }},
      time: { type: 'f', value: 0 }
    }
  );
}

GlitchFilter.prototype = Object.create(pixi.AbstractFilter.prototype);
GlitchFilter.prototype.constructor = GlitchFilter;

GlitchFilter.prototype.setResolution =
  function(width, height) {
    this.uniforms.resolution.value.x = width;
    this.uniforms.resolution.value.y = height;
  },

GlitchFilter.prototype.applyFilter =
  function(renderer, input, output){
    var game = this.game,
        shader = this.getShader(renderer),
        filterManager = renderer.filterManager;

    this.uniforms.time.value = game.clock.totalElapsedSeconds();

    filterManager.applyFilter(shader, input, output);
  };

module.exports = GlitchFilter;
