
var pixi = require('pixi'),
    engine = require('engine');

// @see https://github.com/substack/brfs/issues/25
var fs = require('fs');

function BackgroundFilter(game, width, height) {
  this.game = game;

  this.uniforms = {
    channel0: { type: 'sampler2D', value: 0, textureData: { wrapS: 33071, wrapT: 33071 } },
    resolution: { type: 'v2', value: { x: width, y: height } },
    transform: { type: 'v2', value: { x: 0, y: 0 } },
    time: { type: 'f', value: 0 },
    scale: { type: 'f', value: 1 }
  };

  pixi.AbstractFilter.call(this,
    fs.readFileSync(__dirname + '/BackgroundFilter.vert', 'utf8'),
    fs.readFileSync(__dirname + '/BackgroundFilter.frag', 'utf8'),
      this.uniforms
  );
}

BackgroundFilter.prototype = Object.create(pixi.AbstractFilter.prototype);
BackgroundFilter.prototype.constructor = BackgroundFilter;

BackgroundFilter.prototype.setResolution = function(width, height) {
  this.uniforms.resolution.value.x = width;
  this.uniforms.resolution.value.y = height;
};

BackgroundFilter.prototype.setTexture = function(texture0) {
  this.uniforms.channel0.value = texture0;
};

BackgroundFilter.prototype.applyFilter = function(renderer, input, output){
  var shader = this.getShader(renderer),
      filterManager = renderer.filterManager,
      view = this.game.camera.view;

  this.uniforms.time.value = this.game.clock.totalElapsedSeconds();
  
  this.uniforms.transform.value.x = engine.Math.roundTo(-view.x, 4);
  this.uniforms.transform.value.y = engine.Math.roundTo(view.y, 4);

  this.uniforms.scale.value = engine.Math.roundTo(this.game.world.scale.x, 4);

  filterManager.applyFilter(shader, input, output);
};

module.exports = BackgroundFilter;
