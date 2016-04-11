
var pixi = require('pixi'),
    engine = require('engine'),
    glslify = require('glslify'),
    Shader = require('pixi-gl-core').GLShader;

function Snow(game, width, height) {
  engine.Shader.call(this, game, new pixi.Texture(this.getRepeatTexture('planet')));

  this.tileScale = new pixi.Point(1, 1);
  this.tilePosition = new pixi.Point(0, 0);

  this._width = width;
  this._height = height;

  // optimize
  // this.game.on('fpsProblem', this.destroy, this);
}

Snow.prototype = Object.create(engine.Shader.prototype);
Snow.prototype.constructor = Snow;

Snow.prototype.update = function() {
  var game = this.game,
      view = game.camera.view,
      scale = game.world.scale.x*1.5;

  this.tilePosition.x = -view.x*1.5;
  this.tilePosition.y = -view.y*1.5;

  this.tileScale.set(scale, scale);
};

Snow.prototype.resize = function(width, height) {
  this._width = width;
  this._height = height;
};

Snow.prototype.apply = function(renderer, shader) {
  var uTransform = shader.uniforms.uTransform;
      uTransform[0] = (this.tilePosition.x / this._width) + 0.5 - ((1-this.tileScale.x) * (this.tilePosition.x / this._width));
      uTransform[1] = (this.tilePosition.y / this._height) + 0.5 - ((1-this.tileScale.y) * (this.tilePosition.y / this._height));
      uTransform[2] = (1024 / this._width) * this.tileScale.x;
      uTransform[3] = (1024 / this._height) * this.tileScale.y;
  shader.uniforms.uTransform = uTransform;
  shader.uniforms.time = this.game.clock.totalElapsedSeconds();
};

Snow.prototype.getShader = function(gl) {
  return new Shader(gl,
    glslify(__dirname + '/shaders/snow.vert', 'utf8'),
    glslify(__dirname + '/shaders/snow.frag', 'utf8')
  );
};

Object.defineProperties(Snow.prototype, {
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

module.exports = Snow;
