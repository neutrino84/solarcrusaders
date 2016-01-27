
var engine = require('engine'),
    Panel = require('../Panel'),
    Layout = require('../Layout'),
    Pane = require('../components/Pane'),
    Button = require('../components/Button'),
    BorderLayout = require('../layouts/BorderLayout'),
    BackgroundView = require('../views/BackgroundView'),
    Class = engine.Class;

function ContentPane(game, string, settings) {
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
    title: {
      padding: [1, 1, 0, 1],
      layout: {
        type: 'border',
        gap: [1, 0]
      },
      bg: {
        fillAlpha: 1.0,
        color: 0x585858,
        radius: 0.0,
        borderSize: 0.0,
        blendMode: engine.BlendMode.MULTIPLY
      }
    },
    content: {
      padding: [1],
      bg: {
        fillAlpha: 0.8,
        color: 0x000000,
        radius: 0.0,
        borderSize: 0.0,
        blendMode: engine.BlendMode.MULTIPLY
      }
    },
    tabs: {
      padding: [0],
      layout: {
        ax: Layout.LEFT,
        ay: Layout.TOP,
        direction: Layout.HORIZONTAL,
        gap: 0
      },
      bg: {
        fillAlpha: 0.0,
        radius: 0.0,
        borderSize: 0.0
      }
    },
    button: {
      padding: [0],
      bg: {
        fillAlpha: 1.0,
        borderSize: 0.0,
        radius: 0.0
      },
      label: {
        padding: [5, 8, 6, 8],
        border: [0],
        text: {
          fontName: 'small'
        },
        bg: {
          highlight: false,
          borderSize: 0.0,
          fillAlpha: 0.0,
          radius: 0.0
        }
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
  this.button = new Button(game, string, this.settings.button);
  this.tabs = new Pane(game, this.settings.tabs);
  
  this.label = this.button.label;

  this.addView(this.bg);

  this.addPanel(Layout.CENTER, this.content);
  this.addPanel(Layout.TOP, this.title);

  this.title.addPanel(Layout.LEFT, this.button);
  this.title.addPanel(Layout.CENTER, this.tabs);
};

ContentPane.prototype = Object.create(Panel.prototype);
ContentPane.prototype.constructor = ContentPane;

ContentPane.prototype.addTab = function(constraint, panel) {
  this.tabs.addPanel(constraint, panel);
};

ContentPane.prototype.addContent = function(constraint, panel) {
  this.content.addPanel(constraint, panel);
};

ContentPane.prototype.removeContent = function(panel) {
  this.content.removePanel(panel);
};

module.exports = ContentPane;
