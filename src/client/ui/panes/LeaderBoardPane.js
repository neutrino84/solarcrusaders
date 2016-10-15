var engine = require('engine' ),
    Layout = require('../Layout'),
    Pane = require('../components/Pane'),
    Label = require('../components/Label'),
    Image = require('../components/Image'),

    Panel = require('../Panel');

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max-min)) + min;
};

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

  this.uuid = 0;
  this.max = 9;
  this.users = [];
  this.sortedUsers = [];
  this.rows = [];

  this.infoUsersPane = new Pane(game, this.settings.usersPane);
  this.infoCurrentUserPane = new Pane(game, this.settings.currentUserPane);

  //..tmp
  this.initialize();

  game.clock.events.loop(1000, this._updateInfo, this);
};


LeaderboardPane.prototype = Object.create(Pane.prototype);
LeaderboardPane.prototype.constructor = LeaderboardPane;

LeaderboardPane.prototype.initialize = function() {
  var self = this;

  this.player = { name: 'neutrino84', score: '300', isPlayer: true };
  this.users.push(this.player);

  this.addPanel(Layout.STRETCH, this.infoUsersPane);
  this.addPanel(Layout.STRETCH, this.infoCurrentUserPane);

  this.playerRow = drawRow('   ', true);
  for(var i=0; i<this.max; i++) {
    drawRow((i+1) + ') ', false);
  }

  this.addUsers();

  function drawRow(number, isPlayer) {
    var panel = isPlayer ? self.infoCurrentUserPane : self.infoUsersPane,
        row = new Pane(game, self.settings.userRowPane),
        userNumber = new Label(game, number, self.settings.userRowLabel),
        userName = new Label(game, 'name', self.settings.userRowLabel),
        userScore = new Label(game, 'score', self.settings.userRowLabel);

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

LeaderboardPane.prototype.validate = function() {
  return Pane.prototype.validate.call(this);
};

LeaderboardPane.prototype.addUsers = function() {
  for(var i = 0; i<this.max; i++) {
    this.addPlayer({
      name: 'guest-' + i + i + i + i * getRandomInt(0, 500),
      score: getRandomInt(0, 500).toString()
    });
  }
};

LeaderboardPane.prototype.addPlayer = function(user) {
  user.uuid = this.uuid++;

  this.users.push(user);
  this.users.sort(function(a, b) {
    return b.score - a.score;
  });

  if(this.rows.length > this.max-1) {
    this.redraw();
  }
};

LeaderboardPane.prototype.removePlayer = function(user) {
  this.users.splice(this.users.indexOf(user), 1);
  this.redraw();
};

LeaderboardPane.prototype.redraw = function (){
  var self = this,
      playerRow = this.playerRow,
      user, row, player = this.player,
      isUserRanked = false;

  for(var i=0; i<this.max; i++) {
    user = this.users[i];
    row = this.rows[i];
    if(user) {
      if(user == player) {
        isUserRanked = true;
      }
      draw(row, user);
    } else {
      draw(row, undefined);
    }
  }

  if(isUserRanked) {
    playerRow.visible = false;
  } else {
    playerRow.visible = true;
    draw(playerRow, player);
  }

  function draw(row, user) {
    var right, color;
    if(user) {
      right = 180 * (4 / (user.name.length == 0 ? 4 : user.name.length));
      color = user.isPlayer ? 0x09FF7A : 0xFFFFFF;
      row.userName.tint =
        row.userScore.tint =
        row.userNumber.tint = color;
      row.userName.padding.right = right;
      row.userName.text = user.name;
      row.userScore.text = user.score;
      row.visible = true;
    } else {
      row.visible = false;
    }
    self.invalidate(true);
  }
};

LeaderboardPane.prototype.getSortedUsers = function() {
  this.sortedUsers = this.users.concat().splice(0, 10);
  if(this.sortedUsers.indexOf(this.player) == -1) {
    this.sortedUsers[ this.max - 1 ] = this.player;
  }
};

LeaderboardPane.prototype._updateInfo = function () {
  for(var i=0, j=this.users.length; i<j; i++){
    this.users[i].score = getRandomInt(0, 500).toString();
  }

  this.users.sort(function(a, b) {
    return b.score - a.score;
  });

  var index = getRandomInt(0, this.users.length - 1);
  if(this.users[index ].isPlayer){
    if(index >= this.users.length) {
      index--;
    } else {
      index++;
    }
  }

  // var random = getRandomInt(0, 5);
  // if(random < 2 && this.users.length > 2) {
  //   this.removePlayer(this.users[index ]);
  // } else if(random > 2 && this.users.length <= this.max * 3) {
  //   this.addPlayer({ name : 'User' + this.uuid, score : getRandomInt( 0, 500 ).toString() });
  // }

  this.redraw();
};

module.exports = LeaderboardPane;
