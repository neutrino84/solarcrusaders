
var engine = require('engine'),
    TextView = require('../../../ui/views/TextView'),
    Movement = require('../Movement'),
    // Trails = require('./Trails'),
    EngineCore = require('./EngineCore'),
    ShieldGenerator = require('./ShieldGenerator'),
    TargetingComputer = require('./TargetingComputer'),
    Damage = require('./Damage');

function Ship(manager, key) {
  engine.Sprite.call(this, manager.game, 'ship-atlas', key + '.png');

  this.name = key;
  this.target = null;
  this.manager = manager;
  this.game = manager.game;
  this.config = manager.game.cache.getJSON('ship-configuration', false)[key];

  this.throttle = 0.0; // get from server
  this.rotation = 0.0; // get from server
  this.position = new engine.Point(); // get from server
  
  this.pivot.set(this.texture.frame.width / 2, this.texture.frame.height / 2);
  this.scale.set(this.config.size, this.config.size);

  this.damage = new Damage(this);
  this.movement = new Movement(this);
  this.circle = new engine.Circle(this.pivot.x, this.pivot.y, global.Math.sqrt(this.getBounds().perimeter * 3));

  this._selected = false;

  // activate culling
  this.autoCull = true;
  this.checkWorldBounds = true;

  // core ship classes
  // this.trails = new Trails(this);
  this.engineCore = new EngineCore(this);
  this.targetingComputer = new TargetingComputer(this, this.config.targeting);
  this.shieldGenerator = new ShieldGenerator(this);
  
  // selection graphic
  this.graphics = new engine.Graphics(manager.game);
  this.graphics.blendMode = engine.BlendMode.ADD;
  this.addChild(this.graphics);
}

Ship.prototype = Object.create(engine.Sprite.prototype);
Ship.prototype.constructor = Ship;

Ship.prototype.boot = function() {
  // this.trails.create();
  this.engineCore.create();
  this.targetingComputer.create();

  // if(this.name === 'vessel-x01') {
  //   this.shieldGenerator.create();
  // }

  if(this.username) {
    this.label = new TextView(this.game, this.username, { fontName: 'medium' });
    this.label.tint = this.isPlayer ? 0x33FF33 : 0x3399FF;
    this.labelsGroup = this.manager.labelsGroup;
    this.labelsGroup.addChild(this.label);
  }

  this.deselect();
};

Ship.prototype.update = function() {
  var speed, transform,
      movement = this.movement;

  // update position
  movement.update();

  if(this.renderable && !this.disabled) {
    if(this.label) {
      transform = this.game.world.worldTransform.apply(this.position);
      this.label.pivot.set(this.label.width / 2, -this.height / 2 * this.game.world.scale.x - 12);
      this.label.position.set(transform.x, transform.y);
    }

    speed = movement.speed;

    // this.trails.update(); // performance killer
    this.targetingComputer.update();

    if(speed > 0) {
      this.engineCore.update(speed / movement.maxSpeed);
    }
  }
};

Ship.prototype.select = function() {
  this._selected = true;
  this.graphics.clear();
  this.graphics.lineStyle(3.0 / this.scale.x, this.isPlayer ? 0x33FF66 : 0x336699, this.isPlayer ? 0.6 : 0.5);
  this.graphics.beginFill(this.isPlayer ? 0x33FF66 : 0x336699, 0.25);
  this.graphics.drawCircle(this.pivot.x, this.pivot.y, this.width / this.scale.x / 1.8); //(0, 0, this.width / this.scale.x, this.height / this.scale.y);
  this.graphics.endFill();
};

Ship.prototype.deselect = function() {
  this._selected = false;
  this.graphics.clear();

  if(this.isPlayer) {
    this.graphics.lineStyle(2.0 / this.scale.x, 0x33FF66, 0.4);
    this.graphics.beginFill(0x33FF66, 0.1);
    this.graphics.drawCircle(this.pivot.x, this.pivot.y, this.width / this.scale.x / 1.8);
    this.graphics.endFill();
  }
};

Ship.prototype.destroy = function() {
  this.manager = undefined;
  this.game = undefined;
  this.config = undefined;
  this.movement = undefined;
  this.circle = undefined;

  if(this.label) {
    this.label.destroy();
  }

  this.damage.destroy();

  engine.Sprite.prototype.destroy.call(this);
};

Object.defineProperty(Ship.prototype, 'isPlayer', {
  get: function() {
    return this.user && this.game.auth.user.uuid === this.user;
  }
});

Object.defineProperty(Ship.prototype, 'selected', {
  get: function() {
    return this._selected;
  }
});

Object.defineProperty(Ship.prototype, 'trajectoryGraphics', {
  set: function(value) {
    this.movement.trajectoryGraphics = value;
  },

  get: function() {
    return this.movement.trajectoryGraphics;
  }
});

module.exports = Ship;
