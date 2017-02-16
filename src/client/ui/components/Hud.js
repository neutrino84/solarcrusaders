
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
      height: 2,
      progress: {
        color: 0x99ee99,
        fillAlpha: 0.64,
        blendMode: engine.BlendMode.ADD,
        modifier: {
          left: 1.0,
          top: 1.0,
          width: 0.0,
          height: 1.0
        }
      },
      bg: {
        fillAlpha: 0.2,
        color: 0x000000,
        blendMode: engine.BlendMode.MULTIPLY
      }
    },
    energyBar: {
      width: 80,
      height: 2,
      progress: {
        color: 0xffff66,
        fillAlpha: 0.64,
        blendMode: engine.BlendMode.ADD,
        modifier: {
          left: 1.0,
          top: 1.0,
          width: 0.0,
          height: 1.0
        }
      },
      bg: {
        fillAlpha: 0.2,
        color: 0x000000,
        blendMode: engine.BlendMode.MULTIPLY
      }
    },
    container: {
      constraint: Layout.CENTER,
      layout: {
        type: 'flow',
        ax: Layout.CENTER, 
        ay: Layout.TOP,
        direction: Layout.VERTICAL, 
        gap: 2
      },
      bg: false
    }
  }));

  this.ship = ship;

  this.container = new Pane(this.game, this.settings.container);
  this.energyBar = new ProgressBar(this.game, this.settings.energyBar);
  this.healthBar = new ProgressBar(this.game, this.settings.healthBar);

  this.container.addPanel(this.energyBar);
  this.container.addPanel(this.healthBar);
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

  this.ship.addChild(this);
};

Hud.prototype.update = function() {
  var scale = this.game.world.scale.x,
      inverse = 1/scale;

  this.container.y = -this.ship.details.size/4;
  this.scale.set(inverse + scale, inverse + scale);
  this.rotation = -this.parent.rotation;
};

Hud.prototype.refresh = function(data) {
  var stats = this.ship.config.stats,
      healthBar = this.healthBar,
      energyBar = this.energyBar;

  data.health && healthBar.change('width', global.Math.min(1.0, data.health / stats.health));
  data.energy && energyBar.change('width', global.Math.min(1.0, data.energy / stats.energy));
};

// Hud.prototype.updateTransform = function() {
//   this.transform.updateTransform(this.parent.transform);
//   this.worldAlpha = this.alpha * this.parent.worldAlpha;
//   this._bounds.updateID++;
// };

// Hud.prototype._enabled = function(data) {
//   if(this.data && data.uuid === this.data.uuid) {
//     this.healthBar.setProgressBar(1);
//     this.energyBar.setProgressBar(1);
//   }
// };

// Hud.prototype._disabled = function(data) {
//   if(this.data && data.uuid === this.data.uuid) {
//     this.healthBar.setProgressBar(0);
//     this.energyBar.setProgressBar(0);
//   }
// };

Hud.prototype.destroy = function(options) {
  Pane.prototype.destroy.call(this, options);

  this.username = this.game = this.ship =
    this.layout = this.settings = undefined;
};

module.exports = Hud;
