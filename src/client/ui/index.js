
var Panel = require('../ui/Panel'),
    Pane = require('../ui/components/Pane'),
    Label = require('../ui/components/Label'),
    Layout = require('../ui/Layout'),
    pixi = require('pixi'),
    Shipyard = require('../ui/panes/Shipyard'),
    BottomPane = require('../ui/panes/BottomPane'),
    MiniMapPane = require('../ui/panes/MiniMapPane'),
    HeaderPane = require('../ui/panes/HeaderPane'),
    LeaderBoardPane = require('../ui/panes/LeaderBoardPane');

function UI(game) {
  this.game = game;

  // this.game.on('game/loss', this.lossScreen, this)
};

UI.prototype.preload = function() {
  // load font
  this.game.load.image('medium', 'imgs/game/fonts/medium.png');
  this.game.load.image('full', 'imgs/game/fonts/full.png');
};

UI.prototype.create = function() {
  this.bottom = new BottomPane(this.game);
  this.header = new HeaderPane(this.game);
  // this.leaderBoard = new LeaderBoardPane(this.game);

  // miniMap pane added to canvas
  // this.miniMapPanel = new MiniMapPane(this.game);

    // new FlowLayout(Layout.LEFT, Layout.TOP, Layout.HORIZONTAL, 6));

  this.root = new Pane(this.game, {
    width: this.game.width,
    height: this.game.height,
    layout: {
      type: 'border',
      gap: [0, 0]
    },
    bg: false
  });
  
  this.root.addPanel(this.header);
  this.root.addPanel(this.bottom);
  this.header.id = 'header';
  this.header.alpha = 0;

  // add elements

  if(this.game.auth.user && !this.game.auth.user.ship){
    this.shipyard = new Shipyard(this.game); 
    this.root.addPanel(this.shipyard);
  }
  
  // this.miniMapPane = new MiniMapPane(this.game);
  // this.root.addPanel(this.miniMapPane);
  
  
  
  // this.root.addPanel(this.leaderBoard);
  //added miniMap pane
  // this.miniMapPanel.addPanel(Layout.NONE, this.miniMapPane);

  // invalidate
  this.root.invalidate();

  // add root to stage
  this.game.stage.addChild(this.root);

  // console.log(this.game.world)
  // this.game.world.foreground.alpha = 0;
  // this.game.world.background.alpha = 0;
  // let brightnessMatrix = new pixi.filters.ColorMatrixFilter();
  // this.root.filters = [brightnessMatrix];
  // brightnessMatrix.brightness(0)
  // console.log(this.root)

  // ship.chassis.filters = [colorMatrix];
  // colorMatrix.hue(140, false);
  // // colorMatrix.contrast(0.1);
  // colorMatrix.grayscale(0.9);
  // };
  // this.game.world.ui.children[0].alpha = 0;
  // this.game.clock.events.loop(100, uiAlphaFader = function(){
  //   if(this.root.alpha < 1){
  //     this.root.alpha += 0.01
  //   }
  //   if(this.root.alpha === 1){
  //     for(var i = 0; i < this.game.events.events.length; i++){
  //       if(this.game.events.events[i].callback.name === 'uiAlphaFader'){
  //         this.game.events.remove(ship.events.events[i]);  
  //       }
  //     };
  //   }
  // })

  // this.game.on('ship/player/attackship', this._squadKeys, this)
  // this._squadKeys();
};

UI.prototype.create_bottom = function() {
  // this.bottom = new BottomPane(this.game);
  // this.root.addPanel(this.bottom);
  // this.root.invalidate();
};

UI.prototype.lossScreen = function(){
  // this.root.removePanel();
    console.log('in loss screen')
  // console.log(this.bottom)
  // this.bottom.stopProcesses();
  this.game.clock.events.add(1000, function(){
    // this.bottom.destroy();
    this.root.removeChild(this.bottom)
    
    this.lossScreen = new Pane(this.game, {
      constraint: Layout.CENTER,
      width: this.game.width,
      height: this.game.height,
      layout: {
        type: 'stack'
      },
      bg: {
        fillAlpha: 1,
        color: 0x000000
      }
    });
    this.lossMessage = new Label(this.game, {
      constraint: Layout.USE_PS_SIZE,
      text: {
        fontName: 'medium'
      },
      bg: false
    });
    this.lossMessage.text = 'YOU LOSE';
    this.lossScreen.addPanel(this.lossMessage);
    this.root.addPanel(this.lossScreen);
    this.root.invalidate();

    this.tween = this.game.tweens.create(this.lossScreen.bg);
    this.tween.to({ fillAlpha: 1.0 }, 100);
    this.tween.delay(0);
    this.tween.start();
    this.tween.once('complete', function() {
      console.log('COMPLETE!', this.lossScreen.bg.fillAlpha)
      this.root.invalidate();
    }, this);


    // this.game.clock.events.add(2000, function(){
      // this.game.clock.events.add(3000, function(){
      //   console.log(this.lossScreen);
      //   this.lossScreen.bg.fillAlpha = 0.2;
      // }, this)
    // }, this)
  }, this);
};

UI.prototype.refresh = function() {
  this.root.invalidate(true);
};

UI.prototype.resize = function(width, height) {
  if(this.root !== undefined) {
    this.root.resize(width, height);
    this.root.invalidate();
  }
};

module.exports = UI;
