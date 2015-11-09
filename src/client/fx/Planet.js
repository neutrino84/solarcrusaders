
var pixi = require('pixi'),
    PlanetShader = require('./shaders/PlanetShader'),
    PlanetGlowShader = require('./shaders/PlanetGlowShader');

function Planet(game, key) {
  var texture = new pixi.Texture(this.getMipmapTexture(key)),
      clouds = new pixi.Texture(this.getMipmapTexture('clouds'));

  pixi.Sprite.call(this, texture);

  this.game = game;

  this.width = this.texture.width / 1.5;
  this.height = this.texture.height / 1.5;
  this.pivot.set(512, 512);

  this.planetShader = new PlanetShader(game);
  this.planetShader.setTexture(texture, clouds);

  this.glowSprite = new pixi.Sprite(texture);
  this.glowSprite.shader = new PlanetGlowShader(game);
  this.glowTexture = new pixi.RenderTexture(game.renderer, texture.width, texture.height);
  this.glowTexture.render(this.glowSprite);

  this.glowSprite.texture = this.glowTexture;
  this.glowSprite.shader = undefined;

  this.addChild(this.glowSprite);

  this.shader = this.planetShader;
}

Planet.prototype = Object.create(pixi.Sprite.prototype);
Planet.prototype.constructor = Planet;

Planet.prototype.preUpdate = function() {}

Planet.prototype.update = function() {
  this.shader.update();
};

Planet.prototype.postUpdate = function() {}

Planet.prototype.getMipmapTexture = function(key) {
  var base = game.cache.getImage(key, true).base;
      base.mipmap = true;
  return base;
}

module.exports = Planet;
