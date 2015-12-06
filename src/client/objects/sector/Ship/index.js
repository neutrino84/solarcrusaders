
var engine = require('engine'),
    TextView = require('../../../ui/views/TextView'),
    Movement = require('../Movement'),
    // Trails = require('./Trails'),
    EngineCore = require('./EngineCore'),
    ShieldGenerator = require('./ShieldGenerator'),
    TargetingComputer = require('./TargetingComputer');

    // ExplosionEmitter = require('../emitters/ExplosionEmitter'),
    // ShockwaveEmitter = require('../emitters/ShockwaveEmitter');

function Ship(manager, key) {
  engine.Sprite.call(this, manager.game, 'ship-atlas');

  this.name = key;
  this.manager = manager;
  this.game = manager.game;
  this.config = manager.game.cache.getJSON('ship-configuration', false)[key];

  this.frame = this.name + '.png';

  this.throttle = 0.0; // get from server
  this.rotation = 0.0; // get from server
  this.position = new engine.Point(); // get from server
  
  this.pivot.set(this.texture.frame.width / 2, this.texture.frame.height / 2);
  this.scale.set(this.config.size, this.config.size);

  this.movement = new Movement(this);
  this.circle = new engine.Circle(this.pivot.x, this.pivot.y, global.Math.sqrt(this.getBounds().perimeter * 3));

  this._selected = false;
  this._hull = 100;

  // input activation
  // this.inputEnabled = true;
  // this.input.priorityID = 1;

  // activate culling
  // this.autoCull = true;
  // this.checkWorldBounds = true;

  // core ship classes
  // this.trails = new Trails(this);
  this.engineCore = new EngineCore(this);
  this.targetingComputer = new TargetingComputer(this, this.config.targeting);
  this.shieldGenerator = new ShieldGenerator(this);
  
  // selection graphic
  this.graphics = new engine.Graphics(manager.game);
  this.graphics.blendMode = engine.BlendMode.ADD;
  this.addChild(this.graphics);

  // explosions
  // this.shockwaveEmitter = new ShockwaveEmitter(manager.game);

  // this.explosionEmitter = new ExplosionEmitter(manager.game);
  // this.explosionEmitter.setScale(0.5, 2.0, 0.5, 2.0, 3000);
  // this.explosionEmitter.setAlpha(1.0, 0.0, 3000);

  // this.explosionEmitter2 = new ExplosionEmitter(manager.game);
  // this.explosionEmitter2.setScale(0.0, 0.5, 0.0, 0.5, 1500);
  // this.explosionEmitter2.setAlpha(1.0, 0.0, 1500);

  // manager.game.particles.add(this.explosionEmitter);
  // manager.game.particles.add(this.explosionEmitter2);
  // manager.game.particles.add(this.shockwaveEmitter);
  // manager.game.world.add(this.explosionEmitter);
  // manager.game.world.add(this.explosionEmitter2);
  // manager.game.world.add(this.shockwaveEmitter);

  // event handling
  // this.on('inputOver', this._inputOver, this);
  // this.on('inputOut', this._inputOut, this);
  // this.on('inputDown', this._inputDown, this);
  // this.on('inputUp', this._inputUp, this);
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
    this.label = new TextView(this.game, this.username);
    this.label.pivot.set(this.label.width / 2, -this.height / 2 - 12);
    this.label.tint = this.isPlayer ? 0x33FF33 : 0x3399FF;
    this.fxGroup.addChild(this.label);
  }

  this.deselect();
};

Ship.prototype.update = function() {
  var speed,
      movement = this.movement;

  // update position
  movement.update();

  if(this.renderable && !this.disabled) {
    if(this.label) {
      this.label.position.set(this.x, this.y);
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

Ship.prototype.damage = function(position) {
  if(this.isPlayer || this.health <= 0) { return; }
  
  var point, game = this.game,
      rotation = global.Math.random() * global.Math.PI,
      scale = global.Math.random() * 0.5 + 0.25,
      damage = new engine.Sprite(this.game, 'damage-a');


  damage.pivot.set(32, 32);
  damage.position.set(this.pivot.x - position.x, this.pivot.y - position.y);
  damage.scale.set(scale, scale);
  damage.rotation = rotation;

  this.health -= global.Math.random() * 10;

  if(this.health <= 0) {

    game.clock.events.repeat(25, 50, function() {
      var r = global.Math.random;

      if(r() < 0.75) { return; }

      point = game.world.worldTransform.applyInverse(this.worldTransform.apply(this.circle.random()));

      this.explosionEmitter2.setTint(0x333333, 0x666666, 500);
      this.explosionEmitter2.at({ center: point });
      this.explosionEmitter2.explode(2);
    }, this);

    game.clock.events.repeat(50, 20, function() {
      var r = global.Math.random;

      point = game.world.worldTransform.applyInverse(this.worldTransform.apply(this.circle.random()));

      this.explosionEmitter.setTint(0xFF6666, r() > 0.75 ? 0x666666 : 0x000000, 500);
      this.explosionEmitter.at({ center: point });
      this.explosionEmitter.explode(1);

    }, this);

    game.clock.events.add(2000, function() {
      this.disabled = true;
      this.tint = 0x181818;

      // this.shockwaveEmitter.setScale(0.25, 5.0, 0.25, 5.0, 5000);
      // this.shockwaveEmitter.setAlpha(1.0, 0.0, 5000);
      // this.shockwaveEmitter.at({ center: this.position });
      // this.shockwaveEmitter.explode(8);

      for(var i in this.children) {
        this.children[i].tint = 0x181818;
      }

      this.manager.game.clock.events.remove(this.autoPilotTimer);
      this.movement.throttle *= 10.0;
      this.movement.plot(this._generateRandomPositionInView());

    }, this);

    this.tint = 0x666666;
    for(var i in this.children) {
      this.children[i].tint = 0x666666;
    }

    this.disabled = true;

    return;
  }

  this.addChild(damage);
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
