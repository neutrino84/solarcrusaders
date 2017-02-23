
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
        fillAlpha: 0.68,
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
        fillAlpha: 0.68,
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

  this.healthBar.percentage(details.health / stats.health);
  this.energyBar.percentage(details.energy / stats.energy);

  this.invalidate();

  this.pivot.set(this.cachedWidth/2, this.cachedHeight/2);
  this.position.set(this.ship.width/2, this.ship.height/2);

  this.visible = false;
  this.alpha = 0.0;

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
        this.alpha = 0.0;
      }
    }, this);
    this.animating.start();
  }
};

Hud.prototype.update = function() {
  var scale, inverse;
  
  if(this.visible) {
    scale = this.game.world.scale.x
    inverse = 1/scale;

    this.container.y = -this.ship.details.size/4;
    this.scale.set(inverse + scale, inverse + scale);
    this.rotation = -this.parent.rotation;
  }
};

Hud.prototype.data = function(data) {
  var stats = this.ship.config.stats,
      healthBar = this.healthBar,
      energyBar = this.energyBar;
  if(this.visible) {
    data.health && healthBar.change('width', data.health / stats.health);
    data.energy && energyBar.change('width', data.energy / stats.energy);
  }
};

Hud.prototype.enable = function() {
  this.healthBar.percentage('width', 1);
  this.energyBar.percentage('width', 1);
  this.show();
};

Hud.prototype.disable = function() {
  this.healthBar.percentage('width', 0);
  this.energyBar.percentage('width', 0);
  this.hide();
};

Hud.prototype.destroy = function(options) {
  Pane.prototype.destroy.call(this, options);

  this.username = this.game = this.ship =
    this.layout = this.settings = undefined;
};

module.exports = Hud;
