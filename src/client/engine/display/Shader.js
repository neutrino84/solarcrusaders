
var pixi = require('pixi');

function Shader(game, texture) {
  pixi.Sprite.call(this, texture);

  this.game = game;

  this._cached = false;
  this._width = texture.width;
  this._height = texture.height;
  this._glDatas = [];
};

Shader.prototype = Object.create(pixi.Sprite.prototype);
Shader.prototype.constructor = Shader;

Shader.prototype.update = function() {};

Shader.prototype.cache = function(clear) {
  var renderer = this.game.renderer,
      renderTexture = pixi.RenderTexture.create(this._width, this._height);
  renderer.render(this, renderTexture, clear || false);
  this._cached = true;
  this.texture = renderTexture;
};

Shader.prototype.uncache = function() {
  this._cached = false;
};

Shader.prototype._onTextureUpdate = function() {
  if(this._cached) {
    pixi.Sprite.prototype._onTextureUpdate.call(this);
  }
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
    glData = {
      shader: this.getShader(gl),
      quad: new pixi.Quad(gl)
    };

    this._glDatas[renderer.CONTEXT_UID] = glData;
    glData.quad.initVao(glData.shader);
  }

  vertices = glData.quad.vertices;
  vertices[0] = vertices[6] = (this._width) * -this.anchor.x;
  vertices[1] = vertices[3] = this._height * -this.anchor.y;
  vertices[2] = vertices[4] = (this._width) * (1-this.anchor.x);
  vertices[5] = vertices[7] = this._height * (1-this.anchor.y);

  glData.quad.upload();

  renderer.bindShader(glData.shader);
  
  this.apply(renderer, glData.shader);

  glData.quad.draw();
};

Shader.prototype.apply = function(renderer, shader) {
  shader.uniforms.translationMatrix = this.worldTransform.toArray(true);
  renderer.bindTexture(this._texture, 0);
};

Shader.prototype.getBounds = function() {
  var width = this._width;
  var height = this._height;

  var w0 = width * (1-this.anchor.x);
  var w1 = width * -this.anchor.x;

  var h0 = height * (1-this.anchor.y);
  var h1 = height * -this.anchor.y;

  var worldTransform = this.worldTransform;

  var a = worldTransform.a;
  var b = worldTransform.b;
  var c = worldTransform.c;
  var d = worldTransform.d;
  var tx = worldTransform.tx;
  var ty = worldTransform.ty;

  var x1 = a * w1 + c * h1 + tx;
  var y1 = d * h1 + b * w1 + ty;

  var x2 = a * w0 + c * h1 + tx;
  var y2 = d * h1 + b * w0 + ty;

  var x3 = a * w0 + c * h0 + tx;
  var y3 = d * h0 + b * w0 + ty;

  var x4 =  a * w1 + c * h0 + tx;
  var y4 =  d * h0 + b * w1 + ty;

  var minX,
      maxX,
      minY,
      maxY;

  minX = x1;
  minX = x2 < minX ? x2 : minX;
  minX = x3 < minX ? x3 : minX;
  minX = x4 < minX ? x4 : minX;

  minY = y1;
  minY = y2 < minY ? y2 : minY;
  minY = y3 < minY ? y3 : minY;
  minY = y4 < minY ? y4 : minY;

  maxX = x1;
  maxX = x2 > maxX ? x2 : maxX;
  maxX = x3 > maxX ? x3 : maxX;
  maxX = x4 > maxX ? x4 : maxX;

  maxY = y1;
  maxY = y2 > maxY ? y2 : maxY;
  maxY = y3 > maxY ? y3 : maxY;
  maxY = y4 > maxY ? y4 : maxY;

  var bounds = this._bounds;

  bounds.x = minX;
  bounds.width = maxX - minX;

  bounds.y = minY;
  bounds.height = maxY - minY;

  // store a reference so that if this function gets called again in the render cycle we do not have to recalculate
  this._currentBounds = bounds;

  return bounds;
};

Shader.prototype.getShader = function(gl) {
  //.. must be implemented
};

Shader.prototype.getRepeatTexture = function(key) {
  var base = game.cache.getImage(key, true).base;
      base.wrapMode = pixi.WRAP_MODES.REPEAT;
  return base;
};

module.exports = Shader;
