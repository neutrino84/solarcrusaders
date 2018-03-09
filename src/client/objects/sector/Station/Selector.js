
var engine = require('engine');

function Selector(station) {
  this.station = station;
  this.game = station.game;
  this.data = station.data;

  this.rotation = 0;
  this.targeting = new engine.Graphics();
  this.graphics = new engine.Graphics();
};

Selector.prototype.constructor = Selector;

Selector.SIZE_PADDING = 96;

Selector.prototype.create = function() {
  var station = this.station,
      graphics = this.graphics,
      targeting = this.targeting,
      pi = global.Math.PI,
      size = station.data.size + Selector.SIZE_PADDING,
      color, alpha, thickness,
      x, y, start, end, length, target;

  // set colors
  if(station.data.race === 'general') {
    color = 0xff3333;
    alpha = 0.5;
    thickness = 12.0;
    target = 0xff0000;
  } else if(station.data.race === 'ubaidian') {
    color = 0x3366ff;
    alpha = 0.75;
    thickness = 12.0;
    target = 0x0033ff;
  }

  // create base
  graphics.lineStyle(thickness, color, alpha);
  targeting.lineStyle(thickness+2.0, target, 1.0);
  for(var i=0; i<8; i++) {
    length = pi/4;
    start = i*length;
    end = start+length;
    x = global.Math.cos(start)*size;
    y = global.Math.sin(start)*size;

    // design
    if(i%2===0) {
      graphics.moveTo(x, y);
      graphics.arc(0, 0, size, start, end, false);

      targeting.moveTo(x, y);
      targeting.arc(0, 0, size, start, end, false);
    }
  }
  graphics.position.set(station.width/2, station.height/2);
  graphics.blendMode = engine.BlendMode.ADD;
  graphics.visible = false;

  targeting.position.set(station.width/2, station.height/2);
  targeting.blendMode = engine.BlendMode.ADD;
  targeting.visible = false;

  // add selector graphics
  station.addChild(graphics);
  station.addChild(targeting);
};

Selector.prototype.show = function() {
  this.graphics.visible = true;
};

Selector.prototype.hide = function() {
  this.graphics.visible = false;
  this.targeting.visible = false;
};

Selector.prototype.targeted = function() {
  this.targeting.visible = true;
  this.timer && this.station.events.remove(this.timer);
  this.timer = this.station.events.add(3000, function() {
    this.targeting.visible = false;
  }, this);
};

Selector.prototype.update = function() {
  var station = this.station,
      graphics = this.graphics,
      targeting = this.targeting,
      rotation = this.rotation;

  // align selector to screen
  graphics.rotation = -station.rotation + global.Math.PI/8 + rotation;
  targeting.rotation = graphics.rotation;
};

Selector.prototype.destroy = function() {
  this.station = this.game = this.data = undefined;
};

module.exports = Selector;
