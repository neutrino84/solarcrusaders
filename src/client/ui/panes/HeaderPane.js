
var engine = require('engine'),
    Layout = require('../Layout'),
    CircleView = require('../views/CircleView'),
    MiniMapPane = require('../panes/MiniMapPane'),
    InGameMessagePane = require('../panes/InGameMessagePane'),
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


  this.minimapContainer = new Pane(this.game, {
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
  this.messageDisplay = new InGameMessagePane(game);
  this.minimapContainer.addView(this.miniMap)
  this.addPanel(this.minimapContainer);
  this.addPanel(this.messageDisplay);
};

HeaderPane.prototype.fadeIn = function() {
  // this.alpha
};

HeaderPane.prototype = Object.create(Pane.prototype);
HeaderPane.prototype.constructor = HeaderPane;

HeaderPane.prototype._updateInfo = function() {
  this.fpsText.text = this.game.clock.fps + ' fps';
  this.pingText.text = this.game.net.rtt + ' rtt';
};

HeaderPane.prototype.destroy = function(){
  this.messageDisplay.destroy()
  this.miniMap.destroy();
  this.removeAll();

  this.minimapContainer = this.game = undefined;
};

module.exports = HeaderPane;
