
var engine = require('engine'),
    client = require('client'),
    Panel = require('../Panel'),
    Layout = require('../Layout'),
    Pane = require('../components/Pane'),
    Label = require('../components/Label'),
    Class = engine.Class;

function SquadronPane(game, settings) {
  Pane.call(this, game, {
    constraint: Layout.BOTTOM,
    layout: {
      type: 'flow',
      ax: Layout.CENTER, 
      ay: Layout.TOP,
      direction: Layout.HORIZONTAL, 
      gap: 2
    },
    bg: false
  });

  this.buttons = {};
  this.placeholders = [];

  this.game.on('ship/player', this._player, this);
};

SquadronPane.prototype = Object.create(Pane.prototype);
SquadronPane.prototype.constructor = SquadronPane;

SquadronPane.MAXIMUM = 3;

SquadronPane.prototype.create = function() {
  var game = this.game,
      placeholders = this.placeholders;

  // generate placeholders
  for(var i=0; i<SquadronPane.MAXIMUM; i++) {
    this.placeholders.push(
      new Pane(this.game, {
        constraint: Layout.CENTER,
        width: 34,
        height: 36,
        layout: {
          type: 'stack'
        },
        bg: {
          fillAlpha: 0.4,
          color: 0x000000
        }
      })
    );
    this.addPanel(this.placeholders[i]);
  }
};

SquadronPane.prototype._player = function(player) {
  
};

module.exports = SquadronPane;
