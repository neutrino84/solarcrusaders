
var pixi = require('pixi'),
    engine = require('engine'),
    glslify = require('glslify'),
    Shader = require('pixi-gl-core').GLShader;

function Space(game) {
  this.spaceTexture = new pixi.Texture(engine.Shader.getRepeatTexture(game, 'space'));

  engine.Shader.call(this, game, this.spaceTexture);

  this.tileScale = new pixi.Point(1, 1);
  this.tilePosition = new pixi.Point(0, 0);

  this.width = game.width;
  this.height = game.height;
};

Space.prototype = Object.create(engine.Shader.prototype);
Space.prototype.constructor = Space;

Space.prototype.update = function() {
  var game = this.game,
      view = game.camera.view,
      scale = game.world.scale.x/10 + 9/10;

  this.tilePosition.x = -view.x/20;
  this.tilePosition.y = -view.y/20;

  this.tileScale.x = scale
  this.tileScale.y = scale;
};

Space.prototype.resize = function(width, height) {
  this.width = width;
  this.height = height;
};

Space.prototype._renderShaderWebGL = function(renderer) {
  var gl, glData, vertices,
      textureUvs, textureWidth, textureHeight,
      uTransform, texture = this._texture;

  renderer.flush();

  gl = renderer.gl;
  glData = this._glDatas[renderer.CONTEXT_UID];

  if(!glData) {
    renderer.bindVao(null);

    glData = this._glDatas[renderer.CONTEXT_UID] = {
      shader: new pixi.Shader(gl,
        glslify(__dirname + '/shaders/space.vert', 'utf8'),
        glslify(__dirname + '/shaders/space.frag', 'utf8')
      ),
      quad: new pixi.Quad(gl, renderer.state.attribState)
    };

    glData.quad.initVao(glData.shader);
  }

  renderer.bindVao(glData.quad.vao);

  vertices = glData.quad.vertices;
  vertices[0] = vertices[6] = (this._width) * -this.anchor.x;
  vertices[1] = vertices[3] = this._height * -this.anchor.y;
  vertices[2] = vertices[4] = (this._width) * (1-this.anchor.x);
  vertices[5] = vertices[7] = this._height * (1-this.anchor.y);

  vertices = glData.quad.uvs;
  vertices[0] = vertices[6] = -this.anchor.x;
  vertices[1] = vertices[3] = -this.anchor.y;
  vertices[2] = vertices[4] = 1.0 - this.anchor.x;
  vertices[5] = vertices[7] = 1.0 - this.anchor.y;

  glData.quad.upload();

  renderer.bindShader(glData.shader);

  uTransform = glData.shader.uniforms.uTransform;
  uTransform[0] = (this.tilePosition.x / this._width) + 0.5 - ((1-this.tileScale.x) * (this.tilePosition.x / this._width));
  uTransform[1] = (this.tilePosition.y / this._height) + 0.5 - ((1-this.tileScale.y) * (this.tilePosition.y / this._height));
  uTransform[2] = (texture.baseTexture.width / this._width) * this.tileScale.x;
  uTransform[3] = (texture.baseTexture.height / this._height) * this.tileScale.y;
  
  glData.shader.uniforms.uTransform = uTransform;
  glData.shader.uniforms.uSampler = renderer.bindTexture(this.spaceTexture, 0);

  renderer.state.setBlendMode(this.blendMode);

  glData.quad.vao.draw(renderer.gl.TRIANGLES, 6, 0);
};

Space.prototype.destroy = function() {
  pixi.Sprite.prototype.destroy.call(this);

  this.game = null;
  this.tileScale = null;
  this.tilePosition = null;
  this.spaceTexture = null;
  
  this._glDatas = null;
};

module.exports = Space;
