
var pixi = require('pixi'),
    glslify = require('glslify'),
    Shader = require('pixi-gl-core').GLShader;

function Space(game, width, height) {
  var base1 = game.cache.getImage('space', true).base;
      base1.wrapMode = pixi.WRAP_MODES.REPEAT;
  var base2 = game.cache.getImage('nebula', true).base;
      base2.wrapMode = pixi.WRAP_MODES.REPEAT;

  this.spaceTexture = new pixi.Texture(base1);
  this.nebulaTexture = new pixi.Texture(base2);

  pixi.Sprite.call(this, this.spaceTexture);

  this.game = game;

  this.tileScale = new pixi.Point(1, 1);
  this.tilePosition = new pixi.Point(0, 0);

  this._width = width || 128;
  this._height = height || 128;
  this._uvs = new pixi.TextureUvs();
  this._glDatas = [];
};

Space.prototype = Object.create(pixi.Sprite.prototype);
Space.prototype.constructor = Space;

Object.defineProperties(Space.prototype, {
  width: {
    get: function() {
      return this._width;
    },
    
    set: function(value) {
      this._width = value;
    }
  },

  height: {
    get: function() {
      return this._height;
    },

    set: function(value) {
      this._height = value;
    }
  }
});

Space.prototype.update = function() {
  var game = this.game,
      view = game.camera.view,
      scale = game.world.scale.x/10 + 9/10;

  this.tilePosition.x = -view.x/20;
  this.tilePosition.y = -view.y/20;

  this.tileScale.set(scale, scale);
};

Space.prototype.resize = function(width, height) {
  this.width = width;
  this.height = height;
};

Space.prototype._onTextureUpdate = function() {
  return;
};

Space.prototype._renderWebGL = function(renderer) {
  var gl, glData, vertices, btex,
      textureUvs, textureWidth, textureHeight,
      textureBaseWidth, textureBaseHeight,
      uPixelSize, uFrame, uTransform,
      texture = this._texture;

  if(!texture || !texture._uvs) { return; }

  renderer.flush();

  gl = renderer.gl;
  glData = this._glDatas[renderer.CONTEXT_UID];

  if(!glData) {
    glData = {
      shader: new Shader(gl,
        glslify(__dirname + '/shaders/SpaceShader.vert', 'utf8'),
        glslify(__dirname + '/shaders/SpaceShader.frag', 'utf8')
      ),
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

  textureUvs = texture._uvs,
  textureWidth = texture._frame.width,
  textureHeight = texture._frame.height,
  textureBaseWidth = texture.baseTexture.width,
  textureBaseHeight = texture.baseTexture.height;

  uTransform = glData.shader.uniforms.uTransform;
  uTransform[0] = (this.tilePosition.x / this._width) + 0.5 - ((1-this.tileScale.x) * (this.tilePosition.x / this._width));
  uTransform[1] = (this.tilePosition.y / this._height) + 0.5 - ((1-this.tileScale.y) * (this.tilePosition.y / this._height));
  uTransform[2] = (textureBaseWidth / this._width) * this.tileScale.x;
  uTransform[3] = (textureBaseHeight / this._height) * this.tileScale.y;
  
  glData.shader.uniforms.uTransform = uTransform;
  glData.shader.uniforms.alpha = this.worldAlpha;
  glData.shader.uniforms.uMapSampler = 1;

  renderer.bindTexture(this.nebulaTexture, 1);
  renderer.bindTexture(this._texture, 0);

  glData.quad.draw();
};

Space.prototype.getBounds = function() {
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

Space.prototype.destroy = function() {
  pixi.Sprite.prototype.destroy.call(this);

  this.tileScale = null;
  this.tilePosition = null;
  this._tileScaleOffset = null;
  this._uvs = null;
};

module.exports = Space;
