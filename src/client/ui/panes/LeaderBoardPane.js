var engine = require('engine' ),
    Layout = require('../Layout'),
    Pane = require('../components/Pane'),
    LeaderBoardRow = require('./LeaderBoardRow');

function LeaderBoardPane(game, settings) {
  Pane.call(this, game, {
    constraint: Layout.TOP,
    padding: [4],
    layout: {
      type: 'flow',
      ax: Layout.RIGHT,
      ay: Layout.TOP,
      direction: Layout.VERTICAL,
      gap: 0
    },
    usersPane: {
      layout: {
        type: 'flow',
        ax: Layout.RIGHT,
        ay: Layout.TOP,
        direction: Layout.VERTICAL,
        gap: 0
      }
    },
    currentUserPane: {
      layout: {
        type: 'flow',
        ax: Layout.RIGHT,
        ay: Layout.TOP,
        direction: Layout.VERTICAL,
        gap: 0
      }
    }
  });

  // leaderboard rows
  this.rows = [];

  // subscribe to messaging
  this.game.on('ship/player', this.refresh, this);
  this.game.clock.events.loop(5000, this.refresh, this);
};

LeaderBoardPane.MAXIMUM_USERS = 9;

LeaderBoardPane.prototype = Object.create(Pane.prototype);
LeaderBoardPane.prototype.constructor = LeaderBoardPane;

LeaderBoardPane.prototype.create = function() {
  var game = this.game,
      settings = this.settings;

  this.usersPane = new Pane(game, settings.usersPane);
  this.currentUserPane = new Pane(game, settings.currentUserPane);

  this.addPanel(this.usersPane);
  this.addPanel(this.currentUserPane);
};

LeaderBoardPane.prototype.refresh = function() {
  var data, row,
      game = this.game,
      rows = this.rows,
      usersPane = this.currentUserPane,
      currentUserPane = this.currentUserPane,
      arr = Object.values(game.data.ships),
      ships = arr.sort(function(a, b) {
        return b.credits - a.credits;
      });

  // populate rows
  for(var i=0; i<LeaderBoardPane.MAXIMUM_USERS; i++) {
    data = ships[i];
    row = rows[i];

    if(data) {
      if(row == undefined) {
        row = new LeaderBoardRow(game);
        row.create();
        rows.push(row);
        usersPane.addPanel(row);
      }
      row.refresh(data.username, data.credits);
    }
  }

  // rebuild
  this.invalidate();
};

module.exports = LeaderBoardPane;
