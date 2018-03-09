
var engine = require('engine');

function Selector(ship) {
  this.ship = ship;
  this.game = ship.game;
  this.data = ship.data;

  this.rotation = 0;
  this.targeting = new engine.Graphics();
  this.graphics = new engine.Graphics();
};

Selector.prototype.constructor = Selector;

Selector.prototype.create = function() {
  var ship = this.ship,
      graphics = this.graphics,
      targeting = this.targeting,
      pi = global.Math.PI,
      size = ship.data.size,
      color, alpha, thickness,
      x, y, start, end, length, target;

  // set colors
  if(ship.isPirate) {
    color = 0xff3333;
    alpha = 0.4;
    thickness = 6.0;
    target = 0xff0000;
  } else if(ship.isPlayer) {
    color = 0x3366ff;
    alpha = 1.0;
    thickness = 8.0;
    target = 0x0033ff;
  } else if(ship.isPlayerOwned) {
    color = 0x3366ff;
    alpha = 1.0;
    thickness = 6.0;
    target = 0x0033ff;
  } else {
    color = 0xffffff;
    alpha = 0.2;
    thickness = 4.0;
    target = 0x33ff33;
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
  graphics.position.set(ship.width/2, ship.height/2);
  graphics.blendMode = engine.BlendMode.ADD;
  graphics.visible = false;

  targeting.position.set(ship.width/2, ship.height/2);
  targeting.blendMode = engine.BlendMode.ADD;
  targeting.visible = false;

  // add selector graphics
  ship.addChild(graphics);
  ship.addChild(targeting);
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
  this.timer && this.ship.events.remove(this.timer);
  this.timer = this.ship.events.add(3000, function() {
    this.targeting.visible = false;
  }, this);
};

Selector.prototype.update = function() {
  var ship = this.ship,
      graphics = this.graphics,
      targeting = this.targeting,
      rotation = this.rotation;

  // align selector to screen
  graphics.rotation = -ship.rotation + global.Math.PI/8 + rotation;
  targeting.rotation = graphics.rotation;

  // if(ship.isPlayer || ship.isPlayerOwned) {
  //   this.rotation += 0.05;
  // }
};

Selector.prototype.destroy = function() {
  this.ship = this.game = this.data = undefined;
};

module.exports = Selector;
