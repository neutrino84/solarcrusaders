
var pixi = require('pixi'),
    fs = require('fs');

function Space(game, width, height) {
  var base1 = game.cache.getImage('space', true).base;
      base1.mipmap = true;
  var base2 = game.cache.getImage('nebula', true).base;
      base2.mipmap = true;
  var space = this.tex = new pixi.Texture(base1),
      nebula = this.neb = new pixi.Texture(base2);
  
  pixi.Sprite.call(this, space);

  this.game = game;
  this.tileScale = new pixi.Point(1, 1);
  this.tilePosition = new pixi.Point(0, 0);

  this._width = width || 128;
  this._height = height || 128;
  this._uvs = new pixi.TextureUvs();
  this._canvasPattern = null;

  this.shader = new pixi.AbstractFilter(
    fs.readFileSync(__dirname + '/filters/Space.vert', 'utf8'),
    fs.readFileSync(__dirname + '/filters/Space.frag', 'utf8'), {
      channel0: { type: 'sampler2D', value: nebula },
      time: { type: 'f', value: 0 },
      uFrame: { type: '4fv', value: [0,0,1,1] },
      uTransform: { type: '4fv', value: [0,0,1,1] }//,
      // uPixelSize : { type : '2fv', value: [1, 1]}
    }
  );
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
      scale = (game.world.scale.x/10) + (9/10);

  this.tilePosition.x = -view.x/20;
  this.tilePosition.y = -view.y/20;

  this.tileScale.set(scale, scale);

  this.shader.uniforms.time.value = game.clock.totalElapsedSeconds();
};

Space.prototype.resize = function(width, height) {
  this.width = width;
  this.height = height;
};

Space.prototype._onTextureUpdate = function() {
  return;
};

Space.prototype._renderWebGL = function(renderer) {
  // tweak our texture temporarily..
  var texture = this._texture;

  if(!texture || !texture._uvs) {
    return;
  }

  var tempUvs = texture._uvs,
      tempWidth = texture._frame.width,
      tempHeight = texture._frame.height,
      tw = texture.baseTexture.width,
      th = texture.baseTexture.height;

  texture._uvs = this._uvs;
  texture._frame.width = this.width;
  texture._frame.height = this.height;

  // this.shader.uniforms.uPixelSize.value[0] = 1.0/tw;
  // this.shader.uniforms.uPixelSize.value[1] = 1.0/th;

  this.shader.uniforms.uFrame.value[0] = tempUvs.x0;
  this.shader.uniforms.uFrame.value[1] = tempUvs.y0;
  this.shader.uniforms.uFrame.value[2] = tempUvs.x1 - tempUvs.x0;
  this.shader.uniforms.uFrame.value[3] = tempUvs.y2 - tempUvs.y0;

  // this.shader.uniforms.uTransform.value[0] = (this.tilePosition.x % (tempWidth * this.tileScale.x)) / this._width;
  // this.shader.uniforms.uTransform.value[1] = (this.tilePosition.y % (tempHeight * this.tileScale.y)) / this._height;
  this.shader.uniforms.uTransform.value[0] = (this.tilePosition.x / this._width) + 0.5 - ((1-this.tileScale.x) * (this.tilePosition.x / this._width));
  this.shader.uniforms.uTransform.value[1] = (this.tilePosition.y / this._height) + 0.5 - ((1-this.tileScale.y) * (this.tilePosition.y / this._height));
  this.shader.uniforms.uTransform.value[2] = (tw / this._width) * this.tileScale.x;
  this.shader.uniforms.uTransform.value[3] = (th / this._height) * this.tileScale.y;

  renderer.setObjectRenderer(renderer.plugins.sprite);
  renderer.plugins.sprite.render(this);

  texture._uvs = tempUvs;
  texture._frame.width = tempWidth;
  texture._frame.height = tempHeight;
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
