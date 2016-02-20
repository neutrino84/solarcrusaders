
var engine = require('engine'),
    Layout = require('../Layout'),
    LoginPane = require('./LoginPane'),
    Pane = require('../components/Pane'),
    Label = require('../components/Label'),
    Image = require('../components/Image'),
    Button = require('../components/Button');

function HeaderPane(game, settings) {
  Pane.call(this, game, {
    padding: [0],
    layout: {
      ax: Layout.CENTER,
      ay: Layout.TOP,
      direction: Layout.VERTICAL,
      gap: 5,
      stretch: false
    },
    bg: {
      color: 0x336699,
      fillAlpha: 0.2,
      fillAlpha: 0.0,
      borderSize: 0.0,
      radius: 0
    },
    pane: {
      width: 128,
      height: 7,
      padding: [0],
      layout: {
        type: 'border',
        gap: [5, 0]
      },
      bg: {
        fillAlpha: 0.0
      }
    },
    label: {
      padding: [0],
      text: {
        fontName: 'medium',
        tint: 0x66aaff
      },
      bg: {
        fillAlpha: 0.0,
        borderAlpha: 0.0
      }
    }
  });

  this.loginPane = new LoginPane(game);
  this.loginPane.start();

  this.infoPane2 = new Pane(game, this.settings.pane);
  this.fpsText = new Label(game, '60 fps', this.settings.label);
  this.pingText = new Label(game, '0 ping', this.settings.label);
  this.versionText = new Label(game,
    'solar crusaders v__VERSION__', this.settings.label);

  this.infoPane2.addPanel(Layout.RIGHT, this.fpsText);
  this.infoPane2.addPanel(Layout.LEFT, this.pingText);

  // add layout panels
  this.addPanel(Layout.CENTER, this.loginPane);
  this.addPanel(Layout.CENTER, this.versionText);
  this.addPanel(Layout.CENTER, this.infoPane2);

  // create timer
  game.clock.events.loop(500, this._updateInfo, this);
};

HeaderPane.prototype = Object.create(Pane.prototype);
HeaderPane.prototype.constructor = HeaderPane;

HeaderPane.prototype.login = function() {
  this.loginPane.login();
};

HeaderPane.prototype.logout = function() {
  this.loginPane.logout();
};

HeaderPane.prototype._updateInfo = function() {
  this.fpsText.text = this.game.clock.fps + ' fps';
  this.pingText.text = this.game.net.rtt + ' rtt';
  this.infoPane2.invalidate(true);
};

module.exports = HeaderPane;
