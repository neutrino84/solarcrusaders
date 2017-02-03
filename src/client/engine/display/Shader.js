
var pixi = require('pixi');

function Shader(game, texture) {
  pixi.Sprite.call(this, texture);

  this.game = game;

  this.width = texture ? texture.width : 0;
  this.height = texture ? texture.height : 0;

  this._cached = false;
  this._glDatas = [];
};

Shader.prototype = Object.create(pixi.Sprite.prototype);
Shader.prototype.constructor = Shader;

Shader.prototype.update = function() {};

Shader.prototype.cache = function(clear) {
  var renderer = this.game.renderer,
      renderTexture = pixi.RenderTexture.create(this._width, this._height);
  
  renderer.render(this, renderTexture, clear || false);

  this.texture = renderTexture;
  this._cached = true;
};

Shader.prototype.uncache = function() {
  this._cached = false;
};

Shader.prototype._renderWebGL = function(renderer) {
  var texture = this._texture;
  if(this._cached) {
    pixi.Sprite.prototype._renderWebGL.call(this, renderer);
  } else if(texture && texture._uvs) {
    this._renderShaderWebGL(renderer);
  }
};

Shader.prototype._renderShaderWebGL = function(renderer) {
  var gl, glData, vertices,
      texture = this._texture;

  renderer.flush();

  gl = renderer.gl;
  glData = this._glDatas[renderer.CONTEXT_UID];

  if(!glData) {
    renderer.bindVao(null);

    glData = this._glDatas[renderer.CONTEXT_UID] = {
      shader: this.getShader(gl),
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
  
  // apply uniforms
  this.apply(renderer, glData.shader);

  renderer.state.setBlendMode(this.blendMode);

  glData.quad.vao.draw(renderer.gl.TRIANGLES, 6, 0);
};

Shader.prototype.apply = function(renderer, shader) {
  shader.uniforms.translationMatrix = this.worldTransform.toArray(true);
  shader.uniforms.uSampler = renderer.bindTexture(this.texture, 0);
};

Shader.prototype.getShader = function(gl) {
  //.. must be implemented
};

Shader.prototype.getRepeatTexture = function(key) {
  var base = game.cache.getBaseTexture(key);
      base.wrapMode = pixi.WRAP_MODES.REPEAT;
  return base;
};

module.exports = Shader;
