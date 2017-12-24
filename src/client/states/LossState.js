
var engine = require('engine'),
    pixi = require('pixi'),
    UI = require('../ui'),
    Layout = require('../ui/Layout'),
    Pane = require('../ui/components/Pane'),
    Image = require('../ui/components/Image'),
    ProgressBar = require('../ui/components/ProgressBar'),
    Label = require('../ui/components/Label');

function LossState(game) {
  this.game = game;
  this.auth = game.auth;
};


LossState.prototype = Object.create(engine.State.prototype);
LossState.prototype.constructor = engine.State;

LossState.prototype.init = function(args) {
  // instanciate ui
  this.ui = new UI(this.game);
  console.log('in loss state init, args are ', args)
};

LossState.prototype.preload = function() {
    this.ui.preload();

    
    // load texture atlas
    this.game.load.atlasJSONHash('texture-atlas', 'imgs/game/texture-atlas.png', 'data/texture-atlas.json');

    // load ship configuration
    // this.game.load.json('ship-configuration', 'data/ship-configuration.json');
    // this.game.load.json('item-configuration', 'data/item-configuration.json');
    // this.game.load.json('station-configuration', 'data/station-configuration.json');
};

LossState.prototype.create = function() {
  var game = this.game;

  this.root = new Pane(game, {
    width: game.width,
    height: game.height,
    layout: {
      type: 'flow',
      ax: Layout.CENTER,
      ay: Layout.CENTER,
      direction: Layout.VERTICAL
    },
    bg: { color: 0x000000 },
    alpha : 0
  });
  this.root.alpha = 0;

  console.log('THIS ROOT IS : ', this.root)

  // this.lossScreen = new Pane(this.game, {
  //   constraint: Layout.CENTER,
  //   width: this.game.width,
  //   height: this.game.height,
  //   layout: {
  //     type: 'stack'
  //   },
  //   bg: {
  //     fillAlpha: 1,
  //     color: 0x000000
  //   }
  // });

  this.lossScreen = new Pane(this.game, {
    constraint: Layout.CENTER,
    width: this.game.width,
    height: this.game.height,
    layout: {
      type: 'flow',
            ax: Layout.CENTER, 
            ay: Layout.CENTER,
            direction: Layout.VERTICAL, 
            gap: 4
    },
    bg: false
  });

  // type: 'flow',
  //     ax: Layout.CENTER, 
  //     ay: Layout.BOTTOM,
  //     direction: Layout.HORIZONTAL, 
  //     gap: 4

  this.lossScreenLabelContainer = new Pane(this.game, {
    constraint: Layout.CENTER,
    width: 700,
    layout: {
      type: 'flow',
            ax: Layout.LEFT, 
            ay: Layout.CENTER,
            direction: Layout.VERTICAL, 
            gap: 4
    },
    bg: false
  });

  this.lossMessage = new Label(this.game, {
    constraint: Layout.USE_PS_SIZE,
    width: 100,
    align: 'center',
    text: {
      fontName: 'medium'
    },
    bg: false
  });

  this.lossMessage2 = new Label(this.game, {
    constraint: Layout.USE_PS_SIZE,
    align: 'center',
    color : 0xff0000,
    text: {
      fontName: 'medium',
    },
    bg: false
  });

  this.lossMessage.label.typewriter('The pirates have destroyed the Ubadian outpost and overrun the sector',10)
  this.game.clock.events.add(2000, function(){
    this.lossMessage2.text = 'INSERT COIN'
    this.lossMessage2.label.blink()
    this.game.clock.events.add(4000, function(){

      this.game.world.static.removeAll();
      this.game.world.background.removeAll();
      this.game.world.foreground.removeAll();
      // this.game.world.removeAll();
      this.game.net.socket.emit('auth/connect');
      this.game.states.start('sector')
      // location.reload(false);
    }, this)


  }, this)

  this.lossMessage.align = 'center'

  this.lossScreen.addPanel(this.lossScreenLabelContainer)
  this.lossScreenLabelContainer.addPanel(this.lossMessage);
  this.lossScreenLabelContainer.addPanel(this.lossMessage2);

  this.root.addPanel(this.lossScreen);

  // invalidate
  this.root.invalidate();

  this.root.fade(1, 1000)

  // add event listeners

  this.game.stage.addChild(this.root);
};

LossState.prototype.resize = function(width, height) {
  if(this.root !== undefined) {
    this.root.resize(width, height);
    this.root.invalidate();
  }
};

LossState.prototype.shutdown = function() {
  //.. properly destroy]
  this.game.stage.removeChild(this.root);
};

module.exports = LossState;
