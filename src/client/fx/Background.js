
var BackgroundFilter = require('./filters/BackgroundFilter'),
    pixi = require('pixi');

function Background(game, width, height) {

  var base = game.cache.getImage('space', true).base;
      base.mipmap = true;
  var texture = new pixi.Texture(base);

  pixi.Sprite.call(this, texture);

  this.game = game;
  this.width = width;
  this.height = height;

  this.filter = new BackgroundFilter(game);
  this.filter.setResolution(width, height);
  this.filter.setTexture(texture);

  this.filters = [this.filter];
}

Background.prototype = Object.create(pixi.Sprite.prototype);
Background.prototype.constructor = Background;

Background.prototype.preUpdate =
  function() {};

Background.prototype.update =
  function() {};

Background.prototype.postUpdate =
  function() {};

Background.prototype.resize =
  function(width, height) {
    this.width = width;
    this.height = height;
    this.filter.setResolution(width, height);
  };

module.exports = Background;

