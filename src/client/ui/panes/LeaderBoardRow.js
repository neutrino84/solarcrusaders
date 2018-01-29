var engine = require('engine' ),
    Layout = require('../Layout'),
    Pane = require('../components/Pane'),
    Label = require('../components/Label');

function LeaderBoardRow(game, settings) {
  Pane.call(this, game, {
    constraint: Layout.STRETCH,
    layout: {
      type: 'border',
      gap: [0, 0]
    },
    usernameLabel: {
      width: 156,
      constraint: Layout.LEFT,
      font: {
        name: 'full',
        color: 0xd0d0d0
      }
    },
    scoreLabel: {
      constraint: Layout.RIGHT,
      font: {
        name: 'full',
        color: 0xd0d0d0
      }
    }
  });
};

LeaderBoardRow.MAXIMUM_USERS = 9;

LeaderBoardRow.prototype = Object.create(Pane.prototype);
LeaderBoardRow.prototype.constructor = LeaderBoardRow;

LeaderBoardRow.prototype.create = function() {
  var game = this.game,
      settings = this.settings;

  this.usernameLabel = new Label(game, settings.usernameLabel);
  this.scoreLabel = new Label(game, settings.scoreLabel);

  this.addPanel(this.usernameLabel);
  this.addPanel(this.scoreLabel);
};

LeaderBoardRow.prototype.refresh = function(username, score) {
  this.usernameLabel.text = username.toUpperCase();
  this.scoreLabel.text = global.Math.round(score);
};

Object.defineProperty(LeaderBoardRow.prototype, 'tint', {
  set: function(value) {
    this.usernameLabel.tint = value;
    this.scoreLabel.tint = value;
  }
});

module.exports = LeaderBoardRow;
