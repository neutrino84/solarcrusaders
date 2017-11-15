
var pixi = require('pixi'),
    engine = require('engine'),
    glslify = require('glslify'),
    Shader = require('pixi-gl-core').GLShader;

function Snow(game, width, height) {
  engine.Shader.call(this, game, new pixi.Texture(engine.Shader.getRepeatTexture(game, 'snow')));

  this.tileScale = new pixi.Point(1, 1);
  this.tilePosition = new pixi.Point(0, 0);

  this.width = width;
  this.height = height;

  this.alpha = 0.0;
}

Snow.prototype = Object.create(engine.Shader.prototype);
Snow.prototype.constructor = Snow;

Snow.prototype.update = function() {
  var game = this.game,
      view = game.camera.view,
      scale = game.world.scale.x,
      tileScale = scale;

  this.alpha = (1 - game.world.scale.x);

  this.tilePosition.x = -view.x * 3.0;
  this.tilePosition.y = -view.y * 3.0;

  this.tileScale.x = tileScale;
  this.tileScale.y = tileScale;
};

Snow.prototype.resize = function(width, height) {
  this.width = width;
  this.height = height;
};

Snow.prototype.apply = function(renderer, shader) {
  var uTransform = shader.uniforms.uTransform;
      uTransform[0] = (this.tilePosition.x / this._width) + 0.5 - ((1-this.tileScale.x) * (this.tilePosition.x / this._width));
      uTransform[1] = (this.tilePosition.y / this._height) + 0.5 - ((1-this.tileScale.y) * (this.tilePosition.y / this._height));
      uTransform[2] = (2048 / this._width) * this.tileScale.x;
      uTransform[3] = (2048 / this._height) * this.tileScale.y;

  shader.uniforms.uTransform = uTransform;
  shader.uniforms.uSampler = renderer.bindTexture(this.texture, 0);
  shader.uniforms.alpha = this.alpha;
};

Snow.prototype.getShader = function(gl) {
  return new Shader(gl,
    glslify(__dirname + '/shaders/snow.vert', 'utf8'),
    glslify(__dirname + '/shaders/snow.frag', 'utf8')
  );
};

module.exports = Snow;
