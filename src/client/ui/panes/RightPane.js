
var engine = require('engine'),
    Layout = require('../Layout'),
    Pane = require('../components/Pane'),
    BorderPane = require('../components/BorderPane'),
    Label = require('../components/Label'),
    Image = require('../components/Image');

function RightPane(game, settings) {
  Pane.call(this, game, {
    width: 288,
    height: 96,
    padding: [6],
    layout: {
      ax: Layout.CENTER,
      ay: Layout.TOP,
      direction: Layout.VERTICAL,
      gap: 0
    },
    bg: {
      color: 0x336699,
      fillAlpha: 0.2,
      fillAlpha: 0.0,
      borderSize: 0.0,
      radius: 0
    }
  });

  this.titleText = new Label(game,
    'solar crusaders', {
      padding: [6, 8],
      bg: {
        color: 0x840e18,
        filleAlpha: 1.0,
        borderSize: 0.0,
        blendMode: engine.BlendMode.ADD
      }
    });

  this.infoBorderPane = new BorderPane(game, {
    bg: {
      color: 0x000000,
      fillAlpha: 1.0
    }
  });

  this.fpsText = new Label(game,
    '60 fps', {
      padding: [6, 8],
      text: {
        fontName: 'medium',
        tint: 0x66aaff
      },
      bg: {
        color: 0x000000,
        borderSize: 0.0
      }
    });

  this.pingText = new Label(game,
    '0 ping', {
      padding: [6, 8],
      text: {
        fontName: 'medium',
        tint: 0x66aaff
      },
      bg: {
        color: 0x000000,
        borderSize: 0.0
      }
    })

  this.versionText = new Label(game,
    'v1063', {
      padding: [6, 8],
      text: {
        fontName: 'medium',
        tint: 0x66aaff
      },
      bg: {
        color: 0x000000,
        borderSize: 0.0
      }
    });

  this.wipText = new Label(game,
    'work in progress', {
      padding: [6, 8],
      text: {
        fontName: 'medium'
      },
      bg: {
        color: 0x000000,
        borderSize: 0.0
      }
    });

  // this.disclaimerText = new Label(game,
  //   'not final product', {
  //     padding: [6, 8],
  //     border: [0],
  //     text: {
  //       fontName: 'medium'
  //     },
  //     bg: {
  //       color: 0x000000,
  //       borderSize: 0.0
  //     }
  //   });

  this.instructionsText = new Label(game,
    'use arrow keys to move camera', {
      padding: [6, 8],
      border: [0],
      text: {
        fontName: 'medium'
      },
      bg: {
        color: 0x000000,
        fillAlpha: 1.0,
        borderSize: 0.0
      }
    });

  this.instructionsText2 = new Label(game,
    'select and right click to move', {
      padding: [6, 8],
      border: [0],
      text: {
        fontName: 'medium'
      },
      bg: {
        color: 0x181818,
        fillAlpha: 1.0,
        borderSize: 0.0
      }
    });

  // add layout panels
  this.addPanel(Layout.CENTER, this.titleText);

  this.infoBorderPane.addPanel(Layout.RIGHT, this.fpsText);
  this.infoBorderPane.addPanel(Layout.LEFT, this.versionText);
  this.infoBorderPane.addPanel(Layout.CENTER, this.pingText);

  this.addPanel(Layout.CENTER, this.infoBorderPane);
  // this.addPanel(Layout.STRETCH, this.infoBorderPane2);

  // this.addPanel(Layout.STRETCH, this.disclaimerText);
  this.addPanel(Layout.CENTER, this.wipText);
  this.addPanel(Layout.CENTER, this.instructionsText);
  // this.addPanel(Layout.STRETCH, this.instructionsText2);

  // create timer
  game.clock.events.loop(1000, this._updateInfo, this);
};

RightPane.prototype = Object.create(Pane.prototype);
RightPane.prototype.constructor = RightPane;

RightPane.prototype.validate = function() {
  return Pane.prototype.validate.call(this);
};

RightPane.prototype._updateInfo = function() {
  this.fpsText.text = this.game.clock.fps + ' fps';
  this.pingText.text = this.game.net.rtt + ' rtt';
};

module.exports = RightPane;
