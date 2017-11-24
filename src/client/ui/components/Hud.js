
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
        fillAlpha: 0.5,
        blendMode: engine.BlendMode.ADD,
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
    energyBar: {
      width: 80,
      height: 2,
      progress: {
        color: 0xffff66,
        fillAlpha: 0.5,
        blendMode: engine.BlendMode.ADD,
        modifier: {
          left: 0.0,
          top: 0.0,
          width: 1.0,
          height: 1.0
        }
      },
      bg: {
        fillAlpha: 0.24,
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

  this.container = new Pane(this.game, this.settings.container);
  this.energyBar = new ProgressBar(this.game, this.settings.energyBar);
  this.healthBar = new ProgressBar(this.game, this.settings.healthBar);
  this.scoreContainer = new Pane(this.game, {
      width: 12,
      height: 1,
      constraint: Layout.CENTER,
      layout: {
        type: 'flow',
        ax: Layout.CENTER, 
        ay: Layout.TOP,
        direction: Layout.VERTICAL, 
        gap: 0
      },
      bg: false
    });
  
  this.gains = {};
  this.gainTimers = {};
  this.lossTimer;

  this.container.addPanel(this.healthBar);
  this.container.addPanel(this.energyBar);

  // this.scoreContainer.addPanel(this.score)
  this.container.addPanel(this.scoreContainer)

  this.addPanel(this.container);
};

Hud.prototype = Object.create(Pane.prototype);
Hud.prototype.constructor = Hud;

Hud.prototype.create = function() {
  var game = this.game,
      ship = this.ship,
      stats = ship.config.stats,
      data = ship.data;

  this.ship = ship;

  this.healthBar.percentage(data.health / stats.health);
  this.energyBar.percentage(data.energy / stats.energy);

  this.invalidate();

  this.pivot.set(this.cachedWidth/2, this.cachedHeight/2);  
  this.position.set(this.ship.width/2, this.ship.height/2);

  this.visible = false;
  this.alpha = 0.0;

  this.ship.addChild(this);
};

Hud.prototype.show = function() {
  console.log('show')
  this.visible = true;
  this.healthBar.visible = true;
  this.energyBar.visible = true;
  this.animating && this.animating.isRunning && this.animating.stop(false);
  this.animating = this.game.tweens.create(this);
  this.animating.to({ alpha: 1.0 }, 250);
  this.animating.on('complete', this.update, this);
  this.animating.start();
};

Hud.prototype.showCreditLoss = function() {

  this.visible = true;

  this.loss = new Label(this.game, {
        constraint: Layout.USE_PS_SIZE,
        align: 'center',
        text: {
          fontName: 'full'
        },
        bg: false
      });

  this.loss.tint = 0xff0000;
  this.loss.text = this.ship.data.credits;
  this.loss.visible = true;

  this.scoreContainer.addPanel(this.loss)

  this.lossTimer = this.game.clock.events.loop(100, function(){
    this.loss.y -= 1
    this.loss.alpha -= .033
    if(this.loss.y <= -28){
        this.loss.alpha = 0;
        this.loss.y = 0;
        this.loss.visible = false;
        this.healthBar.visible = true;
        this.energyBar.visible = true;
        this.visible = false;
        this.scoreContainer.removePanel(this.loss)
        this.game.clock.events.remove(this.lossTimer)
    };
  }, this);
};

Hud.prototype.showCreditGain = function(credits, uuid) {
  if(this.gains[uuid]){
    this.gains[uuid] = null;
  } 

  this.gains[uuid] = new Label(this.game, {
        constraint: Layout.USE_PS_SIZE,
        align: 'center',
        text: {
          fontName: 'full'
        },
        bg: false
      });

  this.gains[uuid].tint = 0x32CD32;
  this.gains[uuid].text = credits;
  this.gains[uuid].visible = true;

  this.scoreContainer.addPanel(this.gains[uuid])

  this.visible = true;
  this.alpha = 1;
  this.healthBar.visible = false;
  this.energyBar.visible = false;

  this.gainTimers[uuid] && this.game.clock.events.remove(this.gainTimers[uuid])

  this.gainTimers[uuid] = this.game.clock.events.loop(100, function(){
    this.gains[uuid].y -= 1
    this.gains[uuid].alpha -= .033
    if(this.gains[uuid].y <= -28){
        this.gains[uuid].alpha = 0;
        this.gains[uuid].visible = false;
        this.healthBar.visible = true;
        this.energyBar.visible = true;
        this.visible = false;
        this.gains[uuid].destroy();
        this.game.clock.events.remove(this.gainTimers[uuid])
    };
  }, this);
};

Hud.prototype.hide = function() {
  this.animating && this.animating.isRunning && this.animating.stop(false);
  this.animating = this.game.tweens.create(this);
  this.animating.to({ alpha: 0.0 }, 250);
  this.animating.on('complete', function() {
    this.visible = false;
    this.energyBar.visible = false;
    this.healthBar.visible = false;
  }, this);
  this.animating.start();
};

Hud.prototype.update = function() {
  var scale, inverse,
      ship = this.ship;
  
  // keep
  // orientation
  if(this.visible) {
    scale = this.game.world.scale.x;
    inverse = (1.0+scale)/scale;

    this.scale.set(inverse, inverse);
    this.rotation = -ship.rotation;
    this.container.y = -(ship.data.size/inverse+8);
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
  this.healthBar.reset();
  this.healthBar.percentage('width', 1);

  this.energyBar.reset();
  this.energyBar.percentage('width', 1);

  this.ship.isPlayer && this.show();
};

Hud.prototype.disable = function() {
  this.healthBar.reset();
  this.healthBar.percentage('width', 0);

  this.energyBar.reset();
  this.energyBar.percentage('width', 0);

  this.hide();
};

Hud.prototype.destroy = function(options) {
  this.animating && this.animating.isRunning && this.animating.stop(false);
  
  Pane.prototype.destroy.call(this, options);

  this.username = this.game = this.ship =
    this.layout = this.settings = undefined;
};

module.exports = Hud;
