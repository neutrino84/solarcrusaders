
var pixi = require('pixi'),
    glslify = require('glslify');

function ShieldFilter(game, sprite) {
  pixi.Filter.call(this,
    glslify('./shield.vert', 'utf8'),
    glslify('./shield.frag', 'utf8')
  );

  this.game = game;
  this.sprite = sprite;
  this.matrix = new pixi.Matrix();
  this.padding = 4;

  this.uniforms.scale = 24.0;
  this.uniforms.mapSampler = sprite.texture;
  this.uniforms.filterMatrix = this.matrix.toArray(true);
  this.uniforms.time = 0.0;
};

ShieldFilter.prototype = Object.create(pixi.Filter.prototype);
ShieldFilter.prototype.constructor = ShieldFilter;

ShieldFilter.prototype.apply = function(filterManager, input, output, clear) {
  this.uniforms.filterMatrix = filterManager.calculateSpriteMatrix(this.matrix, this.sprite);
  this.uniforms.time = this.game.clock.totalElapsedSeconds();
  filterManager.applyFilter(this, input, output, clear);
};

module.exports = ShieldFilter;
