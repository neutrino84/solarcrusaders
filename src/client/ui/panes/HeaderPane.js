
var engine = require('engine'),
    Layout = require('../Layout'),
    LoginPane = require('./LoginPane'),
    UserPane = require('./UserPane'),
    MenuPane = require('./MenuPane'),
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

  this.menuPane = new MenuPane(game);
  this.userPane = new UserPane(game);

  this.loginPane = new LoginPane(game);
  this.loginPane.start();

  this.infoPane = new Pane(game, this.settings.pane);
  this.fpsText = new Label(game, '60 fps', this.settings.label);
  this.pingText = new Label(game, '0 ping', this.settings.label);
  this.versionText = new Label(game,
    'solar crusaders v__VERSION__', this.settings.label);

  this.infoPane.addPanel(Layout.RIGHT, this.fpsText);
  this.infoPane.addPanel(Layout.LEFT, this.pingText);

  // add layout panels
  this.addPanel(Layout.CENTER, this.userPane);
  this.addPanel(Layout.CENTER, this.loginPane);
  this.addPanel(Layout.STRETCH, this.menuPane);
  this.addPanel(Layout.CENTER, this.versionText);
  this.addPanel(Layout.CENTER, this.infoPane);

  // create timer
  game.clock.events.loop(500, this._updateInfo, this);
};

HeaderPane.prototype = Object.create(Pane.prototype);
HeaderPane.prototype.constructor = HeaderPane;

HeaderPane.prototype.login = function(user) {
  this.loginPane.login();
  this.menuPane.login();
  this.userPane.login(user);
};

HeaderPane.prototype.logout = function() {
  this.loginPane.logout();
  this.userPane.logout();
  this.menuPane.logout();
};

HeaderPane.prototype._updateInfo = function() {
  this.fpsText.text = this.game.clock.fps + ' fps';
  this.pingText.text = this.game.net.rtt + ' rtt';
  this.infoPane.invalidate(true);
};

module.exports = HeaderPane;
