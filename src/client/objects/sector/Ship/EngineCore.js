
var engine = require('engine');

function EngineCore(parent, config) {
  this.parent = parent;
  this.game = parent.game;
  this.config = config;

  this.glows = [];
  this.highlights = [];

  this.brightness = 0.0;
  this.isBoosting = false;

  this.position = new engine.Point();
};

// random flicker
EngineCore.flicker = [
  0.01, 0.02,
  0.07, 0.03,
  0.012, 0.06
];

EngineCore.prototype.constructor = EngineCore;

EngineCore.prototype.create = function() {
  var glow, highlight, conf,
      glows = this.glows,
      highlights = this.highlights,
      parent = this.parent,
      config = this.config.glows,
      length = config.length;
  
  for(var g=0; g<length; g++) {
    conf = config[g];

    // create highlight
    highlight = new engine.Sprite(parent.game, 'texture-atlas', 'engine-highlight.png');
    highlight.pivot.set(32, 32);
    highlight.position.set(conf.position.x, conf.position.y);
    highlight.scale.set(1.0, 1.0);
    highlight.tint = conf.tint;
    highlight.blendMode = engine.BlendMode.ADD;
    highlight.alpha = 0;

    // create glow
    glow = new engine.Sprite(parent.game, 'texture-atlas', 'engine-glow.png');
    glow.pivot.set(128, 64);
    glow.rotation = global.Math.PI + engine.Math.degToRad(conf.rotation);
    glow.position.set(conf.position.x, conf.position.y);
    glow.scale.set(conf.scale.startX * 0.1, conf.scale.startY * 0.1);
    glow.tint = conf.tint;
    glow.blendMode = engine.BlendMode.ADD;

    parent.addChildAt(glow, 0);
    parent.addChild(highlight);

    glows.push(glow);
    highlights.push(highlight);
  }
};

EngineCore.prototype.start = function() {
  this.isBoosting = true;
};

EngineCore.prototype.stop = function() {
  this.isBoosting = false;
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
      parent = this.parent,
      highlights = this.highlights,
      config = this.config.glows,
      position = this.position,
      length = config.length,
      flicker = EngineCore.flicker[game.clock.frames % 6],
      scale, center, highlight, relative;

  // set brightness
  this.brightness += (multiplier - this.brightness) * 0.1;
  
  for(var g=0; g<length; g++) {
    scale = config[g].scale;
    
    // update glow
    glows[g].scale.set(
      this.brightness * scale.endX + flicker,
      this.brightness * scale.endY + flicker);

    // update highlight
    highlight = highlights[g];
    highlight.alpha = this.brightness;
    
    if(this.isBoosting && game.clock.frames % 2 === 0) {
      highlight.worldTransform.apply(highlight.pivot, position);
      game.world.worldTransform.applyInverse(position, position);
      
      parent.manager.flashEmitter.at({ center: position });
      parent.manager.flashEmitter.explode(1);
    }
  }
};

EngineCore.prototype.destroy = function() {
  this.parent = this.game = this.config =
    this.position = this.glows = 
    this.highlights = undefined;
};

module.exports = EngineCore;
