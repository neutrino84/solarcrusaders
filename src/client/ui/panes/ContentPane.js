
var engine = require('engine'),
    Panel = require('../Panel'),
    Layout = require('../Layout'),
    Pane = require('../components/Pane'),
    Label = require('../components/Label'),
    BorderLayout = require('../layouts/BorderLayout'),
    BackgroundView = require('../views/BackgroundView'),
    Class = engine.Class;

function ContentPane(game, string, settings) {
  Panel.call(this, game, new BorderLayout(0, 0));

  // default styles
  this.settings = Class.mixin(settings, {
    // width: 288,
    // height: 192,
    padding: [1, 4],
    border: [0],
    bg: {
      fillAlpha: 1.0,
      color: 0x3868b8,
      borderSize: 0.0,
      blendMode: engine.BlendMode.ADD,
      radius: 0.0
    },
    title: {
      width: 17,
      height: 17,
      padding: [0],
      bg: {
        fillAlpha: 1.0,
        color: 0x002040,
        radius: 0.0,
        borderSize: 0.0,
        blendMode: engine.BlendMode.ADD
      }
    },
    content: {
      padding: [3, 3],
      bg: {
        fillAlpha: 0.8,
        color: 0x000000,
        radius: 0.0,
        borderSize: 0.0,
        blendMode: engine.BlendMode.MULTIPLY
      }
    },
    label: {
      padding: [6, 8],
      border: [0],
      text: {
        fontName: 'small'
      },
      bg: {
        highlight: 0x002040,
        color: 0x3868b8,
        fillAlpha: 0.5,
        blendMode: engine.BlendMode.ADD,
        borderSize: 0
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
  this.title = new Pane(game, this.settings.title);
  this.content = new Pane(game, this.settings.content);
  this.label = new Label(game, string, this.settings.label);

  this.addView(this.bg);

  this.addPanel(Layout.CENTER, this.content);
  this.content.addPanel(Layout.STRETCH, this.title);
  this.title.addPanel(Layout.NONE, this.label);
};

ContentPane.prototype = Object.create(Panel.prototype);
ContentPane.prototype.constructor = ContentPane;

ContentPane.prototype.addContent = function(constraint, panel) {
  this.content.addPanel(constraint, panel);
};

ContentPane.prototype.removeContent = function(panel) {
  this.content.removePanel(panel);
};

module.exports = ContentPane;
