var engine = require('engine' ),
    Layout = require('../Layout'),
    Pane = require('../components/Pane'),
    Label = require('../components/Label'),
    LeaderBoardRow = require('./LeaderBoardRow');

function LeaderBoardPane(game, settings) {
  Pane.call(this, game, {
    constraint: Layout.RIGHT,
    padding: [8],
    layout: {
      type: 'flow',
      ax: Layout.LEFT,
      ay: Layout.TOP,
      direction: Layout.VERTICAL,
      gap: 6
    },
    title: {
      font: {
        name: 'full',
        text: 'LEADERBOARD'
      }
    },
    usersPane: {
      constraint: Layout.STRETCH,
      layout: {
        type: 'flow',
        ax: Layout.LEFT,
        ay: Layout.TOP,
        direction: Layout.VERTICAL,
        gap: 4
      }
    },
    currentUserPane: {
      constraint: Layout.STRETCH,
      layout: {
        type: 'flow',
        ax: Layout.LEFT,
        ay: Layout.TOP,
        direction: Layout.VERTICAL,
        gap: 4
      }
    }
  });

  this.rows = [];
  this.user = this.game.auth.user;
  this.userRow = null

  // subscribe to messaging
  this.game.on('ship/player', this.refresh, this);
  this.game.clock.events.loop(1000, this.refresh, this);
};

LeaderBoardPane.MAXIMUM_USERS = 9;

LeaderBoardPane.prototype = Object.create(Pane.prototype);
LeaderBoardPane.prototype.constructor = LeaderBoardPane;

LeaderBoardPane.prototype.create = function() {
  var game = this.game,
      settings = this.settings,
      user = this.user;

  //
  this.titleLabel = new Label(game, settings.title);
  this.usersPane = new Pane(game, settings.usersPane);
  this.currentUserPane = new Pane(game, settings.currentUserPane);

  // current user
  this.userRow = new LeaderBoardRow(game);
  this.userRow.create();
  this.userRow.refresh(user.username, user.credits);
  this.userRow.tint = 0x33ff33;

  this.addPanel(this.titleLabel)
  this.addPanel(this.usersPane);
  this.addPanel(this.currentUserPane);
  
  this.currentUserPane.addPanel(this.userRow);
};

LeaderBoardPane.prototype.refresh = function() {
  var data, row,
      game = this.game,
      user = this.user,
      rows = this.rows,
      userRow = this.userRow,
      usersPane = this.usersPane,
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

  // update user
  userRow.refresh(user.username, user.credits);

  // rebuild
  this.parent.invalidate();
};

module.exports = LeaderBoardPane;
