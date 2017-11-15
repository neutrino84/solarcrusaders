
var engine = require('engine'),
    Layout = require('../Layout'),
    Pane = require('../components/Pane'),
    LeaderBoardPane = require('./LeaderBoardPane'),
    SquadronPane = require('./SquadronPane');

function TopPane(game) {
  Pane.call(this, game, {
    constraint: Layout.TOP,
    layout: {
      type: 'border',
      gap: [0, 0]
    }
  });

  // squadron
  this.squadron = new SquadronPane(this.game);
  this.squadron.create();

  // create leaderboard
  this.leaderboard = new LeaderBoardPane(this.game);
  this.leaderboard.create();

  this.addPanel(this.squadron);
  this.addPanel(this.leaderboard);
};

TopPane.prototype = Object.create(Pane.prototype);
TopPane.prototype.constructor = TopPane;

module.exports = TopPane;
