
var pixi = require('pixi');
var fs = require('fs');

function NebulaFilter(game, width, height) {
  this.game = game;

  pixi.AbstractFilter.call(this, null,
    fs.readFileSync(__dirname + '/NebulaFilter.frag', 'utf8'), {
      scale: { type: 'f', value: 1 },
      resolution: { type: 'v2', value: { x: width, y: height }},
      transform: { type: 'v2', value: { x: 0, y: 0 } },
      time: { type: 'f', value: 0 }
    }
  );
}

NebulaFilter.prototype = Object.create(pixi.AbstractFilter.prototype);
NebulaFilter.prototype.constructor = NebulaFilter;

NebulaFilter.prototype.setResolution =
  function(width, height) {
    this.uniforms.resolution.value.x = width;
    this.uniforms.resolution.value.y = height;
  },

NebulaFilter.prototype.applyFilter =
  function(renderer, input, output){
    var game = this.game,
        shader = this.getShader(renderer),
        filterManager = renderer.filterManager,
        view = this.game.camera.view;

    this.uniforms.time.value = game.clock.totalElapsedSeconds();
    this.uniforms.scale.value = game.world.scale.x.toFixed(4);

    this.uniforms.transform.value.x = view.x.toFixed(4);
    this.uniforms.transform.value.y = -view.y.toFixed(4);

    filterManager.applyFilter(shader, input, output);
  };

module.exports = NebulaFilter;
