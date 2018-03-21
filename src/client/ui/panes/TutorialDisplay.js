
var engine = require('engine'),
    Layout = require('../Layout'),
    Panel = require('../Panel'),
    Label = require('../components/Label'),
    InGameMessagePane = require('../panes/InGameMessagePane'),
    InTutorialMessagePane = require('../panes/InTutorialMessagePane'),
    Pane = require('../components/Pane'),
    Asteroid = require('../../objects/sector/misc/Asteroid');

function TutorialDisplay(game){
  Pane.call(this, game, {
    constraint: Layout.CENTER,
    // padding: [50, 50, 50, 50],
    layout: {
      type: 'stack',
      ay: Layout.CENTER
    }
  });
  this.bg = new Pane(this.game, {
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

  // this.game.on('fade/tutorialDisplay', this.fadeToBlack, this);

  this.messageDisplay = new InTutorialMessagePane(game);

  this.topPane.addPanel(this.messageDisplay);

  this.bg.addPanel(this.topPane);

  this.addPanel(this.bg);
};

TutorialDisplay.prototype = Object.create(Pane.prototype);
TutorialDisplay.prototype.constructor = TutorialDisplay;

TutorialDisplay.prototype.create = function(){
};

TutorialDisplay.prototype.fadeToBlack = function() {
  console.log('in tutorial fade to black')
  // this.bg.fade(1, 1000);
  // this.bg.invalidate();
  // this.bg.alpha = 1;
  // this.alpha = 1;
  // this.invalidate();
};

TutorialDisplay.prototype.destroy = function() {
    this.messageDisplay.destroy();

    this.game = undefined;
};

module.exports = TutorialDisplay;
