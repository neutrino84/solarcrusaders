
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

function CreditsPane(game, settings) {
  Pane.call(this, game, {
    constraint: Layout.CENTER,
    height: 15,
    width: 90,
    padding: [0, 20, 4, 0],
    layout: {
      type: 'flow',
      ax: Layout.CENTER, 
      ay: Layout.BOTTOM,
      direction: Layout.HORIZONTAL, 
      gap: 20
    },
    bg: false
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

  this.creditValue = 0;

  this.creditsText.text = 'CREDITS'
  this.creditsCount.text = this.creditValue;


  this.addPanel(this.creditsText)
  this.addPanel(this.creditsCount)

  this.game.on('player/credits', this._credits, this);
};

CreditsPane.prototype = Object.create(Pane.prototype);
CreditsPane.prototype.constructor = CreditsPane;

CreditsPane.prototype._credits = function(credits) {
  console.log('credits gain is: ', credits)
  this.creditValue = this.creditValue + credits;
  this.creditsCount.text = this.creditValue;
};

module.exports = CreditsPane;
