
var engine = require('engine'),
    SectorState = require('./SectorState'),
    LossState = require('./LossState'),
    WinState = require('./WinState'),
    TransitionState = require('./TransitionState'),
    Layout = require('../ui/Layout'),
    Pane = require('../ui/components/Pane'),
    Image = require('../ui/components/Image'),
    ProgressBar = require('../ui/components/ProgressBar'),
    Label = require('../ui/components/Label');

function LoadingState() {};

LoadingState.prototype = Object.create(engine.State.prototype);
LoadingState.prototype.constructor = engine.State;

LoadingState.prototype.preload = function() {
  this.game.load.image('loading', 'imgs/game/splash.png');
  this.game.load.image('small', 'imgs/game/fonts/small.png');
  this.game.load.image('full', 'imgs/game/fonts/full.png');
};

LoadingState.prototype.create = function() {
  var game = this.game,
      sectorState = new SectorState(game),
      lossState = new LossState(game),
      transitionState = new TransitionState(game),
      winState = new WinState(game);

  // load game
  game.states.add('sector', sectorState);
  game.states.add('loss', lossState);
  game.states.add('win', winState);
  game.states.add('transition', transitionState);
  game.states.start('sector');

  this.imageContainer  = new Pane(game, {
    width: 500,
    height: 200,
    layout: {
      type: 'stack'
    },
    bg: {
      borderSize: 1.0,
      borderColor: 0xff0000,
      borderAlpha: 0.0
    },
  });

  this.image = new Image(game, {
    margin: [10],
    key: 'loading',
    bg: {
      borderColor: 0xff0000,
      borderAlpha: 1.0
    },
  });

  this.progress = new ProgressBar(game, {
    width: 162,
    height: 8,
    margin: [10],
    bg: {
      color: 0x333333
    },
    progress: {
      color: 0xffffff,
      modifier: {
        left: 0.0,
        top: 0.0,
        width: 0.0,
        height: 1.0
      }
    }
  });

  this.status = new Label(game, {
    width: game.width,
    margin: [0],
    string: 'preparing to load game',
    text: { fontName: 'small' }
  });
  this.toolTipContainer  = new Pane(game, {
    width: 800,
    height: 200,
    layout: {
      type: 'flow',
      ax: Layout.CENTER,
      ay: Layout.CENTER,
      direction: Layout.VERTICAL
    },
    bg: {
      borderSize: 1.0,
      borderColor: 0xcc0aa0,
      borderAlpha: 0.0
    },
  });
  this.toolTipText = new Label(game, {
    width: game.width,
    margin: [40,0,0,0],
    string: '',
    text: { fontName: 'full' },
    color: 0xffff00
  });

  this.root = new Pane(game, {
    width: game.width,
    height: game.height,
    layout: {
      type: 'flow',
      ax: Layout.CENTER,
      ay: Layout.CENTER,
      direction: Layout.VERTICAL
    },
    bg: {
      color: 0xff0000,
      fillAlpha: 0.0,
      borderSize: 1.0,
      borderColor: 0xff0000,
      borderAlpha: 0.0
    },
  });

  // add ui elements
  this.root.addPanel(this.imageContainer);
  this.imageContainer.addPanel(this.image);
  this.root.addPanel(this.progress);
  this.root.addPanel(this.status);
  this.root.addPanel(this.toolTipContainer);
  this.toolTipContainer.addPanel(this.toolTipText);

  // invalidate
  this.root.invalidate();

  this.toolTips = [
    'The Ubadian empire has maintained a fragile peace in the galaxy for 900 years',
    'The shield maiden support ship creates a gravitational blur-field to reduce damage',
    'The recent assassination of the Ubadian emperor has shattered the balance of power in the galaxy',
    'If you are experiencing slow or choppy game play, you may need to clear your browser cache or restart',
    'Selecting Tutorial Mode before launching will spawn you in the tutorial zone where you can practice your skills',
    'The Scavengers were known to roam deep space, lately they have been spotted closer to sector centers',
    'The repair drone follows and repairs your ship if you fall below 50% health'
  ];

  this.toolTipCache = this.toolTips.slice();

  // add event listeners
  game.load.on('loadstart', this.loadingStart, this);
  game.load.on('loadcomplete', this.loadingComplete, this);
  game.load.on('filecomplete', this.loadingProgressBar, this);
};

LoadingState.prototype.loadingStart = function() {
  // add gui to stage
  this.game.stage.addChild(this.root);
  this.toolTip();
  this.toolTipTimer = this.game.clock.events.loop(7250, this.toolTip, this)
};

LoadingState.prototype.toolTip = function () {
  if(!this.toolTips.length){this.toolTips = this.toolTipCache.slice()};
  var num = Math.floor(Math.random() * this.toolTips.length),
      temp = (this.toolTips.splice(num, 1))[0];
  this.toolTipText.text = temp;
  this.root.invalidate();
};

LoadingState.prototype.loadingProgressBar = function() {
  var loaded = arguments[3],
      total = arguments[4],
      file = arguments[1];
  this.progress.change('width', loaded/total);
  this.status.text = file;
  this.root.invalidate();
};

LoadingState.prototype.loadingComplete = function() {
  this.game.clock.events.remove(this.toolTipTimer)
  this.toolTipTimer = null;
  this.tween = this.game.tweens.create(this.root);
  this.tween.to({ alpha: 0.0 }, 250);
  this.tween.delay(0);
  this.tween.start();
  this.tween.once('complete', function() {
    this.game.states.current.show && this.game.states.current.show();
    this.game.stage.removeChild(this.root);
  }, this);
};

LoadingState.prototype.resize = function(width, height) {
  if(this.root !== undefined) {
    this.root.resize(width, height);
    this.root.invalidate();
  }
};

LoadingState.prototype.shutdown = function() {
  //.. properly destroy
};

module.exports = LoadingState;
