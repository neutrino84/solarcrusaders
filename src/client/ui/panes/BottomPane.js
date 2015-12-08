
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
        direction: Layout.HORIZONTAL
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

  this.iconWithBar1 = new ProgressButtonIcon(game, 'icon1', {});
  this.iconWithBar1.on('inputUp', this._clicked1, this);
  
  this.content.addPanel(Layout.NONE, this.iconWithBar1);
};

BottomPane.prototype = Object.create(Panel.prototype);
BottomPane.prototype.constructor = BottomPane;

BottomPane.prototype.addContent = function(constraint, panel) {
  this.content.addPanel(constraint, panel);
};

BottomPane.prototype._clicked1 = function() {
  this.iconWithBar1.setProgressBar(this.iconWithBar1.percentage / 100 + 0.2);
};

module.exports = BottomPane;
