var engine = require('engine' ),
    Layout = require('../Layout'),
    Pane = require('../components/Pane'),
    Label = require('../components/Label'),
    Image = require('../components/Image'),
    Panel = require('../Panel');

function LeaderboardPane(game, settings) {
  Pane.call(this, game, {
    padding: [9],
    layout: {
      ax: Layout.RIGHT,
      ay: Layout.TOP,
      direction: Layout.VERTICAL,
      gap: 0
    },
    bg: {
      fillAlpha: 0.0,
      borderSize: 0.0
    },
    usersPane: {
      padding: [0],
      layout: {},
      bg: {
        fillAlpha: 0.0,
      }
    },
    currentUserPane: {
      padding: [0],
      layout: {},
      bg: {
        fillAlpha: 0.0,
      }
    },
    userRowPane: {
      padding: [6],
      layout: {
        type: 'border',
        gap: [0, 0]
      },
      bg: {
        fillAlpha: 0.0
      }
    },
    userRowLabel: {
      padding: [0],
      text: {
        fontName: 'full',
        tint: 0x66aaff
      },
      bg: {
        fillAlpha: 0.0,
        borderAlpha: 0.0
      }
    }
  });

  // this.uuid = 0;
  this.max = 9;
  this.ships = [];
  this.rows = [];

  this.infoUsersPane = new Pane(game, this.settings.usersPane);
  this.infoCurrentUserPane = new Pane(game, this.settings.currentUserPane);

  // connect to messaging
  this.game.on('ship/added', this.addPlayer, this);
  this.game.on('ship/removed', this.removePlayer, this);

  this.initialize();
};

LeaderboardPane.prototype = Object.create(Pane.prototype);
LeaderboardPane.prototype.constructor = LeaderboardPane;

LeaderboardPane.prototype.initialize = function() {
  var self = this,
      game = this.game;

  this.addPanel(Layout.STRETCH, this.infoUsersPane);
  this.addPanel(Layout.STRETCH, this.infoCurrentUserPane);

  this.playerRow = drawRow('   ', true);
  for(var i=0; i<this.max; i++) {
    drawRow((i+1) + ') ', false);
  }

  function drawRow(number, isPlayer) {
    var panel = isPlayer ? self.infoCurrentUserPane : self.infoUsersPane,
        row = new Pane(game, self.settings.userRowPane),
        userNumber = new Label(game, number, self.settings.userRowLabel),
        userName = new Label(game, '', self.settings.userRowLabel),
        userScore = new Label(game, '', self.settings.userRowLabel);

    row.addPanel(Layout.LEFT, userNumber);
    row.addPanel(Layout.CENTER, userName);
    row.addPanel(Layout.RIGHT, userScore);

    row.userNumber = userNumber;
    row.userName = userName;
    row.userScore = userScore;

    panel.addPanel(Layout.STRETCH, row);

    if(!isPlayer) {
      self.rows.push(row);
    }

    return row;
  }
};

LeaderboardPane.prototype.draw = function() {
  this.sort();
  this.redraw();
};

LeaderboardPane.prototype.addPlayer = function(ship) {
  var auth = this.game.auth,
      ships = this.ships

  if(ship.user === auth.user.uuid) {
    this.player = ship;
  }

  ship.on('data', this.draw, this);
  ships.push(ship);

  this.draw();
};

LeaderboardPane.prototype.removePlayer = function(ship) {
  var ships = this.ships;

  for(var i=0; i<ships.length; i++) {
    if(ship.uuid === ships[i].uuid) {
      ships[i].removeListener('data', this.draw);
      ships.splice(i, 1);
      break;
    }
  }

  this.draw();
};

LeaderboardPane.prototype.sort = function() {
  this.ships.sort(function(a, b) {
    return b.credits - a.credits;
  });
};

LeaderboardPane.prototype.redraw = function() {
  var self = this,
      playerRow = this.playerRow,
      player = this.player,
      ship, row, isUserRanked = false;

  for(var i=0; i<this.max; i++) {
    ship = this.ships[i];
    row = this.rows[i];
    if(ship) {
      if(ship == player) {
        isUserRanked = true;
        draw(row, ship, 0x09FF7A);
      } else {
        draw(row, ship, 0xFFFFFF);
      }
    } else {
      draw(row);
    }
  }

  if(isUserRanked) {
    playerRow.visible = false;
  } else {
    playerRow.visible = true;
    draw(playerRow, player, 0x09FF7A);
  }

  function draw(row, ship, color) {
    var right, color;
    if(ship) {
      right = 128 * (4 / (ship.username.length == 0 ? 4 : ship.username.length));
      row.userName.tint =
        row.userScore.tint =
        row.userNumber.tint = color;
      row.userName.padding.right = right;
      row.userName.text = ship.username;
      row.userScore.text = ship.credits;
      row.visible = true;
    } else {
      row.visible = false;
    }
    self.invalidate(true);
  }
};

module.exports = LeaderboardPane;
