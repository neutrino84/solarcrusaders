
var engine = require('engine');

function EngineCore(ship, config) {
  this.ship = ship;
  this.game = ship.game;
  this.config = config;

  this.position = engine.Point();

  this.glows = [];
  this.highlights = [];

  this.clamp = 1.0;
  this.isBoosting = false;
};

// random flicker
EngineCore.flicker = [
  0.095, 0.04,
  0.07, 0.075,
  0.015, 0.087
];

EngineCore.prototype.constructor = EngineCore;

EngineCore.prototype.create = function() {
  var glow, highlight, conf,
      glows = this.glows,
      ship = this.ship,
      highlights = this.highlights,
      config = this.config.glows;

  // highlights
  for(var g=0; g<config.length; g++) {
    conf = config[g];

    // create glow
    highlight = new engine.Sprite(ship.game, 'texture-atlas', 'engine-highlight.png');
    highlight.pivot.set(32, 32);
    highlight.position.set(conf.position.x, conf.position.y);
    highlight.scale.set(0, 0);
    highlight.tint = conf.tint;
    highlight.blendMode = engine.BlendMode.ADD;
    highlight.alpha = 0;

    // create exaust
    glow = new engine.Sprite(ship.game, 'texture-atlas', 'engine-glow.png');
    glow.pivot.set(82, 41);
    glow.rotation = global.Math.PI + engine.Math.degToRad(conf.rotation);
    glow.position.set(conf.position.x, conf.position.y);
    glow.scale.set(0, 0);
    glow.tint = conf.tint;
    glow.blendMode = engine.BlendMode.ADD;

    ship.addChildAt(glow, 0);
    ship.addChild(highlight);

    glows.push(glow);
    highlights.push(highlight);
  }
};

EngineCore.prototype.start = function() {
  this.isBoosting = true;
  this.clamp = 1.25;
};

EngineCore.prototype.stop = function() {
  this.isBoosting = false;
  this.clamp = 1.0;
};

EngineCore.prototype.show = function(show) {
  var glows = this.glows,
      highlights = this.highlights,
      config = this.config.glows,
      length = config.length;
  for(var i=0; i<length; i++) {
    glows[i].renderable = show;
    highlights[i].renderable = show;
  }
};

EngineCore.prototype.update = function(multiplier) {
  var game = this.game,
      glows = this.glows,
      ship = this.ship,
      highlights = this.highlights,
      config = this.config.glows,
      length = config.length,
      flicker = EngineCore.flicker[game.clock.frames % 6],
      scale, highlight, position;

  // set brightness
  multiplier = engine.Math.clamp(multiplier, 0.25, this.clamp);
  
  for(var g=0; g<length; g++) {
    scale = config[g].scale;
    
    // update glow
    glows[g].scale.set(
      multiplier * scale.endX + scale.startX + flicker,
      multiplier * scale.endY + scale.startY + flicker);

    // update highlight
    highlight = highlights[g];
    highlight.alpha = multiplier;
    highlight.scale.set(multiplier/2.0, multiplier/2.0);
      
    if(this.isBoosting) {
      position = game.world.worldTransform.applyInverse(ship.worldTransform.apply(glows[g].position))
      ship.manager.fireEmitter.boost([config[g].tint, 0x333333]);
      ship.manager.fireEmitter.at({ center: position });
      ship.manager.fireEmitter.explode(1);
    }
  }
};

EngineCore.prototype.destroy = function() {
  this.ship = this.game = this.config =
    this.position = this.glows = 
    this.highlights = undefined;
};

module.exports = EngineCore;
