
var pixi = require('pixi'),
    engine = require('engine');

// @see https://github.com/substack/brfs/issues/25
var fs = require('fs');

function SnowFilter(game, width, height) {
  this.game = game;

  this.uniforms = {
    resolution: { type: 'v2', value: { x: width, y: height } },
    transform: { type: 'v2', value: { x: 0, y: 0 } },
    time: { type: 'f', value: 0 },
    scale: { type: 'f', value: 1 }
  };

  pixi.AbstractFilter.call(this,
    fs.readFileSync(__dirname + '/SnowFilter.vert', 'utf8'),
    fs.readFileSync(__dirname + '/SnowFilter.frag', 'utf8'),
      this.uniforms
  );
};

SnowFilter.prototype = Object.create(pixi.AbstractFilter.prototype);
SnowFilter.prototype.constructor = SnowFilter;

SnowFilter.prototype.setResolution = function(width, height) {
  this.uniforms.resolution.value.x = width;
  this.uniforms.resolution.value.y = height;
};

SnowFilter.prototype.applyFilter = function(renderer, input, output){
  var shader = this.getShader(renderer),
      filterManager = renderer.filterManager,
      camera = this.game.camera,
      view = camera.view,
      uniforms = this.uniforms;

  uniforms.time.value = this.game.clock.totalElapsedSeconds();
  
  uniforms.transform.value.x = engine.Math.roundTo(-view.x, 4);
  uniforms.transform.value.y = engine.Math.roundTo(view.y, 4);

  uniforms.scale.value = engine.Math.roundTo(this.game.world.scale.x, 4);

  filterManager.applyFilter(shader, input, output);
};

module.exports = SnowFilter;
