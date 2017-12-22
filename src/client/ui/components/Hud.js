
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
  this.losses = {};
  this.gainTimers = [];
  this.lossTimers = [];
  
  this.container.addPanel(this.healthBar);

  //prevent stations from getting energy bars
  if(!this.ship.rot){
    this.container.addPanel(this.energyBar);
  }

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
  this.visible = true;
  this.healthBar.visible = true;
  this.energyBar.visible = true;
  this.animating && this.animating.isRunning && this.animating.stop(false);
  this.animating = this.game.tweens.create(this);
  this.animating.to({ alpha: 1.0 }, 250);
  this.animating.on('complete', this.update, this);
  this.animating.start();
};

Hud.prototype.showCreditLoss = function(credits) {
  this.visible = true;
  this.losses_a = new Label(this.game, {
        constraint: Layout.USE_PS_SIZE,
        align: 'center',
        text: {
          fontName: 'full'
        },
        bg: false
      });


  this.losses_a.tint = 0xff0000;
  this.losses_a.alpha = 1;
  this.losses_a.text = credits;
  this.losses_a.visible = true;
  
  this.scoreContainer.addPanel(this.losses_a)

  this.lossTimers && this.ship.events.remove(this.lossTimers)
  this.lossTimers = this.ship.events.loop(100, lossTimer_a = function(){
    if(!this.losses_a){return};
    this.losses_a.y -= 1;
    // this.losses_a.alpha -= .033;
    if(this.losses_a.y <= -28){
        this.losses_a.y = 0;
        this.losses_a.alpha = 0;
        this.losses_a = false;
        this.healthBar.visible = true;
        this.energyBar.visible = true;
        this.visible = false;
        // this.losses_a.destroy();
        this.ship.events.remove(this.lossTimers['a'])
    };
  }, this);

        this.ship.events.add(333, function(){
            this.losses_b = new Label(this.game, {
                  constraint: Layout.USE_PS_SIZE,
                  align: 'center',
                  text: {
                    fontName: 'full'
                  },
                  bg: false
                });
            this.losses_b.tint = 0xff0000;
            this.losses_b.text = credits;
            this.losses_b.visible = true;
            this.losses_b.alpha = 0.33;
            this.scoreContainer.addPanel(this.losses_b)

            this.lossTimers_b && this.ship.events.remove(this.lossTimers_b)
            this.lossTimers_b = this.ship.events.loop(100, lossTimer_b = function(){
              this.losses_b.y -= 1;
              this.losses_b.alpha -= .033;
              if(this.losses_b.y <= -28){
                  this.losses_b.alpha = 0;
                  this.losses_b.y = 0;
                  this.losses_b.visible = false;
                  this.healthBar.visible = true;
                  this.energyBar.visible = true;
                  this.visible = false;
                  // this.losses_b.destroy();
                  this.ship.events.remove(this.lossTimers_b)
              };
            }, this);

            this.ship.events.add(333, function(){
                    this.losses_c = new Label(this.game, {
                          constraint: Layout.USE_PS_SIZE,
                          align: 'center',
                          text: {
                            fontName: 'full'
                          },
                          bg: false
                        });
                    this.losses_c.tint = 0xff0000;
                    this.losses_c.text = credits;
                    this.losses_c.visible = true;
                    this.losses_c.alpha = 0.15;
                    this.scoreContainer.addPanel(this.losses_c)

                    this.lossTimers_c && this.ship.events.remove(this.lossTimers_c)
                    this.lossTimers_c = this.ship.events.loop(100, lossTimer_c = function(){
                      this.losses_c.y -= 1;
                      this.losses_c.alpha -= .033;
                      if(this.losses_c.y <= -28){
                          this.losses_c.alpha = 0;
                          this.losses_c.y = 0
                          this.losses_c.visible = false;
                          this.healthBar.visible = true;
                          this.energyBar.visible = true;
                          this.visible = false;
                          // this.losses_c.destroy();
                          this.ship.events.remove(this.lossTimers_c)
                      };
                    }, this);
            },this);
        },this);
};

Hud.prototype.showCreditGain = function(credits, uuid) {

    this.visible = true;
    this.alpha = 1;
    this.healthBar.visible = false;
    this.energyBar.visible = false;

  if(this.gains[uuid]){
    this.gains[uuid] = null;
  } 
    this.gains[uuid] = [];
    this.gainTimers[uuid] = [];

  this.gains[uuid]['a'] = new Label(this.game, {
        constraint: Layout.USE_PS_SIZE,
        align: 'center',
        text: {
          fontName: 'full'
        },
        bg: false
      });
  this.gains[uuid]['a'].tint = 0x32CD32;
  this.gains[uuid]['a'].text = credits;
  this.gains[uuid]['a'].visible = true;
  this.scoreContainer.addPanel(this.gains[uuid]['a'])

  this.gainTimers[uuid]['a'] && this.ship.events.remove(this.gainTimers[uuid]['a'])

  this.gainTimers[uuid]['a'] = this.ship.events.loop(100, function(){
    this.gains[uuid]['a'].y -= 1;
    this.gains[uuid]['a'].alpha -= .033;
    if(this.gains[uuid]['a'].y <= -28){
        this.gains[uuid]['a'].alpha = 0;
        this.gains[uuid]['a'].y = 0;
        this.gains[uuid]['a'].visible = false;
        this.healthBar.visible = true;
        this.energyBar.visible = true;
        this.visible = false;
        this.gains[uuid]['a'].destroy();
        this.ship.events.remove(this.gainTimers[uuid]['a'])

    };
  }, this);

  this.ship.events.add(333, function(){
      this.gains[uuid]['b'] = new Label(this.game, {
            constraint: Layout.USE_PS_SIZE,
            align: 'center',
            text: {
              fontName: 'full'
            },
            bg: false
          });
      this.gains[uuid]['b'].tint = 0x32CD32;
      this.gains[uuid]['b'].text = credits;
      this.gains[uuid]['b'].visible = true;
      this.gains[uuid]['b'].alpha = 0.33;
      this.scoreContainer.addPanel(this.gains[uuid]['b'])

      this.gainTimers[uuid]['b'] && this.ship.events.remove(this.gainTimers[uuid]['b'])
      this.gainTimers[uuid]['b'] = this.ship.events.loop(100, function(){
        this.gains[uuid]['b'].y -= 1;
        this.gains[uuid]['b'].alpha -= .033;
        if(this.gains[uuid]['b'].y <= -28){
            this.gains[uuid]['b'].alpha = 0;
            this.gains[uuid]['b'].y = 0;
            this.gains[uuid]['b'].visible = false;
            this.healthBar.visible = true;
            this.energyBar.visible = true;
            this.visible = false;
            this.gains[uuid]['b'].destroy();
            this.ship.events.remove(this.gainTimers[uuid]['b'])
        };
      }, this);

      this.ship.events.add(333, function(){
              this.gains[uuid]['c'] = new Label(this.game, {
                    constraint: Layout.USE_PS_SIZE,
                    align: 'center',
                    text: {
                      fontName: 'full'
                    },
                    bg: false
                  });
              this.gains[uuid]['c'].tint = 0x32CD32;
              this.gains[uuid]['c'].text = credits;
              this.gains[uuid]['c'].visible = true;
              this.gains[uuid]['c'].alpha = 0.15;
              this.scoreContainer.addPanel(this.gains[uuid]['c'])

              this.gainTimers[uuid]['c'] && this.ship.events.remove(this.gainTimers[uuid]['c'])
              this.gainTimers[uuid]['c'] = this.ship.events.loop(100, function(){
                this.gains[uuid]['c'].y -= 1;
                this.gains[uuid]['c'].alpha -= .033;
                if(this.gains[uuid]['c'].y <= -28){
                    this.gains[uuid]['c'].alpha = 0;
                    this.gains[uuid]['c'].y = 0;
                    this.gains[uuid]['c'].visible = false;
                    this.healthBar.visible = true;
                    this.energyBar.visible = true;
                    this.visible = false;
                    this.gains[uuid]['c'].destroy();
                    this.ship.events.remove(this.gainTimers[uuid]['c'])
                };
              }, this);
      },this);
  },this);
  this.game.emit('player/credits');
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
    if(this.ship.rot){
      this.container.y = -(400/inverse+8);
    } else if(ship.data.size > 200){
      this.container.y = -(200/inverse+8);
    } else {
      this.container.y = -(ship.data.size/inverse+8);
    }
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
