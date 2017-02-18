
var pixi = require('pixi'),
    engine = require('engine'),
    Pane = require('./Pane'),
    Label = require('./Label'),
    ProgressBar = require('./ProgressBar'),
    Layout = require('../Layout'),
    Class = engine.Class;

function Hud(ship, settings) {
  Pane.call(this, ship.game, Class.mixin(settings, {
    width: 0,
    height: 0,
    layout: {
      type: 'raster'
    },
    healthBar: {
      width: 80,
      height: 3,
      progress: {
        color: 0x66ff66,
        fillAlpha: 0.68,
        blendMode: engine.BlendMode.ADD,
        modifier: {
          left: 0.0,
          top: 0.0,
          width: 1.0,
          height: 1.0
        }
      },
      bg: {
        fillAlpha: 0.5,
        color: 0x000000
      }
    },
    energyBar: {
      width: 80,
      height: 2,
      progress: {
        color: 0xffff66,
        fillAlpha: 0.68,
        blendMode: engine.BlendMode.ADD,
        modifier: {
          left: 0.0,
          top: 0.0,
          width: 1.0,
          height: 1.0
        }
      },
      bg: {
        fillAlpha: 0.5,
        color: 0x000000
      }
    },
    container: {
      constraint: Layout.CENTER,
      layout: {
        type: 'flow',
        ax: Layout.CENTER, 
        ay: Layout.TOP,
        direction: Layout.VERTICAL, 
        gap: 1
      },
      bg: false
    }
  }));

  this.ship = ship;

  this.container = new Pane(this.game, this.settings.container);
  this.energyBar = new ProgressBar(this.game, this.settings.energyBar);
  this.healthBar = new ProgressBar(this.game, this.settings.healthBar);

  this.container.addPanel(this.healthBar);
  this.container.addPanel(this.energyBar);
  this.addPanel(this.container);
};

Hud.prototype = Object.create(Pane.prototype);
Hud.prototype.constructor = Hud;

Hud.prototype.create = function() {
  var game = this.game,
      ship = this.ship,
      stats = ship.config.stats,
      details = ship.details;

  this.ship = ship;

  this.data && this.data.removeListener('data', this.refresh, this);
  this.data = ship.details;
  this.data.on('data', this.refresh, this);

  this.healthBar.change(global.Math.min(1.0, details.health / stats.health));
  this.energyBar.change(global.Math.min(1.0, details.energy / stats.energy));

  this.invalidate();
  this.refresh(this.data);

  this.pivot.set(this.cachedWidth/2, this.cachedHeight/2);
  this.position.set(ship.width/2, ship.height/2);

  // ate hit area
  // this.targetGraphics = new engine.Graphics();
  // this.targetGraphics.lineStyle(2, 0x994433, 1.0);
  // this.targetGraphics.drawRect(-64, -64, 64, 64);
  // this.targetGraphics.pivot.set(-32, -32);
  // this.targetGraphics.position.set(0, 0);
  // this.targetGraphics.rotation = 0.785398;
  // this.targetGraphics.blendMode = engine.BlendMode.ADD;
  // this.addChild(this.targetGraphics);

  this.alpha = 0;
  this.visible = false;

  this.ship.addChild(this);
};

Hud.prototype.show = function() {
  if(!this.visible) {
    this.alpha = 0.0;
    this.visible = true;
    this.animating && this.animating.stop(false);
    this.animating = this.game.tweens.create(this);
    this.animating.to({ alpha: 1.0 }, 250);
    this.animating.start();
  }
};

Hud.prototype.hide = function() {
  if(this.visible) {
    this.animating && this.animating.stop(false);
    this.animating = this.game.tweens.create(this);
    this.animating.to({ alpha: 0.0 }, 250);
    this.animating.on('complete', function() {
      if(!this.isPlayer) {
        this.visible = false;
      }
    }, this);
    this.animating.start();
  }
};

Hud.prototype.update = function() {
  var scale = this.game.world.scale.x,
      inverse = 1/scale;
  if(this.visible) {
    this.container.y = -this.ship.details.size/4;
    this.scale.set(inverse + scale, inverse + scale);
    this.rotation = -this.parent.rotation;
  }
};

Hud.prototype.refresh = function(data) {
  var stats = this.ship.config.stats,
      healthBar = this.healthBar,
      energyBar = this.energyBar;
  if(this.visible) {
    data.health && healthBar.change('width', global.Math.min(1.0, data.health / stats.health));
    data.energy && energyBar.change('width', global.Math.min(1.0, data.energy / stats.energy));
  }
};

Hud.prototype.enable = function() {
  this.healthBar.change('width', 1);
  this.energyBar.change('width', 1);
};

Hud.prototype.disable = function() {
  this.healthBar.change('width', 0);
  this.energyBar.change('width', 0);
};

Hud.prototype.destroy = function(options) {
  Pane.prototype.destroy.call(this, options);

  this.username = this.game = this.ship =
    this.layout = this.settings = undefined;
};

module.exports = Hud;
