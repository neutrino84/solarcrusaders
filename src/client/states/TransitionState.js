
var engine = require('engine'),
    pixi = require('pixi'),
    UI = require('../ui'),
    Layout = require('../ui/Layout'),
    Pane = require('../ui/components/Pane'),
    Image = require('../ui/components/Image'),
    ProgressBar = require('../ui/components/ProgressBar'),
    Label = require('../ui/components/Label');

function TransitionState(game) {
  this.game = game;
  this.auth = game.auth;
};


TransitionState.prototype = Object.create(engine.State.prototype);
TransitionState.prototype.constructor = engine.State;

TransitionState.prototype.init = function(args) {
  // instanciate ui
  this.ui = new UI(this.game);
};

TransitionState.prototype.preload = function() {
    this.ui.preload();
};

TransitionState.prototype.create = function() {
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

  this.transitionScreen = new Pane(this.game, {
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

  this.transitionScreenLabelContainer = new Pane(this.game, {
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

  this.transitionMessage = new Label(this.game, {
    constraint: Layout.USE_PS_SIZE,
    width: 100,
    align: 'center',
    text: {
      fontName: 'medium'
    },
    bg: false
  });

  this.transitionMessage2 = new Label(this.game, {
    constraint: Layout.USE_PS_SIZE,
    align: 'center',
    color : 0xadd8e6,
    text: {
      fontName: 'medium',
    },
    bg: false
  });
  
  this.game.world.alpha = 1;

  console.log('uuid is ', this.game.auth.user.uuid)
  this.game.net.socket.emit('tutorial/finished', this.game.auth.user.uuid)

  this.transitionMessage.label.typewriter('Go now and defend the sector. May fortune favor you',10)
  this.game.clock.events.add(2000, function(){
    this.transitionMessage2.text = 'GOOD LUCK'
    this.transitionMessage2.label.blink()
      this.game.world.static.removeAll();
      this.game.world.background.removeAll();
      this.game.world.foreground.removeAll();
      this.game.world.removeAll();
    this.game.clock.events.add(4000, function(){
      this.game.net.socket.emit('auth/connect');
      this.game.states.start('sector');
    }, this)

  }, this);

  this.transitionMessage.align = 'center'

  this.transitionScreen.addPanel(this.transitionScreenLabelContainer)
  this.transitionScreenLabelContainer.addPanel(this.transitionMessage);
  this.transitionScreenLabelContainer.addPanel(this.transitionMessage2);

  this.root.addPanel(this.transitionScreen);

  // invalidate
  this.root.invalidate();

  this.root.fade(1, 1000);
  
  this.game.stage.addChild(this.root);
};

TransitionState.prototype.resize = function(width, height) {
  if(this.root !== undefined) {
    this.root.resize(width, height);
    this.root.invalidate();
  }
};

TransitionState.prototype.shutdown = function() {
  //.. properly destroy]
  this.game.stage.removeChild(this.root);
};

module.exports = TransitionState;
