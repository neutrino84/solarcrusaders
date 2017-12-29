
var engine = require('engine'),
    client = require('client'),
    Panel = require('../Panel'),
    Layout = require('../Layout'),
    Pane = require('../components/Pane'),
    Label = require('../components/Label'),
    FlowLayout = require('../layouts/FlowLayout'),
    BorderLayout = require('../layouts/BorderLayout'),
    BackgroundView = require('../views/BackgroundView'),
    ProgressBar = require('../components/ProgressBar'),
    ButtonIcon = require('../components/ButtonIcon'),
    Tooltip = require('../components/Tooltip'),
    Class = engine.Class;

function WaveDisplayPane(game, settings) {
  Pane.call(this, game, {
    constraint: Layout.CENTER,
    height: 15,
    width: 90,
    margin: [0, 0, 0, 0],
    padding: [0, 30, 0, 0],
    layout: {
      type: 'flow',
      ax: Layout.CENTER, 
      ay: Layout.TOP,
      direction: Layout.HORIZONTAL, 
      gap: 10
    },
    bg: false,
    waveIndicator: {
      width: 80,
      height: 2,
      margin: [0, 0, 20, 0],
      progress: {
        color: 0xffffff,
        fillAlpha: 0.7,
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
        color: 0xffffff
      }
    }
  });

  this.mainText = new Label(this.game, {
        constraint: Layout.USE_PS_SIZE,
        align: 'center',
        color : 0xffffff,
        margin: [0, 0, 0, 0],
        text: {
          fontName: 'full'
        },
        bg: false
      });

  this.waveText = new Label(this.game, {
        constraint: Layout.USE_PS_SIZE,
        padding : [0, 7, 0, 0],
        align: 'center',
        color : 0xffffff,
        text: {
          fontName: 'full'
        },
        bg: false
      });
  // this.creditsCount = new Label(this.game, {
  //       constraint: Layout.USE_PS_SIZE,
  //       align: 'center',
  //       text: {
  //         fontName: 'full'
  //       },
  //       bg: false
  //     });

  // this.creditsCount.text = this.creditValue;
  this.waveIndicator = new ProgressBar(this.game, this.settings.waveIndicator);

  this.waveIndicator.percentage('width', 0)

  this.wave = 1;

  this.mainText.text = 'WAVE'
  this.waveText.text = ''

  this.exists = true;

  this.waveClock = 0;
  this.clockStarted = false;

  this.addPanel(this.mainText)
  this.addPanel(this.waveText)

  this.addPanel(this.waveIndicator)

  this.game.on('squad/construct', this._startClock, this)
  // this.game.on('player/credits', this._credits, this);
  // this.game.on('player/credits/init', this._credits, this);
};

WaveDisplayPane.prototype = Object.create(Pane.prototype);
WaveDisplayPane.prototype.constructor = WaveDisplayPane;

WaveDisplayPane.prototype._startClock = function(){
  this.waveText.text = this.wave;

  if(!this.clockStarted){
    this.clockStarted = true;
    this.game.clock.events.loop(4000, function(){
      this.waveClock += (0.1/3);  
      if(this.waveClock >= .99999999){
        this.waveClock = 0;
        this.wave++
        this.game.emit('wave/complete')
        this._updateWave();
        return
      }
      this._updateIndicator();
    }, this)
  };
};

WaveDisplayPane.prototype._updateIndicator = function() {
  if(this.exists){
    this.waveIndicator.change('width', this.waveClock) 
  }
};

WaveDisplayPane.prototype._updateWave = function() {
  if(this.exists){
    this.waveText.text = this.wave;
  }
};

module.exports = WaveDisplayPane;
