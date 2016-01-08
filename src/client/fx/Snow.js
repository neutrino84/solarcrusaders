
var pixi = require('pixi'),
    SnowFilter = require('./filters/SnowFilter');

function Snow(game, width, height) {
  var base = game.cache.getImage('space', true).base;
      base.mipmap = true;
  var texture = new pixi.Texture(base);

  pixi.Sprite.call(this, texture);

  this.game = game;

  this.filter = new SnowFilter(game);
  this.filter.setResolution(width, height);

  this.filters = [this.filter];

  // optimize
  this.game.on('fpsProblem', this.destroy, this);
}

Snow.prototype = Object.create(pixi.Sprite.prototype);
Snow.prototype.constructor = Snow;

Snow.prototype.update = function() {};

Snow.prototype.resize = function(width, height) {
  this.filter && this.filter.setResolution(width, height);
};

Snow.prototype.destroy = function() {
  this.filters = undefined;
  this.filter = undefined;
  this.parent.removeChild(this);

  pixi.Sprite.prototype.destroy.call(this);
};

module.exports = Snow;

