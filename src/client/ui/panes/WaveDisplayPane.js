
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

  this.waveIndicator = new ProgressBar(this.game, this.settings.waveIndicator);

  this.waveIndicator.percentage('width', 0)

  this.wave = 1;

  this.mainText.text = 'WAVE'
  // this.waveText.text = ''

  this.waveText.text = '';

  this.exists = true;

  this.waveClock = 0;
  this.clockStarted = false;

  this.addPanel(this.mainText)
  this.addPanel(this.waveText)
  this.addPanel(this.waveIndicator)

  this.game.clock.events.add(1000, this.delayedUpdate, this)

  this.game.on('user/wave/update', this._updateWave, this);
  this.game.on('wave/cycle', this.wavecycle, this);
  this.game.on('wave/response', this.waveResponse, this);
  // this.game.on('auth/sync/delayed', this._userSynced, this);

};

WaveDisplayPane.prototype = Object.create(Pane.prototype);
WaveDisplayPane.prototype.constructor = WaveDisplayPane;

WaveDisplayPane.prototype.delayedUpdate = function(){
  if(this.game.auth.user){
    var uuid = this.game.auth.user.uuid
    this.game.net.socket.emit('requesting/wave', uuid);
  }
};

WaveDisplayPane.prototype.waveResponse = function(response){
  this._updateWave(response[1]);
};

WaveDisplayPane.prototype._updateIndicator = function(){
  if(this.exists){
    this.waveIndicator.change('width', this.waveClock) 
  }
};

WaveDisplayPane.prototype._updateWave = function(wave){
  if(this.exists){
    this.wave = wave;
    this.waveText.text = this.wave;
  }
};

WaveDisplayPane.prototype.wavecycle = function(num){
  this.waveClock = (1/60 * num);  
  if(this.waveClock >= .99999999){
    this.waveClock = 0;
    this.game.emit('wave/complete');
  }
  this._updateIndicator();
};

WaveDisplayPane.prototype.destroy = function() {
  this.game.removeListener('wave/cycle', this.wavecycle, this);
  this.game.removeListener('user/wave/update', this._updateWave, this)
  this.game.removeListener('wave/response', this.waveResponse, this);

  this.game.clock.events.remove(this.waveClockTimer);
};

module.exports = WaveDisplayPane;
