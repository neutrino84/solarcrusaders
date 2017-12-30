
var engine = require('engine'),
    client = require('client'),
    Panel = require('../Panel'),
    Layout = require('../Layout'),
    Pane = require('../components/Pane'),
    Label = require('../components/Label'),
    FlowLayout = require('../layouts/FlowLayout'),
    BorderLayout = require('../layouts/BorderLayout'),
    BackgroundView = require('../views/BackgroundView'),
    ButtonIcon = require('../components/ButtonIcon'),
    ProgressBar = require('../components/ProgressBar'),
    Tooltip = require('../components/Tooltip'),
    Class = engine.Class;

function CreditsPane(game, settings) {
  Pane.call(this, game, {
    constraint: Layout.CENTER,
    height: 15,
    width: 200,
    margin: [0, 20, 0, 0],
    padding: [0, 0, 0, 0],
    layout: {
      type: 'flow',
      ax: Layout.CENTER, 
      ay: Layout.TOP,
      direction: Layout.HORIZONTAL, 
      gap: 10
    },
    bg: false,
    paymentTimerIndicator: {
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

  this.creditsText = new Label(this.game, {
        constraint: Layout.USE_PS_SIZE,
        align: 'center',
        text: {
          fontName: 'full'
        },
        bg: false
      });
  this.creditsCount = new Label(this.game, {
        constraint: Layout.USE_PS_SIZE,
        align: 'center',
        text: {
          fontName: 'full'
        },
        bg: false
      });

  this.creditsText.text = 'CREDITS';


  this.paymentTimerIndicator = new ProgressBar(this.game, this.settings.paymentTimerIndicator);

  this.paymentTimerIndicator.percentage('width', 0)

  this.paymentClock = 0;
  this.clockStarted = false;

  this.exists = true;

  // this.creditsCount.text = this.creditValue;


  this.addPanel(this.creditsText)
  this.addPanel(this.creditsCount)

  this.addPanel(this.paymentTimerIndicator)

  this.game.on('squad/construct', this._startClock, this)
  // this.game.on('player/credits', this._credits, this);
  // this.game.on('player/credits/init', this._credits, this);
};

CreditsPane.prototype = Object.create(Pane.prototype);
CreditsPane.prototype.constructor = CreditsPane;

CreditsPane.prototype._startClock = function(){
  if(!this.clockStarted){
    this.clockStarted = true;
    this.game.clock.events.loop(1250, function(){
      this.paymentClock += (0.1/3);  
      if(this.paymentClock >= .99999999){
        this.paymentClock = 1;
        this._payment();
        this.paymentClock = 0;
        this.game.emit('squad/payment')
        return
      }
      this._payment();
    }, this)
  };
};

CreditsPane.prototype._payment = function(){
  if(this.exists){
    this.paymentTimerIndicator.change('width', this.paymentClock) 
  }
};

CreditsPane.prototype.updateCredits = function(credits) {
  // this.creditValue = this.creditValue + credits;
  this.creditsCount.text = Math.floor(credits);
};

module.exports = CreditsPane;
