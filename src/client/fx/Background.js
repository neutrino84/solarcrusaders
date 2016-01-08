
var BackgroundFilter = require('./filters/BackgroundFilter'),
    pixi = require('pixi');

function Background(game, width, height) {
  var base = game.cache.getImage('space', true).base;
      base.mipmap = true;
  var texture = this.tex = new pixi.Texture(base);

  pixi.Sprite.call(this, texture);

  this.game = game;

  this.filter = new BackgroundFilter(game);
  this.filter.setResolution(width, height);
  this.filter.setTexture(texture);

  this.filters = [this.filter];

  // default
  this.cache();
}

Background.prototype = Object.create(pixi.Sprite.prototype);
Background.prototype.constructor = Background;

Background.prototype.update = function() {};

Background.prototype.resize = function(width, height) {
  this.filter.setResolution(width, height);
};

Background.prototype.cache = function() {
  this.backgroundTexture && this.backgroundTexture.destroy();
  this.backgroundTexture = new pixi.RenderTexture(this.game.renderer, this.game.width, this.game.height);
  this.backgroundTexture.render(this);
  this.texture = this.backgroundTexture;
  this.filters = undefined;
};

Background.prototype.uncache = function() {
  this.texture = this.tex;
  this.filters = [this.filter];
};

Background.prototype.destroy = function() {
  pixi.Sprite.prototype.destroy.call(this);
  this.game = this.filter = this.filters = this.tex =
    this.backgroundTexture = undefined;
};

module.exports = Background;

