
var fs = require('fs');
var pixi = require('pixi');
var engine = require('engine');

function FogFilter(game) {
  this.game = game;

  this.uniforms = {
    scale: { type: 'f', value: 1 }
  }

  pixi.AbstractFilter.call(this, null,
    fs.readFileSync(__dirname + '/FogFilter.frag', 'utf8'), {
      scale: { type: 'f', value: 1 }
    }
  );
}

FogFilter.prototype = Object.create(pixi.AbstractFilter.prototype);
FogFilter.prototype.constructor = FogFilter;

FogFilter.prototype.applyFilter = function(renderer, input, output){
  var shader = this.getShader(renderer),
      filterManager = renderer.filterManager;

  this.uniforms.scale.value = engine.Math.roundTo(this.game.world.scale.x, 4);

  filterManager.applyFilter(shader, input, output);
};

module.exports = FogFilter;
