
var engine = require('engine'),
    Movement = require('../Movement'),
    Repair = require('./Repair'),
    EngineCore = require('./EngineCore'),
    TargetingComputer = require('./TargetingComputer'),
    ShieldGenerator = require('./ShieldGenerator'),
    Damage = require('./Damage'),
    Hud = require('../../../ui/components/Hud');

function Ship(manager, details) {
  engine.Sprite.call(this, manager.game, 'texture-atlas', details.chassis + '.png');

  this.name = details.name;
  this.manager = manager;
  this.details = details;
  
  this.config = details.config.ship;

  // layer chassis
  this.rotation = 0; //details.rotation;
  this.chassis = new engine.Sprite(manager.game, 'texture-atlas', details.chassis + '.png');
  this.pivot.set(this.width / 2, this.width / 2);

  // timer events
  this.events = new engine.Timer(this.game, false);

  // core ship classes
  this.hud = new Hud(this);
  this.damage = new Damage(this);
  this.movement = new Movement(this);
  this.engineCore = new EngineCore(this, this.config.engine);
  this.targetingComputer = new TargetingComputer(this, this.config.targeting);
  this.shieldGenerator = new ShieldGenerator(this, this.config.shields);
  this.repair = new Repair(this);
}

Ship.prototype = Object.create(engine.Sprite.prototype);
Ship.prototype.constructor = Ship;

Ship.prototype.boot = function() {
  // create hit area
  this.hit = new engine.Circle(this.width / 2, this.width / 2, this.details.size);
  this.hitGraphics = new engine.Graphics();
  this.hitGraphics.lineStyle(4, this.details.ai && this.details.ai === 'pirate' ? 0xcc3333 : 0x3366cc, 0.25);
  // this.hitGraphics.drawCircle(this.hit.x, this.hit.y, this.hit.radius);
  this.hitGraphics.drawRect(0, 0, this.width, this.height);
  this.hitGraphics.pivot.set(this.width/2, this.height/2);
  this.hitGraphics.position.set(this.width/2 + 4, this.width/2 + 4);
  this.hitGraphics.scale.set(2.0, 2.0);
  this.hitGraphics.blendMode = engine.BlendMode.ADD;
  this.hitGraphics.alpha = 0;

  // add hit circle
  this.addChild(this.hitGraphics);

  // add chassis
  this.addChild(this.chassis);

  this.engineCore.create();
  this.targetingComputer.create();
  this.shieldGenerator.create();
  this.repair.create();
  this.hud.create();

  this.details.on('data', this.data, this);

  this.events.start();

  // set player
  if(this.isPlayer) {
    this.game.emit('ship/player', this);
    this.hud.show();
  }
};

Ship.prototype.data = function(data) {
  if(data.hardpoint) {
    // update targeting computer
    this.targetingComputer.hit(data.hardpoint);
  }
  if(data.health) {
    if(data.damage > 0) {
      if(!this.isPlayer) { this.hud.show(); }

      this.hitGraphics.alpha = 1.0;

      this.hitTimer && this.events.remove(this.hitTimer);
      this.hitTimer = this.events.add(5000, function() {
        if(!this.isPlayer) { this.hud.hide(); }

        this.hitGraphicsTween && this.hitGraphicsTween.stop(false);
        this.hitGraphics.alpha = 1.0;
        this.hitGraphicsTween = this.game.tweens.create(this.hitGraphics);
        this.hitGraphicsTween.to({ alpha: 0.0 }, 1000);
        this.hitGraphicsTween.start();
      }, this);
    }
  }
};

Ship.prototype.update = function() {
  this.events.update(this.game.clock.time);
  this.movement.update();
  this.targetingComputer.update();
  
  // update disabled state
  if(this.disabled){
    this.damage.update(this.movement.velocity / this.details.speed);
    this.engineCore.update(0);
  } else {
    this.engineCore.update(this.movement.velocity / this.details.speed);
  }

  // update hit graphics
  this.hitGraphics.rotation = -this.rotation + 0.785398;// + (this.game.clock.frames * 10);
  
  // update ui
  this.hud.update();

  engine.Sprite.prototype.update.call(this);
};

Ship.prototype.enable = function(data) {
  this.disabled = false;
  this.tint = 0xFFFFFF;
  this.chassis.visible = true;
  this.hud.enable();
  this.engineCore.show(true);
  this.position.set(data.pos.x, data.pos.y);
};

Ship.prototype.disable = function() {
  this.disabled = true;
  this.tint = 0x333333;
  this.chassis.visible = false;
  this.hud.disable();
  this.damage.destroyed();
  this.engineCore.show(false);
  this.shieldGenerator.stop();
  this.repair.stop();
}

Ship.prototype.destroy = function() {
  this.events.destroy();

  this.hud.destroy();
  this.damage.destroy();
  this.movement.destroy();
  this.engineCore.destroy();
  this.targetingComputer.destroy();
  this.repair.destroy();

  this.details.removeListener('data', this.data);

  // children destroy themselves
  engine.Sprite.prototype.destroy.call(this);

  this.manager = this.config =
    this.movement = this.circle = this.hud =
    this.damage = this.details = this.targetingComputer =
    this.repair = this.engineCore = undefined;
};

Object.defineProperty(Ship.prototype, 'isPlayer', {
  get: function() {
    return this.user !== undefined && this.game.auth.user.uuid === this.user;
  }
});

module.exports = Ship;
