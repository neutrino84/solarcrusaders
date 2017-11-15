
var engine = require('engine'),
    Pane = require('../components/Pane'),
    Button = require('../components/Button'),
    Label = require('../components/Label'),
    Layout = require('../Layout');

function SquadronPane(game) {
  Pane.call(this, game, {
    constraint: Layout.LEFT,
    padding: [8],
    layout: {
      type: 'flow',
      ax: Layout.TOP,
      ay: Layout.LEFT,
      direction: Layout.VERTICAL, 
      gap: 4
    },
    title: {
      padding: [0, 0, 2, 0],
      font: {
        name: 'full',
        text: 'SQUADRON COMMANDS'
      }
    },
    button: {
      constraint: Layout.STRETCH,
      layout: {
        type: 'flow',
        ax: Layout.TOP,
        ay: Layout.LEFT,
        direction: Layout.HORIZONTAL, 
        gap: 4
      },
      label: {
        width: 128,
        padding: [8],
        font: {
          name: 'full'
        }
      },
      bg: {
        color: 0xffffff,
        fillAlpha: 0.1,
        borderSize: 1.0,
        borderColor: 0xffffff,
        borderAlpha: 1.0,
        blendMode: engine.BlendMode.ADD,
        alpha: {
          enabled: 0.5,
          disabled: 0.5,
          over: 1.0,
          down: 0.5,
          up: 0.5
        }
      }
    }
  });

  // commands
  this.buttons = [];
};

SquadronPane.COMMANDS = [
  { name: 'focus on target (q)', hotkey: 'q' },
  { name: 'stay in formation (w)', hotkey: 'w' },
  { name: 'regroup (e)', hotkey: 'e' },
  { name: 'defend area (r)', hotkey: 'r' }
];

SquadronPane.prototype = Object.create(Pane.prototype);
SquadronPane.prototype.constructor = SquadronPane;

SquadronPane.prototype.create = function() {
  var command,
      commands = SquadronPane.COMMANDS,
      game = this.game,
      settings = this.settings,
      buttons = this.buttons;

  // title label
  this.titleLabel = new Label(game, settings.title);

  // add title
  this.addPanel(this.titleLabel);

  // create buttons
  for(var i=0; i<commands.length; i++) {
    command = commands[i];

    if(command) {
      button = new Button(game, settings.button);
      button.start();
      button.on('inputUp', this.selected, this);
      button.label.text = command.name.toUpperCase();

      // register hotkey
      game.emit('/hotkey/register', 'press', command.hotkey, this.hotkey, this);

      // store button
      buttons.push(button);

      // add to display
      this.addPanel(button);
    }
  }
};

SquadronPane.prototype.selected = function(one, two) {
  console.log('selected', one, two);
};

SquadronPane.prototype.hotkey = function(one, two) {
  console.log('hotkey', one, two);
};

module.exports = SquadronPane;
