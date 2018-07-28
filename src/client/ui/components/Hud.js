
var pixi = require('pixi'),
    engine = require('engine'),
    Pane = require('./Pane'),
    Label = require('./Label'),
    ProgressBar = require('./ProgressBar'),
    Layout = require('../Layout'),
    Class = engine.Class;

function Hud(ship, settings) {
  if(!ship){return}
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
    },
    indicatorContainer: {
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
  this.indicatorContainer = new Pane(this.game, this.settings.indicatorContainer);
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

  this.respawnCountdown = new Label(this.game, {
        constraint: Layout.USE_PS_SIZE,
        align: 'center',
        text: {
          fontName: 'full'
        },
        bg: false
      });
  this.respawnCountdown.tint = 0xffffff;
  this.respawnCountdown.text = '';

  
  this.gains = {};
  this.losses = {};
  this.gainTimers = [];
  this.lossTimers = [];
  this.countDownTimerNum = 0;
  
  this.indicatorContainer.addPanel(this.healthBar);

  //prevent stations from getting energy bars
  if(!this.ship.rot){
    this.indicatorContainer.addPanel(this.energyBar);
  };
  
  this.scoreContainer.addPanel(this.respawnCountdown)
  this.container.addPanel(this.indicatorContainer)
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
  if(ship.user){
    stats.health = stats.health*2;
  }
  this.healthBar.percentage(data.health / stats.health);
  this.energyBar.percentage(data.energy / stats.energy);

  this.invalidate();

  this.pivot.set(this.cachedWidth/2, this.cachedHeight/2);  
  this.position.set(this.ship.width/2, this.ship.height/2);

  this.visible = true;
  this.indicatorContainer.alpha = 0;
  this.alpha = 1.0;

  this.ship.addChild(this);
  
};

Hud.prototype.show = function() {
  this.visible = true;
  this.healthBar.visible = true;
  this.energyBar.visible = true;
  this.animating && this.animating.isRunning && this.animating.stop(false);
  this.animating = this.game.tweens.create(this.indicatorContainer);
  this.animating.to({ alpha: 1.0 }, 250);
  this.animating.on('complete', this.update, this);
  this.animating.start();
};

Hud.prototype.setUsername = function (data) {
  console.log('in hud setUsername, data is ', data);
    this.username = new Label(this.game, {
    constraint: Layout.USE_PS_SIZE,
    align: 'center',
    text: {
      fontName: 'full'
    },
    bg: false
  });

  this.username.text = data;

  this.username.tint = 0x32CD32;
  this.username.alpha = 1;
  this.scoreContainer.addPanel(this.username)

  console.log(this.scoreContainer);
  
  
};

Hud.prototype.showLevelUp = function () {
  this.levelUp = new Label(this.game, {
    constraint: Layout.USE_PS_SIZE,
    align: 'center',
    text: {
      fontName: 'full'
    },
    bg: false
  });

  this.levelUp.text = 'Level Up!';
  
  this.levelUp.tint = 0x32CD32;
  this.levelUp.alpha = 1;
  this.scoreContainer.addPanel(this.levelUp)
  this.levelUpTween = this.game.tweens.create(this.levelUp);
  this.levelUpTween.to({ y: -28, alpha: 0 }, 3000, );
  this.levelUpTween.delay(300);
  this.levelUpTween.start();
  this.levelUpTween.on('complete', function () {
    this.scoreContainer.removePanel(this.levelUp);
    this.levelUp = null;
  }, this);
};

Hud.prototype.showCreditLoss = function(credits) {
  this.visible = true;
  if(this.losses1){
    this.losses2 = new Label(this.game, {
          constraint: Layout.USE_PS_SIZE,
          align: 'center',
          text: {
            fontName: 'full'
          },
          bg: false
        });

    if(credits>0){
      this.losses2.text = '-' + credits;
      this.losses2.x -= 2;
    }else{
      this.losses2.text = credits;  
    }
    this.losses2.tint = 0xff0000;
    this.losses2.alpha = 1;
    this.scoreContainer.addPanel(this.losses2)
    this.lossTween2 = this.game.tweens.create(this.losses2);
    this.lossTween2.to({ y: -28, alpha: 0}, 2000, );
    this.lossTween2.delay(300);
    this.lossTween2.start();
    this.lossTween2.on('complete', function() {
      this.scoreContainer.removePanel(this.losses2);
      this.losses2 = null;
    }, this);

  } else {
    this.losses1 = new Label(this.game, {
          constraint: Layout.USE_PS_SIZE,
          align: 'center',
          text: {
            fontName: 'full'
          },
          bg: false
        });
  };
  if(credits>0){
    this.losses1.text = '-' + credits;
    this.losses1.x -= 2;
  }else{
    this.losses1.text = credits;
  };
  this.losses1.tint = 0xff0000;
  this.losses1.alpha = 1;

  this.scoreContainer.addPanel(this.losses1);

  this.lossTween1 = this.game.tweens.create(this.losses1);
  this.lossTween1.to({ y: -28, alpha: 0}, 2000, );
  this.lossTween1.delay(100);
  this.lossTween1.start();
  this.lossTween1.on('complete', function() {
    this.scoreContainer.removePanel(this.losses1);
    this.losses1 = null;
  }, this);
};

Hud.prototype.showCreditGain = function(credits, uuid) {
  if(this.gains1){
    this.gains2 = new Label(this.game, {
          constraint: Layout.USE_PS_SIZE,
          align: 'center',
          text: {
            fontName: 'full'
          },
          bg: false
        });
    this.gains2.text = credits;  
    this.gains2.tint = 0x32CD32;
    this.gains2.alpha = 1;
    this.scoreContainer.addPanel(this.gains2)
    this.gainsTween2 = this.game.tweens.create(this.gains2);
    this.gainsTween2.to({ y: -28, alpha: 0}, 2000, );
    this.gainsTween2.delay(300);
    this.gainsTween2.start();
    this.gainsTween2.on('complete', function() {
      this.scoreContainer.removePanel(this.gains2);
      this.gains2 = null;
    }, this);

  } else {
    this.gains1 = new Label(this.game, {
          constraint: Layout.USE_PS_SIZE,
          align: 'center',
          text: {
            fontName: 'full'
          },
          bg: false
        });
    this.gains1.text = credits;
    this.gains1.tint = 0x32CD32;
    this.gains1.alpha = 1;

    this.scoreContainer.addPanel(this.gains1);
    this.gainsTween1 = this.game.tweens.create(this.gains1);
    this.gainsTween1.to({ y: -28, alpha: 0}, 2000, );
    this.gainsTween1.delay(100);
    this.gainsTween1.start();
    this.gainsTween1.on('complete', function() {
      this.scoreContainer.removePanel(this.gains1);
      this.gains1 = null;
    }, this);
  };
  this.game.emit('player/credits');
};

Hud.prototype.respawnCountdownStart = function(num) {
  this.countDownTimerNum = num;

  this.respawnCountdown.x = 2;
  this.respawnCountdown.y = -13;
  this.respawnCountdown.text = this.countDownTimerNum;
  this.countDownTimer && this.ship.events.remove(this.countDownTimer)
  this.countDownTimer = this.ship.events.loop(1000, function(){
      this.countDownTimerNum --
      this.respawnCountdown.text = this.countDownTimerNum;
      if(this.countDownTimerNum <= 0){
        this.respawnCountdown.text = '';
        this.ship.events.remove(this.countDownTimer);        
      }
  }, this);
};

Hud.prototype.hide = function() {
  this.animating && this.animating.isRunning && this.animating.stop(false);
  this.animating = this.game.tweens.create(this.indicatorContainer);
  this.animating.to({ alpha: 0.0 }, 250);
  this.animating.on('complete', function() {
    // this.visible = false;
    this.energyBar.visible = false;
    this.healthBar.visible = false;
  }, this);
  this.animating.start();
};

Hud.prototype.update = function() {
  var scale, inverse,
      ship = this.ship;
  
  // keep orientation
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
