
var engine = require('engine');

function EngineCore(parent) {
  this.parent = parent;

  this.glows = [];
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
  var glow, c,
      glows = this.glows,
      parent = this.parent,
      config = parent.config.engine.glows;
  
  for(var g in config) {
    c = config[g];

    glow = new engine.Sprite(parent.game, 'ship-atlas');
    glow.frame = c.sprite + '.png';
    glow.pivot.set(128, 64);
    glow.rotation = global.Math.PI + engine.Math.degToRad(c.rotation);
    glow.position.set(c.position.x, c.position.y);
    glow.scale.set(c.scale.startX * 0.1, c.scale.startY * 0.1);
    glow.tint = c.tint;

    parent.addChild(glow);

    glows.push(glow);
  }
}

EngineCore.prototype.update = function(multiplier) {
  var glows = this.glows,
      length = glows.length,
      parent = this.parent,
      config = parent.config.engine.glows,
      flicker = EngineCore.flicker[parent.game.clock.frames % 6];
  for(var i=0; i<length; i++) {
    glows[i].scale.set(multiplier * config[i].scale.endX + flicker, multiplier * config[i].scale.endY + (flicker * 3));
  }
};

module.exports = EngineCore;
