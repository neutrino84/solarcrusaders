
var engine = require('engine');

function EngineCore(parent) {
  this.parent = parent;
  this.game = parent.game;
  this.booster = false;

  this.glows = [];
  this.highlights = [];
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
      config = parent.config.engine.glows;
  
  for(var g in config) {
    c = config[g];

    highlight = new engine.Sprite(parent.game, 'texture-atlas', 'engine-highlight.png');
    highlight.pivot.set(32, 32);
    highlight.position.set(c.position.x, c.position.y);
    highlight.scale.set(1.25, 1.25);
    highlight.tint = c.tint;
    highlight.blendMode = engine.BlendMode.ADD;
    highlight.alpha = 0;

    glow = new engine.Sprite(parent.game, 'texture-atlas', c.sprite + '.png');
    glow.pivot.set(128, 64);
    glow.rotation = global.Math.PI + engine.Math.degToRad(c.rotation);
    glow.position.set(c.position.x, c.position.y);
    glow.scale.set(c.scale.startX * 0.1, c.scale.startY * 0.1);
    glow.tint = c.tint;

    parent.addChild(glow);
    parent.addChild(highlight);

    glows.push(glow);
    highlights.push(highlight);
  }
}

EngineCore.prototype.update = function(multiplier) {
  var scale, center, highlight,
      glows = this.glows,
      highlights = this.highlights,
      game = this.game,
      parent = this.parent,
      config = parent.config.engine.glows,
      flicker = EngineCore.flicker[game.clock.frames % 6];
  for(var g in glows) {
    scale = config[g].scale;
    glows[g].scale.set(multiplier * scale.endX + flicker, multiplier * scale.endY + (flicker * 3));
  }
  for(var h in highlights) {
    highlight = highlights[h];
    highlight.alpha = global.Math.min(1.0, multiplier);
    
    if(this.booster) {
      center = game.world.worldTransform.applyInverse(highlight.worldTransform.apply(highlight.pivot));
      parent.manager.flashEmitter.at({ center: center });
      parent.manager.flashEmitter.explode(1);
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
