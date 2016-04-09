
var pixi = require('pixi'),
    engine = require('engine'),
    glslify = require('glslify'),
    Shader = require('pixi-gl-core').GLShader;

function Atmosphere(game) {
  engine.Shader.call(this, game, new pixi.Texture(this.getRepeatTexture('planet')));
};

Atmosphere.prototype = Object.create(engine.Shader.prototype);
Atmosphere.prototype.constructor = Atmosphere;

Atmosphere.prototype.getShader = function(gl) {
  return new Shader(gl,
    glslify(__dirname + '/shaders/planet.vert', 'utf8'),
    glslify(__dirname + '/shaders/atmosphere.frag', 'utf8')
  );
};

module.exports = Atmosphere;
