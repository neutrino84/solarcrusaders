
var pixi = require('pixi');
var fs = require('fs');

function FogFilter(game) {
  this.game = game;

  pixi.AbstractFilter.call(this, null,
    fs.readFileSync(__dirname + '/FogFilter.frag', 'utf8'), {
      scale: { type: 'f', value: 1 }
    }
  );
}

FogFilter.prototype = Object.create(pixi.AbstractFilter.prototype);
FogFilter.prototype.constructor = FogFilter;

FogFilter.prototype.applyFilter =
  function(renderer, input, output){
    var shader = this.getShader(renderer),
        filterManager = renderer.filterManager;

    this.uniforms.scale.value = this.game.world.scale.x.toFixed(4);

    filterManager.applyFilter(shader, input, output);
  };

module.exports = FogFilter;
