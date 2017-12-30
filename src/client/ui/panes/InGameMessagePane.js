
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
    Tooltip = require('../components/Tooltip'),
    Class = engine.Class;

function InGameMessage(game, settings) {
  Pane.call(this, game, {
    constraint: Layout.CENTER,
    height: 15,
    width: 400,
    margin: [0, 10, 125, 0],
    padding: [0, 0, 0, 0],
    layout: {
      type: 'flow',
      ax: Layout.LEFT, 
      ay: Layout.TOP,
      direction: Layout.HORIZONTAL, 
      gap: 20
    },
    bg: false
  });

  this.mainText = new Label(this.game, {
        constraint: Layout.USE_PS_SIZE,
        align: 'center',
        color : 0xffffff,
        text: {
          fontName: 'full'
        },
        bg: false
      });

  this.mainText.text = ''


  this.addPanel(this.mainText)

  // this.game.on('player/credits', this._credits, this);
  // this.game.on('player/credits/init', this._credits, this);
  this.game.on('user/shipSelected', this.message, this)
};

InGameMessage.prototype = Object.create(Pane.prototype);
InGameMessage.prototype.constructor = InGameMessage;

InGameMessage.prototype.message = function(message, duration) {
  var events = this.game.clock.events,
      duration = duration || 5000;
  this.mainText.text = '';
  if(!message){
    events.add(4000, function(){
      this.mainText.label.typewriter('Pirates have decended upon the sector',30)
      events.add(5000, function(){
          this.mainText.text = '';
          this.message('Defend the Ubadian outpost until the Imperial Loyalists arrive', 30);
          events.add(7000, function(){
            this.message('Survive 10 waves or destroy both pirate bases', 30);
            events.add(6000, function(){
              this.mainText.text = '';
            }, this);  
          }, this);
      }, this);
    }, this);
  } else {
    this.game.clock.events.add(250, function(){
      this.mainText.label.typewriter(message,10);
      events.add(duration, function(){
        this.mainText.text = '';
      }, this);
    }, this);
  }
};

InGameMessage.prototype.updateDisplay = function(credits) {
  // this.mainText.label.typewriter('Pirates have decended upon the sector',10)
  // this.mainText.label.typewriter('Survive 15 waves or destroy both their bases',10)
  // this.mainText.label.typewriter('yoyoyo',10)
  // this.mainText.text = 'wave 15';
};

module.exports = InGameMessage;
