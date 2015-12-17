
var engine = require('engine'),
    Panel = require('../Panel'),
    Layout = require('../Layout'),
    Pane = require('../components/Pane'),
    Label = require('../components/Label'),
    BorderLayout = require('../layouts/BorderLayout'),
    BackgroundView = require('../views/BackgroundView'),
    ProgressButtonIcon = require('../components/ProgressButtonIcon'),
    Class = engine.Class;

function BottomPane(game, string, settings) {
  Panel.call(this, game, new BorderLayout(0, 0));

  // default styles
  this.settings = Class.mixin(settings, {
    padding: [1, 4],
    border: [0],
    bg: {
      fillAlpha: 1.0,
      color: 0x3868b8,
      borderSize: 0.0,
      blendMode: engine.BlendMode.ADD,
      radius: 0.0
    },
    content: {
      padding: [3],
      bg: {
        fillAlpha: 0.8,
        color: 0x000000,
        radius: 0.0,
        borderSize: 0.0,
        blendMode: engine.BlendMode.MULTIPLY
      },
      layout: {
        direction: Layout.HORIZONTAL,
        gap: 4
      }
    }
  });

  if(this.settings.width || this.settings.height) {
    this.setPreferredSize(
      this.settings.width, this.settings.height);
  }
  
  this.setPadding.apply(this, this.settings.padding);
  this.setBorder.apply(this, this.settings.border);

  this.bg = new BackgroundView(game, this.settings.bg);
  this.content = new Pane(game, this.settings.content);

  this.addView(this.bg);
  this.addPanel(Layout.CENTER, this.content);

  for(var i=4; i>0; i--) {
    var weapon = this.create();
    this.content.addPanel(Layout.NONE, weapon);
  }
};

BottomPane.prototype = Object.create(Panel.prototype);
BottomPane.prototype.constructor = BottomPane;

BottomPane.prototype.addContent = function(constraint, panel) {
  this.content.addPanel(constraint, panel);
};

BottomPane.prototype.create = function(data) {
  return new ProgressButtonIcon(game,
    'ship-atlas', {
      disabled: true,
      icon: {
        padding: [0],
        width: 32,
        height: 32,
        frame: 'turret-a.png'
      }
    }
  );
};

module.exports = BottomPane;
