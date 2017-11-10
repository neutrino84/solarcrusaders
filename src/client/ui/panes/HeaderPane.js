
var engine = require('engine'),
    Layout = require('../Layout'),
    // LoginPane = require('./LoginPane'),
    // UserPane = require('./UserPane'),
    // MenuPane = require('./MenuPane'),
    CircleView = require('../views/CircleView'),
    MiniMapPane = require('../panes/MiniMapPane'),
    Pane = require('../components/Pane'),
    Label = require('../components/Label'),
    Image = require('../components/Image'),
    Button = require('../components/Button');

function HeaderPane(game, settings) {
  Pane.call(this, game, {
    constraint: Layout.TOP,
    padding: [0],
    height: 1,
    layout: {
      type: 'flow',
      ax: Layout.LEFT, 
      ay: Layout.TOP,
      direction: Layout.HORIZONTAL, 
      gap: 0
    },
    bg: {
      color: 0x336699,
      fillAlpha: 0.5,
      borderSize: 0.0,
      radius: 0
    }
  });


  this.square = new Pane(this.game, {
    width: 200,
    height: 200,
    // margin: [20, 20, 0, 0],
    layout: {
      type: 'flow',
      gap: [0, 0]
    },
    bg: {
      color: 0xFFA500,
      fillAlpha: 0.0,
      borderSize: 0.0,
      radius: 0
    }
  });
  this.miniMap = new MiniMapPane(game);
  this.square.addView(this.miniMap)
  this.addPanel(this.square);

  // this.loginPane = new LoginPane(game);
  // this.loginPane.start();

  // this.infoPane = new Pane(game, this.settings.pane);
  // this.fpsText = new Label(game, '60 fps', this.settings.label);
  // this.pingText = new Label(game, '0 ping', this.settings.label);
  // this.versionText = new Label(game,
  //   'solar crusaders v__VERSION__', this.settings.label);

  // this.infoPane.addPanel(Layout.RIGHT, this.fpsText);
  // this.infoPane.addPanel(Layout.LEFT, this.pingText);

  // add layout panels
  // this.addPanel(Layout.CENTER, this.userPane);
  // this.addPanel(Layout.CENTER, this.loginPane);
  // this.addPanel(Layout.STRETCH, this.menuPane);
  // this.addPanel(Layout.CENTER, this.versionText);
  // this.addPanel(Layout.CENTER, this.infoPane);

  // create timer
  // game.clock.events.loop(500, this._updateInfo, this);
};

HeaderPane.prototype = Object.create(Pane.prototype);
HeaderPane.prototype.constructor = HeaderPane;

// HeaderPane.prototype.login = function(user) {
//   this.loginPane.login();
//   this.menuPane.login();
//   this.userPane.login(user);
// };

// HeaderPane.prototype.logout = function() {
//   this.loginPane.logout();
//   this.userPane.logout();
//   this.menuPane.logout();
// };

HeaderPane.prototype._updateInfo = function() {
  this.fpsText.text = this.game.clock.fps + ' fps';
  this.pingText.text = this.game.net.rtt + ' rtt';
  // this.infoPane.invalidate(true);
};

module.exports = HeaderPane;
