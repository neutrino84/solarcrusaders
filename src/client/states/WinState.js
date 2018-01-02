
var engine = require('engine'),
    pixi = require('pixi'),
    UI = require('../ui'),
    Layout = require('../ui/Layout'),
    Pane = require('../ui/components/Pane'),
    Image = require('../ui/components/Image'),
    ProgressBar = require('../ui/components/ProgressBar'),
    Label = require('../ui/components/Label');

function WinState(game) {
  this.game = game;
  this.auth = game.auth;
};


WinState.prototype = Object.create(engine.State.prototype);
WinState.prototype.constructor = engine.State;

WinState.prototype.init = function(args) {
  // instanciate ui
  this.ui = new UI(this.game);
};

WinState.prototype.preload = function() {
    this.ui.preload();

    
    // load texture atlas
    this.game.load.atlasJSONHash('texture-atlas', 'imgs/game/texture-atlas.png', 'data/texture-atlas.json');

    // load ship configuration
    // this.game.load.json('ship-configuration', 'data/ship-configuration.json');
    // this.game.load.json('item-configuration', 'data/item-configuration.json');
    // this.game.load.json('station-configuration', 'data/station-configuration.json');
};

WinState.prototype.create = function() {
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

  this.winScreen = new Pane(this.game, {
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

  this.winScreenLabelContainer = new Pane(this.game, {
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

  this.winMessage1 = new Label(this.game, {
    constraint: Layout.USE_PS_SIZE,
    width: 100,
    align: 'center',
    text: {
      fontName: 'medium'
    },
    bg: false
  });

  this.winMessage2 = new Label(this.game, {
    constraint: Layout.USE_PS_SIZE,
    align: 'center',
    text: {
      fontName: 'medium',
    },
    bg: false
  });
  this.winMessage3 = new Label(this.game, {
    constraint: Layout.USE_PS_SIZE,
    align: 'center',
    text: {
      fontName: 'medium',
    },
    bg: false
  });
  this.winMessage4 = new Label(this.game, {
    constraint: Layout.USE_PS_SIZE,
    align: 'center',
    color: 0xffffe0, 
    text: {
      fontName: 'medium',
    },
    bg: false
  });
  this.winMessage5 = new Label(this.game, {
    constraint: Layout.USE_PS_SIZE,
    align: 'center',
    color: 0xffffe0, 
    text: {
      fontName: 'medium',
    },
    bg: false
  });
  this.winMessage6 = new Label(this.game, {
    constraint: Layout.USE_PS_SIZE,
    align: 'center',
    color: 0xffffe0, 
    text: {
      fontName: 'medium',
    },
    bg: false
  });
  this.winMessage7 = new Label(this.game, {
    constraint: Layout.USE_PS_SIZE,
    align: 'center',
    color: 0xffffe0, 
    text: {
      fontName: 'medium',
    },
    bg: false
  });
  this.winMessage8 = new Label(this.game, {
    constraint: Layout.USE_PS_SIZE,
    align: 'center',
    color: 0xffffe0, 
    text: {
      fontName: 'medium',
    },
    bg: false
  });

  this.game.clock.events.add(500, function(){
    this.winMessage1.label.typewriter('With their bases destroyed', 10);
  }, this);
  this.game.clock.events.add(1500, function(){
    this.winMessage2.label.typewriter('the pirates have scattered', 10);
  }, this);
  this.game.clock.events.add(3000, function(){
    this.winMessage3.label.typewriter('The sector is now secure', 10);
  }, this);
  this.game.clock.events.add(4500, function(){
    this.winMessage4.label.typewriter('', 10);
  }, this);
  this.game.clock.events.add(5200, function(){
    this.winMessage5.label.typewriter('the Imperial Loyalists ask for your help', 10);
  }, this);
  this.game.clock.events.add(6200, function(){
    this.winMessage6.label.typewriter('In tracking Izelia- the late emperors granddaughter', 10);
  }, this);
  this.game.clock.events.add(7600, function(){
    this.winMessage7.label.typewriter('', 10);
  }, this);
  this.game.clock.events.add(7800, function(){
    this.winMessage8.label.typewriter('She may be the key to preventing galactic war', 10);
  }, this);

        // 'With the sector secure, the Imperial Loyalists must now track down Izel, the grandaughter of the late emperor.' ,10)

  // this.game.clock.events.add(4000, function(){
  //   this.winMessage3.label.typewriter('She could be the key to preventing galactic war.' ,10)
  // }, this);
  this.game.clock.events.add(10500, function(){
    // this.winMessage4.text = 'CONGRATS'
    // this.winMessage4.label.blink()
      this.game.world.static.removeAll();
      this.game.world.background.removeAll();
      this.game.world.foreground.removeAll();
      this.game.world.removeAll();
    this.game.clock.events.add(1000, function(){
      // console.log('game.world (after loss state) is ', this.game.world)
      this.game.net.socket.emit('auth/connect');
      this.game.states.start('sector')

      // location.reload(false);
    }, this);


  }, this);

  this.winScreen.addPanel(this.winScreenLabelContainer)
  this.winScreenLabelContainer.addPanel(this.winMessage1);
  this.winScreenLabelContainer.addPanel(this.winMessage2);
  this.winScreenLabelContainer.addPanel(this.winMessage3);
  this.winScreenLabelContainer.addPanel(this.winMessage4);
  this.winScreenLabelContainer.addPanel(this.winMessage5);
  this.winScreenLabelContainer.addPanel(this.winMessage6);
  this.winScreenLabelContainer.addPanel(this.winMessage7);
  this.winScreenLabelContainer.addPanel(this.winMessage8);

  this.root.addPanel(this.winScreen);

  // invalidate
  this.root.invalidate();

  this.root.fade(1, 1000)

  // add event listeners

  this.game.stage.addChild(this.root);
};

WinState.prototype.resize = function(width, height) {
  if(this.root !== undefined) {
    this.root.resize(width, height);
    this.root.invalidate();
  }
};

WinState.prototype.shutdown = function() {
  //.. properly destroy]
  this.game.stage.removeChild(this.root);
};

module.exports = WinState;
