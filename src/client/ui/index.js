
var Panel = require('../ui/Panel'),
    Pane = require('../ui/components/Pane'),
    Layout = require('../ui/Layout'),
    pixi = require('pixi'),
    Shipyard = require('../ui/panes/Shipyard'),
    BottomPane = require('../ui/panes/BottomPane'),
    LeaderBoardPane = require('../ui/panes/LeaderBoardPane');

function UI(game) {
  this.game = game;
};

UI.prototype.preload = function() {
  // load font
  this.game.load.image('medium', 'imgs/game/fonts/medium.png');
  this.game.load.image('full', 'imgs/game/fonts/full.png');
};

UI.prototype.create = function() {
  this.bottom = new BottomPane(this.game);
  // this.leaderBoard = new LeaderBoardPane(this.game);

  this.root = new Pane(this.game, {
    width: this.game.width,
    height: this.game.height,
    layout: {
      type: 'border',
      gap: [0, 0]
    },
    bg: false
  });

  // add elements
  if(!this.game.auth.user){
    this.shipyard = new Shipyard(this.game); 
    this.root.addPanel(this.shipyard);
  }
  this.root.addPanel(this.bottom);
  // this.root.addPanel(this.leaderBoard);

  // invalidate
  this.root.invalidate();

  // add root to stage
  this.game.world.ui.addChild(this.root);

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
