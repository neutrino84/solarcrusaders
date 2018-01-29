var engine = require('engine' ),
    Layout = require('../Layout'),
    Pane = require('../components/Pane'),
    Input = require('../components/Input'),
    Label = require('../components/Label'),
    Button = require('../components/Button'),
    LeaderBoardRow = require('./LeaderBoardRow');

function LoginPane(game) {
  Pane.call(this, game, {
    constraint: Layout.CENTER,
    padding: [8],
    layout: {
      type: 'flow',
      ax: Layout.CENTER,
      ay: Layout.TOP,
      direction: Layout.VERTICAL,
      gap: 6
    },
    content: {
      layout: {
        type: 'flow',
        ax: Layout.LEFT,
        ay: Layout.TOP,
        direction: Layout.HORIZONTAL,
        gap: 4
      },
    },
    title: {
      padding: [0],
      font: {
        name: 'full',
        text: 'AUTHENTICATION'
      }
    },
    username: {
      placeholder: {
        text: 'USERNAME'
      },
      bg: {
        color: 0xffffff,
        fillAlpha: 0.1,
        borderSize: 1.0,
        borderColor: 0xffffff,
        borderAlpha: 0.75
      }
    },
    password: {
      placeholder: {
        text: 'PASSWORD'
      },
      bg: {
        color: 0xffffff,
        fillAlpha: 0.1,
        borderSize: 1.0,
        borderColor: 0xffffff,
        borderAlpha: 0.75
      }
    },
    button: {
      padding: [8],
      label: {
        font: {
          name: 'full'
        }
      },
      bg: {
        color: 0xffffff,
        fillAlpha: 0.1,
        borderSize: 1.0,
        borderColor: 0xffffff,
        borderAlpha: 0.75
      }
    }
  });
};

LoginPane.prototype = Object.create(Pane.prototype);
LoginPane.prototype.constructor = LoginPane;

LoginPane.prototype.create = function() {
  // title label
  this.title = new Label(this.game, this.settings.title);

  // content pane
  this.content = new Pane(this.game, this.settings.content);

  // input fields
  this.username = new Input(this.game, this.settings.username);
  this.username.start();

  this.password = new Input(this.game, this.settings.password);
  this.password.start();
  
  // login button
  this.login = new Button(this.game, this.settings.button);
  this.login.start();
  this.login.label.text = 'LOGIN';
  
  // register button
  this.register = new Button(this.game, this.settings.button);
  this.register.start();
  this.register.label.text = 'REGISTER';

  this.addPanel(this.title);
  this.addPanel(this.content);
  this.content.addPanel(this.username);
  this.content.addPanel(this.password);
  this.content.addPanel(this.login);
  this.content.addPanel(this.register);
};

module.exports = LoginPane;
