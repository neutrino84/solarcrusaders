
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

function InTutorialMessage(game, settings) {
  Pane.call(this, game, {
    constraint: Layout.CENTER,
    height: 215,
    width: 400,
    margin: [0, 0, 0, 200],
    padding: [0, 0, 0, 0],
    layout: {
      type: 'flow',
      ax: Layout.CENTER, 
      ay: Layout.TOP,
      direction: Layout.HORIZONTAL, 
      gap: 20
    },
    bg: {
      fillAlpha: 0.0,
      color: 0xff0000
    }
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

  this.mainText.text = '';

  this.addPanel(this.mainText);
  this.game.on('tutorial/message', this.message, this);

};

InTutorialMessage.prototype = Object.create(Pane.prototype);
InTutorialMessage.prototype.constructor = InTutorialMessage;

InTutorialMessage.prototype.message = function(message) {
  var events = this.game.clock.events,
      duration = message.duration || 3500;  

  this.mainText.text = '';
  this.invalidate();
  this.game.clock.events.add(150, function(){
    this.mainText.label.typewriter(message.msg,10);
    events.add(duration, function(){
      this.game.emit('tutorial/advance/check');
      if(message.autoAdvance){
        this.mainText.text = '';
      }
    }, this);
  }, this);
};

InTutorialMessage.prototype.destroy = function(){
  this.game.removeListener('tutorial/message', this.message, this);
  this.mainText = this.tutorial = this.game = undefined;
};
module.exports = InTutorialMessage;
