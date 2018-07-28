var engine = require('engine' ),
    pixi = require('pixi'),
    Layout = require('../Layout'),
    Pane = require('../components/Pane'),
    Input = require('../components/Input'),
    Label = require('../components/Label'),
    Button = require('../components/Button'),
    LeaderBoardRow = require('./LeaderBoardRow');

function LoginPane(game) {
  Pane.call(this, game, {
    constraint: Layout.LEFT,
    padding: [8],
    width: game.width/1.4,
    height: game.height/8,
    layout: {
      type: 'flow',
      ax: Layout.LEFT,
      ay: Layout.TOP,
      direction: Layout.VERTICAL,
      gap: 0
    },
    bg: {
      color: 0xffffff,
      fillAlpha: 0.0,
      borderSize: 1.0,
      borderColor: 0xff0000,
      borderAlpha: 0.0
    },
    content: {
      width: game.width/1.6,
      padding: [0, 50, 0, 0],
      height: 45,
      layout: {
        type: 'flow',
        ax: Layout.LEFT,
        ay: Layout.CENTER,
        direction: Layout.HORIZONTAL,
        gap: 4
      },
      bg: {
        color: 0xffffff,
        fillAlpha: 0.0,
        borderSize: 1.0,
        borderColor: 0xffcc00,
        borderAlpha: 0.0
      }  
    },
    registration: {
      width: game.width/1.6,
      height: 45,
      layout: {
        type: 'flow',
        ax: Layout.LEFT,
        ay: Layout.CENTER,
        direction: Layout.HORIZONTAL,
        gap: 4
      },
      // padding: [0, 152, 0 ,0],
      bg: {
        color: 0xffffff,
        fillAlpha: 0.0,
        borderSize: 1.0,
        borderColor: 0xbbcc88,
        borderAlpha: 0.0
      }  
    },
    title: {
      margin: [0,0,10,0],
      padding: [0 , 10, 0 , 0],
      // margin: [0,0,8,0],
      font: {
        name: 'full'
      },
      align: 'left',
      bg: {
        borderSize: 1.0,
        borderColor: 0xaaffff,
        borderAlpha: 0.0,
        fillAlpha: 0
      },
      text: 'NOW ENTERING THE MOBIUS DIMENSION v1.0.3'
    },
    error1: {
      color: 0xff0000,
      padding: [0],
      // margin: [0,0,8,0],
      font: {
        name: 'full'
      },
      align: 'left',
      bg: {
        color: 0xff0000,
        borderSize: 1.0,
        borderColor: 0x000000,
        borderAlpha: 0.0,
        fillAlpha : 0.0
      },
      text: 'please fill out all input fields'
    },
    errorContainer1: {
      padding: [0, 30, 0, 0],
      // margin: [0,0,8,0],
      font: {
        name: 'full'
      },
      align: 'right',
      bg: {
        borderSize: 0.0,
        borderColor: 0x000000,
        borderAlpha: 0.0,
        alpha: 0
      },
      layout: {
        type: 'flow',
        ax: Layout.RIGHT,
        ay: Layout.TOP,
        direction: Layout.VERTICAL,
        gap: 0
      },
    },
    auth_title: {
      padding: [0],
      margin: [0,0,8,game.width/2 - 100],
      width: game.width/2,
      height: 5,
      font: {
        name: 'full',
        text: 'AUTHENTICATION'
      },
      align: 'left'
    },
    username: {
      width: 200,
      height: 10,
      placeholder: {
        text: 'USERNAME'
      },
      bg: {
        borderSize: 1.0,
        borderColor: 0xffffff,
        borderAlpha: 0.9
      },
      padding: {
        left: 0
      },
      margin: {
        left: 0
      },
      string: '                     '
    },
    password: {
      placeholder: {
        text: 'PASSWORD'
      },
      bg: {
        borderSize: 1.0,
        borderColor: 0xffffff,
        borderAlpha: 0.9
      },
      string: '                     '
    },
    email: {
      placeholder: {
        text: 'EMAIL'
      },
      bg: {
        borderSize: 1.0,
        borderColor: 0xffffff,
        borderAlpha: 0.9
      },
      string: '                     '
    },
    choosePassword: {
      placeholder: {
        text: 'CHOOSE A PASSWORD'
      },
      bg: {
        borderSize: 1.0,
        borderColor: 0xffffff,
        borderAlpha: 0.9
      },
      string: '                        '
    },
    chooseUsername: {
      placeholder: {
        text: 'CHOOSE A USERNAME'
      },
      bg: {
        borderSize: 1.0,
        borderColor: 0xffffff,
        borderAlpha: 0.9
      },
      string: '                        '
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
        borderColor: 0xffffff,
        borderAlpha: 0.9,
        fillAlpha: 0.2,
        borderSize: 1.0,
        alpha: {
          enabled: 0.5,
          disabled: 0.5,
          over: 2.0,
          down: 1.0,
          up: 1.0
        }
      }
    },
    guestButton: {
      margin: [0,0,0,0],
      padding: [8],
      label: {
        font: {
          name: 'full'
        }
      },
      bg: {
        color: 0x98FB98,
        borderColor: 0x98FB98,
        borderAlpha: 0.4,
        fillAlpha: 0.1,
        borderSize: 1.0,
        alpha: {
          enabled: 0.5,
          disabled: 0.5,
          over: 1.0,
          down: 2.0
        }
      }
    },
    tutorialButton: {
      padding: [8],
      label: {
        font: {
          name: 'full'
        }
      },
      bg: {
        color: 0xadd8e6,
        borderColor: 0xadd8e6,
        borderAlpha: 0.4,
        fillAlpha: 0.2,
        borderSize: 1.0,
        alpha: {
          enabled: 0.5,
          disabled: 0.5,
          over: 1.0,
          down: 2.0
        }
      }
    }
  });
};

LoginPane.prototype = Object.create(Pane.prototype);
LoginPane.prototype.constructor = LoginPane;

LoginPane.prototype.create = function() {

  // title label
  this.title = new Label(this.game, this.settings.title);
  this.title.text = 'NOW ENTERING THE MOBIUS DIMENSION v1.0.7'

  this.errorContainer1 = new Button(this.game, this.settings.errorContainer1);
  this.error1 = new Label(this.game, this.settings.error1);
  this.error1.text = 'MISSING DATA'

  this.errorContainer1.addPanel(this.error1)
  this.errorContainer1.alpha = 0;

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
  this.login.bg.on('inputOver', this._hover, this);
  this.login.bg.on('inputOut', this._unhover, this);
  // this.login.bg.on('inputDown', this._login, this);
  
  // register button
  this.register = new Button(this.game, this.settings.button);
  this.register.start();
  this.register.bg.on('inputOver', this._hover, this);
  this.register.bg.on('inputOut', this._unhover, this);
  this.register.bg.on('inputDown', this._register, this);
  this.register.label.text = 'REGISTER';

  this.guestButton = new Button(this.game, this.settings.guestButton);
  this.guestButton.start();
  this.guestButton.label.text = 'PLAY';
  this.guestButton.bg.on('inputOver', this._hover, this);
  this.guestButton.bg.on('inputOut', this._unhover, this);
  this.guestButton.bg.on('inputDown', this._playAsGuest, this);

  this.guestButton.bg.on('inputUp', this._inputUp, this);

  this.guestButton.activated = false;
 

  this.tutorialButton = new Button(this.game, this.settings.tutorialButton);
  this.tutorialButton.start();
  this.tutorialButton.label.text = 'TUTORIAL MODE';
  this.tutorialButton.bg.on('inputOver', this._hover, this);
  this.tutorialButton.bg.on('inputOut', this._unhover, this);
  this.tutorialButton.bg.on('inputDown', this._tutorialMode, this);

  this.tutorialButton.bg.on('inputUp', this._inputUp, this);

  this.tutorialButton.activated = false;

  var colorMatrix = new pixi.filters.ColorMatrixFilter();
  this.guestButton.bg.filters = [colorMatrix];
  colorMatrix.technicolor(14);

  var colorMatrix2 = new pixi.filters.ColorMatrixFilter();
  this.tutorialButton.bg.filters = [colorMatrix2];
  colorMatrix2.technicolor(9);
  this.registration = new Pane(this.game, this.settings.registration);

  this.login.bg.alpha = 1
  // console.log('login bg is ', this.login)
  // this.login.bg.borderColor = 0xff0000;
  // this.login.invalidate();

  // console.log('login bg is ', this.login.bg)
  // console.log('register bg is ', this.register.bg)


  this.loginInputs = {};
  this.registrationInputs = {};

  // input fields
  this.email = new Input(this.game, this.settings.email);
  this.email.start();

  this.choosePassword = new Input(this.game, this.settings.choosePassword);
  this.choosePassword.start();

  this.chooseUsername = new Input(this.game, this.settings.chooseUsername);
  this.chooseUsername.start();
  
  // choose ship button

  //make disabled until required fields have input
  this.chooseShip = new Button(this.game, this.settings.button);
  this.chooseShip.start();
  this.chooseShip.label.text = 'CHOOSE SHIP';
  this.chooseShip.bg.on('inputOver', this._hover, this);
  this.chooseShip.bg.on('inputOut', this._unhover, this);
  this.chooseShip.bg.on('inputDown', this._chooseShip, this);

  this.addPanel(this.title);
  this.addPanel(this.content);
  this.addPanel(this.registration);
  this.content.addPanel(this.username);
  // this.content.addPanel(this.password);
  // this.content.addPanel(this.login);
  // this.content.addPanel(this.register);
  this.content.addPanel(this.guestButton);
  // this.content.addPanel(this.tutorialButton);

  this.registration.addPanel(this.email);
  this.registration.addPanel(this.choosePassword);
  this.registration.addPanel(this.chooseUsername);
  this.registration.addPanel(this.chooseShip);
  this.registration.addPanel(this.errorContainer1);
  this.loginInputs['username'] = this.username;
  this.loginInputs['password'] = this.password;
  this.registrationInputs['choosePassword'] = this.choosePassword;
  this.registrationInputs['chooseUsername'] = this.chooseUsername;
  this.registrationInputs['email'] = this.email;

  this.registration.alpha = 0;

  //
  this.game.clock.events.add(100, function(){
    // this.game.emit('ui/showShips'); 
  }, this);
};

LoginPane.prototype._hover = function(button) {
  // console.log('in login over. button is: ', button)
};

LoginPane.prototype._unhover = function(button) {
  // console.log('in login out. button is: ', button)
  // console.log(button)
};

LoginPane.prototype._login = function(button) {
  // console.log('in login click. button is: ', button)
  // console.log(this.username)
  // this.game.emit('ui/showShips'); 
};

LoginPane.prototype._chooseShip = function(button) {
  var inputs = this.registrationInputs;
  this.regDirty = false;
  let colorMatrix = new pixi.filters.ColorMatrixFilter();
  colorMatrix.technicolor();

  console.log('IN CHOOSE SHIP');
  
  // colorMatrix.technicolor();
  // container.filters = [colorMatrix];
  // colorMatrix.contrast(2);
  for(var a in inputs){
    inputs[a].blur();

    if(inputs[a].text.length === 0 || inputs[a].text === ' '){
      // inputs[a].bg.filters = [new pixi.filters.BlurFilter()];


      // var colorMatrix = new pixi.filters.ColorMatrixFilter();
      inputs[a].bg.filters = [colorMatrix];
      // colorMatrix.technicolor();

      
      // this.registrationInputs['chooseUsername'].bg.filters = [colorMatrix];



      // colorMatrix.technicolor(8);
      // console.log('2 ', inputs[a].bg, this.registrationInputs)
      this.regDirty = true
      // inputs[a].bg.alpha = 1;
    } else {
      inputs[a].bg.filters = null;
    }
  }
  if(!this.regDirty){
    this.errorContainer1.alpha = 0;
    this.game.emit('ui/showShips');  
  } else {
    this.errorContainer1.alpha = 1; 
  }
};

LoginPane.prototype._playAsGuest = function(button) {
  let username = this.loginInputs['username'].label.font._text;

  this.guestButton.activated = !this.guestButton.activated;
  this.registration.alpha = 0;

  

  this.game.emit('ui/showShips', username); 

  for (var a in this.registrationInputs) {
    this.registrationInputs[a].blur();
  }
  for (var a in this.loginInputs) {
    this.loginInputs[a].blur();
  }
};

LoginPane.prototype._inputUp = function(){
}

LoginPane.prototype._tutorialMode = function(button) {
  var shipyard = this.parent.parent.parent,
      tutorialButton = this.tutorialButton;

  tutorialButton.activated = !tutorialButton.activated;
  shipyard.tutorialSelected = !shipyard.tutorialSelected;};

LoginPane.prototype._register = function(button) {
  var inputs = this.loginInputs;
  for(var a in inputs){
    inputs[a].blur();
  };

  this.registration.alpha = 1;
};

module.exports = LoginPane;
