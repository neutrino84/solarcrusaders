
var pixi = require('pixi'),
    engine = require('engine'),
    Pane = require('./Pane'),
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
      width: ship.data.size * 0.66,
      height: ship.data.size < 52 ? 1 : 2,
      progress: {
        color: 0x66ff66,
        fillAlpha: 0.5,
        modifier: {
          left: 0.0,
          top: 0.0,
          width: 1.0,
          height: 1.0
        }
      },
      bg: {
        fillAlpha: 0.10,
        color: 0x66ff66
      }
    },
    energyBar: {
      width: ship.data.size * 0.66,
      height: 1,
      progress: {
        color: 0xffff66,
        fillAlpha: 0.5,
        modifier: {
          left: 0.0,
          top: 0.0,
          width: 1.0,
          height: 1.0
        }
      },
      bg: {
        fillAlpha: 0.10,
        color: 0xffff66
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
  this.visible = false;

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
  var stats = this.ship.config.stats,
      data = this.ship.data;

  this.healthBar.percentage(data.health / stats.health);
  this.energyBar.percentage(data.energy / stats.energy);

  this.invalidate();

  this.pivot.set(this.cachedWidth/2, this.cachedHeight/2);
  this.position.set(this.ship.width/2, this.ship.height/2);

  this.ship.addChild(this);
};

Hud.prototype.show = function() {
  this.visible = true;
};

Hud.prototype.hide = function() {
  this.visible = false;
};

Hud.prototype.update = function() {
  var scale, inverse,
      ship = this.ship;
  if(this.visible) {
    scale = this.game.world.scale.x;
    inverse = (1.0+scale)/scale;

    this.scale.set(inverse, inverse);
    this.rotation = -ship.rotation;
    this.container.y = -((ship.data.size*1.5)/inverse+4);
  }
};

Hud.prototype.data = function(data) {
  var ship = this.ship,
      healthBar = this.healthBar,
      energyBar = this.energyBar,
      stats = ship.config.stats;
  if(this.visible) {
    data.health && healthBar.percentage('width', data.health / stats.health);
    data.energy && energyBar.percentage('width', data.energy / stats.energy);
  }
};

Hud.prototype.enable = function() {
  this.healthBar.percentage('width', 1.0);
  this.energyBar.percentage('width', 1.0);
};

Hud.prototype.disable = function() {
  this.healthBar.percentage('width', 0.0);
  this.energyBar.percentage('width', 0.0);
};

Hud.prototype.destroy = function(options) {
  this.ship = undefined;

  Pane.prototype.destroy.call(this, options);
};

module.exports = Hud;
