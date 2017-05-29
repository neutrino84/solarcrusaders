var pixi = require('pixi'),
    Const = require('../const'),
    Point = require('../geometry/Point'),
    Core = require('./components/Core'),
    Destroy = require('./components/Destroy');

function Sprite(game, key, frame) {
  pixi.Sprite.call(this);

  this.type = Const.SPRITE;

  Core.init.call(this, game, key, frame);
};

Sprite.prototype = Object.create(pixi.Sprite.prototype);
Sprite.prototype.constructor = Sprite;

Core.install.call(
  Sprite.prototype, [
    'Mixin',
    'Animation',
    'Destroy',
    'LoadTexture',
    'InputEnabled'
  ]
);

Sprite.prototype.updateCore = Core.update;

Sprite.prototype.update = function() {
  this.updateCore();
};

Sprite.prototype.cache = function(clear) {
  var renderer = this.game.renderer,
      renderTexture = pixi.RenderTexture.create(this.width, this.height);
  
  // renderer.currentRenderer.flush();
  renderer.render(this, renderTexture, clear || false);
  // console.log('this.texture is ', this.texture)
  
  if(this.texture){this._cached = this.texture;}
  // this.tempVar = 'something'+clear
  // console.log('this is ', this)
  // if(clear === 'test'){
  //   console.log('in cache, tempVar is ', this.tempVar, 'this.cached is ', this._cached)
  // }
  // this._cached = true;
  this.texture = renderTexture;
};

Sprite.prototype.uncache = function() {
  console.log('in uncache')
  // console.log(this._cached)
  console.log(this._cached)
  this.texture = this._cached;
  this._cached = false;
  // console.log(this._cached)
  // console.log('EYYYY', this._cached, this.tempVar);
};

module.exports = Sprite;
