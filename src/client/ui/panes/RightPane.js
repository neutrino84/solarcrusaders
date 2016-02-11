
var engine = require('engine'),
    Layout = require('../Layout'),
    Pane = require('../components/Pane'),
    Label = require('../components/Label'),
    Image = require('../components/Image'),
    Button = require('../components/Button');

function RightPane(game, settings) {
  Pane.call(this, game, {
    padding: [0],
    layout: {
      ax: Layout.CENTER,
      ay: Layout.TOP,
      direction: Layout.VERTICAL,
      gap: 0,
      stretch: false
    },
    bg: {
      color: 0x336699,
      fillAlpha: 0.2,
      fillAlpha: 0.0,
      borderSize: 0.0,
      radius: 0
    }
  });

  this.infoPane = new Pane(game, {
    padding: [0],
    layout: {
      type: 'border',
      gap: [5, 0]
    },
    bg: {
      fillAlpha: 0.0
    }
  });

  this.infoPane2 = new Pane(game, {
    padding: [0],
    layout: {
      type: 'border',
      gap: [5, 0]
    },
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
    'solar crusaders v__VERSION__', {
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

  this.forumsButton = new Button(game, 'forums');
  this.forumsButton.on('inputUp', this._forums, this);

  this.infoPane.addPanel(Layout.LEFT, this.registerButton);
  this.infoPane.addPanel(Layout.RIGHT, this.forumsButton);

  this.infoPane2.addPanel(Layout.RIGHT, this.fpsText);
  this.infoPane2.addPanel(Layout.LEFT, this.pingText);

  // add layout panels
  this.addPanel(Layout.CENTER, this.infoPane);
  this.addPanel(Layout.CENTER, this.versionText);
  this.addPanel(Layout.CENTER, this.infoPane2);

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

RightPane.prototype._forums = function() {
  global.document.location.href = 'http://forums.solarcrusaders.com/';
};

RightPane.prototype._updateInfo = function() {
  this.fpsText.text = this.game.clock.fps + ' fps';
  this.pingText.text = this.game.net.rtt + ' rtt';
  this.invalidate(true);
};

module.exports = RightPane;
