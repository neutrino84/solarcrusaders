
var engine = require('engine');

function Selector(ship) {
  this.ship = ship;
  this.game = ship.game;
  this.manager = ship.manager;
  this.data = ship.data;
  this.point = new engine.Point();
};

Selector.prototype.constructor = Selector;

Selector.prototype.create = function() {
  var ship = this.ship,
      point = this.point,
      radius = ship.data.size,
      color, alpha, thickness, fill,
      friendly;

  // configure
  switch(ship.data.ai) {
    case 'basic':
      color = 0xffff00;
      alpha = 0.0;
      thickness = 8.0;
      fill = 0.0;
      friendly = true;
      break;
    case 'pirate':
      color = 0xcc3333;
      alpha = 0.6;
      thickness = 4.0;
      fill = 0.2;
      friendly = false;
      break;
  }

  if(ship.isPlayer || ship.isPlayerOwned) {
    color = 0x0066ff;
    alpha = 0.8;
    thickness = 8.0;
    fill = 0.2;
  }

  // create circle areas
  this.inner = new engine.Circle(0, 0, radius);
  this.hit = new engine.Circle(0, 0, radius * 1.34);
  
  // create basic graphics
  this.graphics = new engine.Graphics();
  this.graphics.lineStyle(thickness, color, 1.0);
  this.graphics.beginFill(color, fill);
  this.graphics.drawCircle(this.hit.x, this.hit.y, this.hit.radius);
  this.graphics.endFill();
  if(friendly && !ship.isPlayer && !ship.isPlayerOwned) {
    this.hit.circumferencePoint(45, true, true, this.point);
    this.graphics.moveTo(this.point.x, this.point.y);
    this.hit.circumferencePoint(225, true, true, this.point);
    this.graphics.lineTo(this.point.x, this.point.y);
    this.hit.circumferencePoint(135, true, true, this.point);
    this.graphics.moveTo(this.point.x, this.point.y);
    this.hit.circumferencePoint(315, true, true, this.point);
    this.graphics.lineTo(this.point.x, this.point.y);
  }
  // this.graphics.pivot.set(0, 0);
  this.graphics.position.set(this.ship.width/2, this.ship.height/2);
  this.graphics.blendMode = engine.BlendMode.ADD;
  this.graphics.alpha = alpha;

  // add target
  if(ship.data.ai === 'pirate') {
    this.target = new engine.Graphics();
    this.target.lineStyle(10.0, color, 1.0);
    this.target.beginFill(color, fill);
    this.target.drawCircle(this.hit.x, this.hit.y, this.hit.radius);
    this.target.endFill();
    this.hit.circumferencePoint(45, true, true, this.point);
    this.target.moveTo(this.point.x, this.point.y);
    this.inner.circumferencePoint(45, true, true, this.point);
    this.target.lineTo(this.point.x, this.point.y);
    this.hit.circumferencePoint(225, true, true, this.point);
    this.target.moveTo(this.point.x, this.point.y);
    this.inner.circumferencePoint(225, true, true, this.point);
    this.target.lineTo(this.point.x, this.point.y);
    this.hit.circumferencePoint(135, true, true, this.point);
    this.target.moveTo(this.point.x, this.point.y);
    this.inner.circumferencePoint(135, true, true, this.point);
    this.target.lineTo(this.point.x, this.point.y);
    this.hit.circumferencePoint(315, true, true, this.point);
    this.target.moveTo(this.point.x, this.point.y);
    this.inner.circumferencePoint(315, true, true, this.point);
    this.target.lineTo(this.point.x, this.point.y);
    this.target.position.set(this.ship.width/2, this.ship.height/2);
    this.target.blendMode = engine.BlendMode.ADD;
    this.target.visible = false;
    this.ship.addChild(this.target);
  }

  // add selector
  this.ship.addChildAt(this.graphics, friendly ? undefined : 0);
};

Selector.prototype.enable = function() {
  this.graphics.visible = true;
};

Selector.prototype.disable = function() {
  this.graphics.visible = false;

  if(this.target) {
    this.target.visible = false;
  }
};

Selector.prototype.targeted = function() {
  if(this.target) {
    this.target.visible = true;
    this.timer && this.ship.events.remove(this.timer);
    this.timer = this.ship.events.add(5000, function() {
      this.target.visible = false;
    }, this);
  }
};

Selector.prototype.warn = function() {
  // reset
  this.graphics.alpha = 0.0;

  // animation
  if(!this.tween || this.tween && !this.tween.isRunning) {
    this.tween = this.game.tweens.create(this.graphics);
    this.tween.to({ alpha: 0.25 }, 250, engine.Easing.Quadratic.Out, false, 0, 2, true);
    this.tween.start();
  }
};

Selector.prototype.update = function() {
  var graphics = this.graphics,
      target = this.target,
      ship = this.ship;
  if(ship.data.ai === 'pirate') {
    this.target.rotation += 0.1;
  } else {
    this.graphics.rotation = -this.ship.rotation;
  }
};

Selector.prototype.destroy = function() {
  this.ship = this.game = this.manager =
    this.data = undefined;
};

module.exports = Selector;
