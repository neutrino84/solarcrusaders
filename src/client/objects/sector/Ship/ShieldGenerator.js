
var pixi = require('pixi'),
    engine = require('engine'),
    ShieldShader = require('../../../fx/shaders/ShieldShader'),
    OutlineFilter = require('../../../fx/filters/OutlineFilter');

function ShieldGenerator(parent) {
  this.parent = parent;
  this.game = parent.game;

  this.outlineSprite = new engine.Sprite(this.game, 'texture-atlas', this.parent.name + '.png');
  this.shieldSprite = new engine.Sprite(this.game, 'texture-atlas', this.parent.name + '.png');
  this.width = this.shieldSprite.width
  this.height = this.shieldSprite.height;
  
  this.shieldShader = new ShieldShader();

  this._running = false;
};

ShieldGenerator.prototype.constructor = ShieldGenerator;

ShieldGenerator.prototype.create = function() {
  var game = this.game,
      cache = game.cache,
      parent = this.parent,
      width = this.width,
      height = this.height,
      outlineSprite = this.outlineSprite,
      outlineRenderTexture, outlineFilter,
      shieldSprite = this.shieldSprite,
      shieldRenderTexture, blurFilter;

  // render ship outline
  if(!cache.checkRenderTextureKey(parent.name + '-outline')) {
    outlineFilter = new OutlineFilter(width, height);
    // blurFilter = new pixi.filters.BlurFilter();
    // blurFilter.blur = 2;
    // blurFilter.passes = 2;
    outlineRenderTexture = new pixi.RenderTexture(game.renderer, width, height);
    outlineRenderTexture.render(outlineSprite);
    outlineSprite.filters = [/*blurFilter, */outlineFilter];
    outlineRenderTexture.render(outlineSprite);
    outlineSprite.filters = undefined;
    cache.addRenderTexture(parent.name + '-outline', outlineRenderTexture);
  } else {
    outlineRenderTexture = cache.getRenderTexture(parent.name + '-outline').texture;
  }
  
  outlineSprite.texture = outlineRenderTexture;
  outlineSprite.blendMode = engine.BlendMode.ADD;
  outlineSprite.tint = 0x55aaff;

  // render shield effect
  if(!cache.checkRenderTextureKey(parent.name + '-blur')) {
    blurFilter = new pixi.filters.BlurFilter();
    blurFilter.blur = 100;
    blurFilter.passes = 4;
    shieldRenderTexture = new pixi.RenderTexture(game.renderer, width, height);
    shieldRenderTexture.render(shieldSprite);
    shieldSprite.filters = [blurFilter];
    shieldRenderTexture.render(shieldSprite);
    shieldSprite.filters = undefined;
    cache.addRenderTexture(parent.name + '-blur', shieldRenderTexture);
  } else {
    shieldRenderTexture = cache.getRenderTexture(parent.name + '-blur').texture;
  }
  
  shieldSprite.texture = shieldRenderTexture;
  shieldSprite.blendMode = engine.BlendMode.ADD;
  shieldSprite.shader = this.shieldShader;
};

ShieldGenerator.prototype.start = function() {
  this._running = true;
  this.parent.addChild(this.shieldSprite);
  this.parent.addChild(this.outlineSprite);

  this.outlineSprite.alpha = 1.0;
  this.fadeTween = this.game.tweens.create(this.outlineSprite);
  this.fadeTween.to({ alpha: 0.50 }, 100, engine.Easing.Quadratic.InOut);
  this.fadeTween.repeat();
  this.fadeTween.yoyo(true, 0);
  this.fadeTween.start();
};

ShieldGenerator.prototype.stop = function() {
  this._running = false;
  this.fadeTween && this.fadeTween.stop();
  this.parent.removeChild(this.shieldSprite);
  this.parent.removeChild(this.outlineSprite);
};

ShieldGenerator.prototype.update = function() {
  if(this._running) {
    this.shieldShader.time += 0.01;
  }
};

ShieldGenerator.prototype.destroy = function() {
  this.stop();
  this.parent = this.game =
    this.shieldSprite = this.shieldShader = 
    this.renderTexture = this.fadeTween = undefined;
};

module.exports = ShieldGenerator;
