
var engine = require('engine'),
    Layout = require('../Layout'),
    Panel = require('../Panel'),
    Label = require('../components/Label'),
    InGameMessagePane = require('../panes/InGameMessagePane'),
    InTutorialMessagePane = require('../panes/InTutorialMessagePane'),
    Pane = require('../components/Pane'),
    Asteroid = require('../../objects/sector/misc/Asteroid');

function TutorialDisplay(game){

  // console.log('in tutorialDisplay')

  Pane.call(this, game, {
    constraint: Layout.CENTER,
    padding: [50, 50, 50, 50],
    layout: {
      type: 'stack',
      ay: Layout.CENTER
    }
  });
  this.bg = new Pane(this.game, {
    padding: [25],
    layout: {
      type: 'border',
      gap: [5,5]
    },
    bg: {
      fillAlpha: 0.0,
      color: 0x000000
    }
  });

  this.topPane = new Pane(this.game, {
    constraint: Layout.TOP,
    width: this.game.width/1.5,
    height: this.game.height*2/10,
    padding: [110,20,20,20],
    layout: {
      type: 'flow',
      ax: Layout.CENTER, 
      ay: Layout.CENTER,
      direction: Layout.VERTICAL, 
      gap: 6
    },
    bg: {
      fillAlpha: 0.0,
      color: 0x000000
    }
  }); 

  this.messageDisplay = new InTutorialMessagePane(game);

  this.topPane.addPanel(this.messageDisplay);

  this.bg.addPanel(this.topPane);

  this.addPanel(this.bg);



  // this.invalidate();
};

TutorialDisplay.prototype = Object.create(Pane.prototype);
TutorialDisplay.prototype.constructor = TutorialDisplay;

TutorialDisplay.prototype.create = function(){
};

TutorialDisplay.prototype.hide = function() {

};

TutorialDisplay.prototype.destroy = function() {
    this.messageDisplay.destroy();

    this.game = undefined;
};

module.exports = TutorialDisplay;
