
var engine = require('engine'),
    Layout = require('../Layout'),
    Pane = require('../components/Pane'),
    BorderPane = require('../components/BorderPane'),
    Label = require('../components/Label'),
    Image = require('../components/Image'),
    Button = require('../components/Button');

function RightPane(game, settings) {
  Pane.call(this, game, {
    width: 288,
    height: 96,
    padding: [0],
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

  this.infoBorderPane = new BorderPane(game, {
    padding: [0],
    gap: [5, 0],
    bg: {
      fillAlpha: 0.0
    }
  });

  this.infoBorderPane2 = new BorderPane(game, {
    padding: [0],
    gap: [5, 0],
    bg: {
      fillAlpha: 0.0
    }
  });

  this.fpsText = new Label(game,
    '60 fps', {
      padding: [0],
      text: {
        fontName: 'medium',
        tint: 0x66aaff
      },
      bg: {
        fillAlpha: 0.0,
        borderAlpha: 0.0
      }
    });

  this.pingText = new Label(game,
    '0 ping', {
      padding: [0],
      text: {
        fontName: 'medium',
        tint: 0x66aaff
      },
      bg: {
        fillAlpha: 0.0,
        borderAlpha: 0.0
      }
    })

  this.versionText = new Label(game,
    'solar crusaders v2028', {
      padding: [5],
      text: {
        fontName: 'medium',
        tint: 0x66aaff
      },
      bg: {
        fillAlpha: 0.0,
        borderAlpha: 0.0
      }
    });

  this.registerButton = new Button(game, 'beta signup');
  this.registerButton.on('inputUp', this._register, this);

  this.instructionsButton = new Button(game, 'instructions');
  this.instructionsButton.on('inputUp', this._instructions, this);

  // add layout panels
  this.addPanel(Layout.CENTER, this.infoBorderPane);

  this.infoBorderPane.addPanel(Layout.LEFT, this.registerButton);
  this.infoBorderPane.addPanel(Layout.CENTER, this.instructionsButton);

  this.addPanel(Layout.CENTER, this.versionText);

  this.infoBorderPane2.addPanel(Layout.RIGHT, this.fpsText);
  this.infoBorderPane2.addPanel(Layout.LEFT, this.pingText);

  this.addPanel(Layout.CENTER, this.infoBorderPane2);

  // create timer
  game.clock.events.loop(500, this._updateInfo, this);
};

RightPane.prototype = Object.create(Pane.prototype);
RightPane.prototype.constructor = RightPane;

RightPane.prototype.validate = function() {
  return Pane.prototype.validate.call(this);
};

RightPane.prototype._register = function() {
  this.game.emit('gui/registration');
};

RightPane.prototype._instructions = function() {
  global.document.location.href = 'http://forums.solarcrusaders.com/topic/47/battle-module-f2p-holiday-special';
};

RightPane.prototype._updateInfo = function() {
  this.fpsText.text = this.game.clock.fps + ' fps';
  this.pingText.text = this.game.net.rtt + ' rtt';
  this.invalidate(true);
};

module.exports = RightPane;
