
var pixi = require('pixi'),
    engine = require('engine'),
    Pane = require('./Pane'),
    ProgressBar = require('./ProgressBar'),
    Layout = require('../Layout'),
    Class = engine.Class;

function HudStation(station, settings) {
  Pane.call(this, station.game, Class.mixin(settings, {
    width: 0,
    height: 0,
    layout: {
      type: 'raster'
    },
    healthBar: {
      width: 100,
      height: 3,
      progress: {
        color: 0x66ff66,
        fillAlpha: 0.5,
        // blendMode: engine.BlendMode.ADD,
        modifier: {
          left: 0.0,
          top: 0.0,
          width: 1.0,
          height: 1.0
        }
      },
      bg: {
        fillAlpha: 0.24,
        color: 0x66ff66
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

  this.station = station;
  this.visible = false;

  this.container = new Pane(this.game, this.settings.container);
  this.healthBar = new ProgressBar(this.game, this.settings.healthBar);

  this.container.addPanel(this.healthBar);

  this.addPanel(this.container);
};

HudStation.prototype = Object.create(Pane.prototype);
HudStation.prototype.constructor = HudStation;

HudStation.prototype.create = function() {
  var stats = this.station.config.stats,
      data = this.station.data;

  this.healthBar.percentage(data.health / stats.health);

  this.invalidate();

  this.pivot.set(this.cachedWidth/2, this.cachedHeight/2);
  this.position.set(this.station.width/2, this.station.height/2);

  this.station.addChild(this);
};

HudStation.prototype.show = function() {
  this.visible = true;
};

HudStation.prototype.hide = function() {
  this.visible = false;
};

HudStation.prototype.update = function() {
  var scale, inverse,
      station = this.station;
  
  // keep
  // orientation
  if(this.visible) {
    scale = this.game.world.scale.x;
    inverse = (1.0+scale)/scale;

    this.scale.set(inverse, inverse);
    this.rotation = -station.rotation;
    this.container.y = -(station.data.size/inverse+8);
  }
};

HudStation.prototype.data = function(data) {
  var stats = this.station.config.stats,
      healthBar = this.healthBar,
      energyBar = this.energyBar;
  if(this.visible) {
    data.health && healthBar.percentage('width', data.health/stats.health);
  }
};

HudStation.prototype.enable = function() {
  this.healthBar.percentage('width', 1);
  this.show();
};

HudStation.prototype.disable = function() {
  this.healthBar.percentage('width', 0);
  this.hide();
};

HudStation.prototype.destroy = function(options) {
  this.station = undefined;

  Pane.prototype.destroy.call(this, options);
};

module.exports = HudStation;
