
var pixi = require('pixi'),
    engine = require('engine'),
    glslify = require('glslify'),
    Shader = require('pixi-gl-core').GLShader,
    Atmosphere = require('./Atmosphere');

function Planet(game, texture) {

  this.planetShader = texture;

  this.planetTexture = new pixi.Texture(engine.Shader.getRepeatTexture(game, 'planet')),
  this.cloudsTexture = new pixi.Texture(engine.Shader.getRepeatTexture(game, 'clouds'));

  engine.Shader.call(this, game, this.planetTexture);

  this.atmosphere = new Atmosphere(game);
  this.atmosphere.cache();
  this.addChild(this.atmosphere);

  this.pivot.set(this.width/10, this.height/10);
  this.position.set(2048/4, 2048/4);

  this.planetFragFile = '/shaders/planet.frag'
};

Planet.prototype = Object.create(engine.Shader.prototype);
Planet.prototype.constructor = Planet;

Planet.prototype.apply = function(renderer, shader) {
  shader.uniforms.time = this.game.clock.totalElapsedSeconds();
  shader.uniforms.translationMatrix = this.worldTransform.toArray(true);
  shader.uniforms.uSampler = renderer.bindTexture(this.planetTexture, 0);

  if(this.planetShader === 'eamon-alpha' || this.planetShader === 'talus'){
    shader.uniforms.uClouds = renderer.bindTexture(this.cloudsTexture, 1);
    
  }
  //is there a way to pass something into the planet.frag?
};




Planet.prototype.getShader = function(gl) {
  
  switch(this.planetShader) {
    case 'daigus':
      return new Shader(gl,
        glslify(__dirname + '/shaders/planet_daigus.vert', 'utf8'),
        glslify(__dirname + '/shaders/planet_daigus.frag', 'utf8')
      );
      break
    case 'eamon-alpha':
      return new Shader(gl,
        glslify(__dirname + '/shaders/planet.vert', 'utf8'),
        glslify(__dirname + '/shaders/planet.frag', 'utf8')
      );
      break;
    // case 'modo':
    //   ai = new Scavenger(ship, faction);
    //   break;
    // case 'ichor':
    //   ai = new Squadron(ship);
    //   break;
    case 'talus':
      return new Shader(gl,
        glslify(__dirname + '/shaders/planet_talus.vert', 'utf8'),
        glslify(__dirname + '/shaders/planet_talus.frag', 'utf8')
      );
      break;
    // case 'arkon':
    //   ai = new Enforcer(ship);
    //   break;
    default:
      return new Shader(gl,
        glslify(__dirname + '/shaders/planet.vert', 'utf8'),
        glslify(__dirname + '/shaders/planet.frag', 'utf8')
      );
      break;
  }
  // return new Shader(gl,
  //   glslify(__dirname + '/shaders/planet.vert', 'utf8'),
  //   glslify(__dirname + '/shaders/planet.frag', 'utf8')
  // );
};

module.exports = Planet;
