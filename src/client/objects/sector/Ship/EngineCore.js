
var engine = require('engine');

function EngineCore(parent) {
  this.parent = parent;
  this.game = parent.game;

  this.glows = [];
  this.highlights = [];

  this._booster = false;
};

// random flicker
EngineCore.flicker = [
  global.Math.random() * 0.045,
  global.Math.random() * 0.025,
  global.Math.random() * 0.015,
  global.Math.random() * 0.025,
  global.Math.random() * 0.035,
  global.Math.random() * 0.025
];

EngineCore.prototype.constructor = EngineCore;

EngineCore.prototype.create = function() {
  var glow, highlight, c,
      glows = this.glows,
      highlights = this.highlights,
      parent = this.parent,
      config = parent.config.engine.glows,
      length = config.length;
  
  for(var g=0; g<length; g++) {
    c = config[g];

    highlight = new engine.Sprite(parent.game, 'texture-atlas', 'engine-highlight.png');
    highlight.pivot.set(32, 32);
    highlight.position.set(c.position.x, c.position.y);
    highlight.scale.set(1.0, 1.0);
    highlight.tint = c.tint;
    highlight.blendMode = engine.BlendMode.ADD;
    highlight.alpha = 0;

    glow = new engine.Sprite(parent.game, 'texture-atlas', 'engine-glow.png');
    glow.pivot.set(128, 64);
    glow.rotation = global.Math.PI + engine.Math.degToRad(c.rotation);
    glow.position.set(c.position.x, c.position.y);
    glow.scale.set(c.scale.startX * 0.1, c.scale.startY * 0.1);
    glow.tint = c.tint;
    glow.blendMode = engine.BlendMode.ADD;

    parent.addChildAt(glow, 0);
    parent.addChild(highlight);

    glows.push(glow);
    highlights.push(highlight);
  }
};

EngineCore.prototype.start = function() {
  this._booster = true;
};

EngineCore.prototype.stop = function() {
  this._booster = false;
};

EngineCore.prototype.update = function(multiplier) {
  var scale, center, highlight,
      glows = this.glows,
      highlights = this.highlights,
      game = this.game,
      parent = this.parent,
      manager = parent.manager,
      config = parent.config.engine.glows,
      length = config.length,
      flicker = EngineCore.flicker[game.clock.frames % 6],
      clamped = global.Math.max(global.Math.min(multiplier, 1.5), 0.25);
  for(var g=0; g<length; g++) {
    scale = config[g].scale;
    glows[g].scale.set(clamped * scale.endX + flicker, clamped * scale.endY + (flicker * 3));
  }
  for(var h=0; h<length; h++) {
    highlight = highlights[h];
    highlight.alpha = global.Math.min(1.0, clamped) / (length / 2);
    
    if(this._booster && multiplier > 0) {
      center = game.world.worldTransform.applyInverse(this.parent.worldTransform.apply(highlight.worldTransform.apply(highlight.pivot)));
      
      manager.flashEmitter.color(config[h].tint);
      manager.flashEmitter.at({ center: center });
      manager.flashEmitter.explode(1);
    }
  }
};

EngineCore.prototype.destroy = function() {
  var glows = this.glows,
      highlights = this.highlights;
  for(var g in glows) {
    glows[g].destroy();
  }
  for(var h in highlights) {
    highlights[h].destroy();
  }
  this.parent = this.game = this.glows = 
    this.highlights = undefined;
};

module.exports = EngineCore;
