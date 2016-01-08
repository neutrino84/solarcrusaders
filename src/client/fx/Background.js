
var BackgroundFilter = require('./filters/BackgroundFilter'),
    pixi = require('pixi');

function Background(game, width, height) {
  var base = game.cache.getImage('space', true).base;
      base.mipmap = true;
  var texture = new pixi.Texture(base);

  pixi.Sprite.call(this, texture);

  this.game = game;

  this.filter = new BackgroundFilter(game);
  this.filter.setResolution(width, height);
  this.filter.setTexture(texture);

  this.filters = [this.filter];

  // optimize
  this.game.on('fpsProblem', function() {
    this.backgroundTexture = new pixi.RenderTexture(game.renderer, width, height);
    this.backgroundTexture.render(this);
    this.texture = this.backgroundTexture;
    this.filters = undefined;
  }, this);
}

Background.prototype = Object.create(pixi.Sprite.prototype);
Background.prototype.constructor = Background;

Background.prototype.update = function() {};

Background.prototype.resize = function(width, height) {
  this.filter.setResolution(width, height);
};

module.exports = Background;

