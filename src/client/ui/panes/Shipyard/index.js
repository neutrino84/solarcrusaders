
var Panel = require('../../Panel'),
    Pane = require('../../components/Pane'),
    Label = require('../../components/Label'),
    ButtonIcon = require('../../components/ButtonIcon'),
    Layout = require('../../Layout');

function Shipyard(game) {
  this.socket = game.net.socket;
  var w = window,
      d = document;
  //     e = d.documentElement,
  //     g = d.getElementsByTagName('body')[0],
  //     x = w.innerWidth || e.clientWidth || g.clientWidth,
  //     y = w.innerHeight|| e.clientHeight|| g.clientHeight, textHeight;
  this.textHeight = 175;
  this.shipContainersSize = 128;


  this.resizeDynamic();
  

  w.onresize = function(){
    var w = window,
        d = document,
        e = d.documentElement,
        g = d.getElementsByTagName('body')[0],
        x = w.innerWidth || e.clientWidth || g.clientWidth,
        y = w.innerHeight|| e.clientHeight|| g.clientHeight;
    if(x < 1026 || y < 800){
      this.textHeight = 100;
      if(x < 900 || y < 800){
        this.shipContainersSize = 110;
        if(x < 860){
          this.shipContainersSize = 80;
        }
      }
    } else {
      this.textHeight = 175;
    };
  };

  // if(x < 800 || y < 800){
  //   textHeight = 100;
  //   if(x < 1026){
  //     this.shipContainersSize = 100;
  //     if(x < 860){
  //       this.shipContainersSize = 80;
  //     }
  //   }
  // } else {
  //   textHeight = 175;
  // };


  Pane.call(this, game, {
    constraint: Layout.CENTER,
    padding: [100, 100, 100, 100],
    layout: {
      type: 'stack'
    }
  });
  this.bg = new Pane(this.game, {
    padding: [25],
    layout: {
      type: 'border',
      gap: [5,5]
    },
    bg: {
      fillAlpha: 0.95,
      color: 0x000000
    }
  });
  this.shipPanels = new Pane(this.game, {
    constraint: Layout.CENTER,
    height: 200,
    layout: {
      type: 'list',
      columns: 3,
      gap: [2,2]
    },
    bg: {
      fillAlpha: 0,
      color: 0x002222
    }
  });
  this.shipPanels.id = 'shipPanels';

  var text = new Label(this.game, {
    constraint: Layout.USE_PS_SIZE,
    text: {
      fontName: 'medium'
    },
    bg: false
  }), textPane = new Pane(this.game, {
    constraint: Layout.TOP,
    width: this.game.width/2,
    height: this.textHeight,
    layout: {
      type: 'stack'
    },
    bg: {
      fillAlpha: 0.0,
      color: 0xff00bb
    }
  }), statsPane = new Pane(this.game, {
    constraint: Layout.BOTTOM,
    width: 100,
    height: this.game.height/4,
    layout: {
      type: 'flow',
      ax: Layout.LEFT, 
      ay: Layout.CENTER,
      direction: Layout.VERTICAL, 
      gap: 13
    },
    bg: {
      fillAlpha: 0.1,
      color: 0xff00bb
    }
  }), submitButtonPanel = new Pane(this.game, {
    width: 128,
    height: 64,
    margin: [33,0,0,0],
    layout: {
      type: 'stack'
    },
    bg: {
      fillAlpha: 0.0,
      color: 0xAAAAAA
    }
  }), spacerPanel = new Pane(this.game, {
    width: 20,
    height: 128,
    layout: {
      type: 'stack'
    },
    bg: {
      fillAlpha: 0.0,
      color: 0xAAAAAA
    }
  });

  text.visible = true;
  text.text = 'Choose your ship';
  textPane.addPanel(text);
  textPane.id = 'textPane';
  statsPane.id = 'statsPane';
  submitButtonPanel.id = 'submitButtonPanel';
  

  // generate containers
  this.containers = [];
  for(var i=0; i<6; i++) {
    this.containers.push(
      new Pane(this.game, {
        width: this.shipContainersSize,
        height: this.shipContainersSize,
        layout: {
          type: 'stack'
        },
        bg: {
          fillAlpha: 0.0,
          color: 0xAAAAAA
        }
      })
    );
    this.shipPanels.addPanel(this.containers[i]);
  }
  // this.containers.push(submitButtonPanel)
  this.shipPanels.addPanel(spacerPanel);
  this.shipPanels.addPanel(submitButtonPanel);

  this.bg.addPanel(textPane);
  this.bg.addPanel(this.shipPanels);
  this.bg.addPanel(statsPane);

  this.addPanel(this.bg);

  this.fill();
  this.stats();
};

Shipyard.prototype = Object.create(Pane.prototype);
Shipyard.prototype.constructor = Shipyard;

Shipyard.prototype.create = function(ship) {
  var game = this.game,
  label = new Label(game, {
    constraint: Layout.USE_PS_SIZE,
    text: {
      fontName: 'medium'
    },
    bg: false
  }),
  button = new ButtonIcon(game, {
    padding: [0, 0, 2, 0],
    bg: {
      color: 0x009339,
      alpha: {
        enabled: 0.0,
        disabled: 0.0,
        over: 0.1,
        down: 0.85,
        up: 0.1
      }
    },
    icon: {
      key: 'texture-atlas',
      frame: ship + '-hires.png',
      width: this.shipContainersSize,
      height: this.shipContainersSize,
      bg: {
        fillAlpha: 0.0,
        color: 0x000000
      },
      alpha: {
        enabled: 1.0,
        disabled: 0.5,
        over: 1.0,
        down: 1.0,
        up: 0.9
      },
      tint: {
        enabled: 0xFFFFFF,
        disabled: 0xFF0000,
        over: 0xFFFFFF,
        down: 0xFFFFFF,
        up: 0xFFFFFF
      }
    }
  });
  button.label = label;
  button.label.visible = false;
  button.addPanel(label);

  return button;
};

// add bg-slide-ubaidian-256.png

Shipyard.prototype.stats = function(){
  this.shipStats = {
    'ubaidian-x01a' : {},
    'ubaidian-x01b' : {},
    'ubaidian-x01c' : {},
    'ubaidian-x01d' : {},
    'ubaidian-x01e' : {},
    'ubaidian-x01f' : {}
  };
  var translationArray = ['a','b','c','d','e','f'];
  for(var i = 0; i < 6; i++){
    for(var j = 0; j < 8; j++)
    this.shipStats['ubaidian-x01' + translationArray[i]][j] = new Label(this.game, {
      constraint: Layout.USE_PS_SIZE,
      text: {
        fontName: 'medium'
      }, 
      bg: false
    });
  }
  var spacer = new Label(this.game, {
      constraint: Layout.STRETCH,
      text: {
        fontName: 'medium'
      },
      bg: false
    }); 

  spacer.text = '                                                                      '

  this.shipStats['ubaidian-x01a'][0].text = '       ~grey-wolf~'
  this.shipStats['ubaidian-x01a'][1].text = '       speed - 30'
  this.shipStats['ubaidian-x01a'][2].text = '       health - 100'
  this.shipStats['ubaidian-x01a'][3].text = '       healing - 0.5/sec'
  this.shipStats['ubaidian-x01a'][4].text = '       energy - 200'
  this.shipStats['ubaidian-x01a'][5].text = '       recharge - 1.2/sec'
  this.shipStats['ubaidian-x01a'][6].text = '       capacity - 1000'
  this.shipStats['ubaidian-x01a'][7].text = '       armor - 0.03'

  this.shipStats['ubaidian-x01b'][0].text = '       ~hammer-head~'
  this.shipStats['ubaidian-x01b'][1].text = '       speed - 29'
  this.shipStats['ubaidian-x01b'][2].text = '       health - 200'
  this.shipStats['ubaidian-x01b'][3].text = '       healing - 0.21/sec'
  this.shipStats['ubaidian-x01b'][4].text = '       energy - 190'
  this.shipStats['ubaidian-x01b'][5].text = '       recharge - 1/sec'
  this.shipStats['ubaidian-x01b'][6].text = '       capacity - 1100'
  this.shipStats['ubaidian-x01b'][7].text = '       armor - 0.01'

  this.shipStats['ubaidian-x01c'][0].text = '       ~star-fire~'
  this.shipStats['ubaidian-x01c'][1].text = '       speed - 30'
  this.shipStats['ubaidian-x01c'][2].text = '       health - 120'
  this.shipStats['ubaidian-x01c'][3].text = '       healing - 0.5/sec'
  this.shipStats['ubaidian-x01c'][4].text = '       energy - 130'
  this.shipStats['ubaidian-x01c'][5].text = '       recharge - 1.7/sec'
  this.shipStats['ubaidian-x01c'][6].text = '       capacity - 800'
  this.shipStats['ubaidian-x01c'][7].text = '       armor - 0.02'

  this.shipStats['ubaidian-x01d'][0].text = '       ~pig-nose~'
  this.shipStats['ubaidian-x01d'][1].text = '       speed - 30'
  this.shipStats['ubaidian-x01d'][2].text = '       health - 150'
  this.shipStats['ubaidian-x01d'][3].text = '       healing - 0.5/sec'
  this.shipStats['ubaidian-x01d'][4].text = '       energy - 220'
  this.shipStats['ubaidian-x01d'][5].text = '       recharge - 1/sec'
  this.shipStats['ubaidian-x01d'][6].text = '       capacity - 1800'
  this.shipStats['ubaidian-x01d'][7].text = '       armor - 0.01'

  this.shipStats['ubaidian-x01e'][0].text = '       ~old-lady~'
  this.shipStats['ubaidian-x01e'][1].text = '       speed - 28'
  this.shipStats['ubaidian-x01e'][2].text = '       health - 110'
  this.shipStats['ubaidian-x01e'][3].text = '       healing - 0.6/sec'
  this.shipStats['ubaidian-x01e'][4].text = '       energy - 200'
  this.shipStats['ubaidian-x01e'][5].text = '       recharge - 1/sec'
  this.shipStats['ubaidian-x01e'][6].text = '       capacity - 1000'
  this.shipStats['ubaidian-x01e'][7].text = '       armor - 0.025'

  this.shipStats['ubaidian-x01f'][0].text = '       ~blue-hawk~'
  this.shipStats['ubaidian-x01f'][1].text = '       speed - 33'
  this.shipStats['ubaidian-x01f'][2].text = '       health - 100'
  this.shipStats['ubaidian-x01f'][3].text = '       healing - 0.4/sec'
  this.shipStats['ubaidian-x01f'][4].text = '       energy - 190'
  this.shipStats['ubaidian-x01f'][5].text = '       recharge - 1.2/sec'
  this.shipStats['ubaidian-x01f'][6].text = '       capacity - 700'
  this.shipStats['ubaidian-x01f'][7].text = '       armor - 0.01'

  for(var i = 0; i < this.bg.panels.length; i++){
    if(this.bg.panels[i].id === 'statsPane'){
      var statsPane = this.bg.panels[i];
      statsPane.alpha = -1;
    }
  }
  this.invalidate();
};

Shipyard.prototype.fill = function() {
  var ships = ['ubaidian-x01a','ubaidian-x01b','ubaidian-x01c','ubaidian-x01d','ubaidian-x01e','ubaidian-x01f'],
      containers = this.containers, button, selectButton;


  for(var i = 0; i < 6; i++){
    button = this.create(ships[i]);
    button.id = ships[i];
    button.bg.on('inputOver', this._hover, this);
    button.bg.on('inputOut', this._unhover, this);
    button.bg.on('inputDown', this._select, this);
    button.start();
    containers[i].addPanel(button);
  }

  selectLabel = new Label(this.game, {
    constraint: Layout.USE_PS_SIZE,
    text: {
      fontName: 'medium'
    },
    bg: false
  }),
  selectButton = new ButtonIcon(this.game, {
    padding: [20,20,20,20],
    bg: {
      color: 0x000000,
      alpha: {
        enabled: 0.0,
        disabled: 0.0,
        over: 2,
        down: 0.85,
        up: 0.85
      }
    },
    icon: {
      key: 'texture-atlas',
      frame: 'item-system-targeting.png',
      width: 128,
      height: 64,
      bg: {
        fillAlpha: 0.0,
        color: 0x000000
      },
      alpha: {
        enabled: 1.0,
        disabled: 0.5,
        over: 2,
        down: 1.0,
        up: 0.9
      },
      tint: {
        enabled: 0xFFFFFF,
        disabled: 0xFF0000,
        over: 0x000000,
        down: 0xFFFFFF,
        up: 0xFFFFFF
      }
    }
  });
  selectLabel.text = 'select';
  selectButton.label = selectLabel;
  selectButton.label.visible = true;
  selectButton.addPanel(selectLabel);
  selectButton.start();
  for(var i = 0; i < this.shipPanels.panels.length; i++){
    if(this.shipPanels.panels[i].id === 'submitButtonPanel'){
      this.shipPanels.panels[i].addPanel(selectButton)
      this.shipPanels.panels[i].alpha = -1;
    }
  };
};
Shipyard.prototype._hover = function(button) {
  var ships = this.shipPanels.panels,
      ship = button.parent.id,
      spacer = new Label(this.game, {
        constraint: Layout.USE_PS_SIZE,
        text: {
          fontName: 'medium'
        },
        bg: false
      }); 
  this.game.emit('shipyard/hover', 'selectionSFX1')
  for(var i = 0; i < ships.length-2; i++){
    if(ships[i].children[1].id !== ship){
      ships[i].alpha = ships[i].alpha - 0.7;
    }
  }
  for(var i = 0; i < this.bg.panels.length; i++){
    if(this.bg.panels[i].id === 'statsPane'){
      var statsPane = this.bg.panels[i];

      statsPane.removeAll()

      statsPane.addPanel(this.shipStats[ship][0])
      statsPane.addPanel(this.shipStats[ship][1])
      statsPane.addPanel(this.shipStats[ship][2])
      statsPane.addPanel(this.shipStats[ship][3])
      statsPane.addPanel(this.shipStats[ship][4])
      statsPane.addPanel(this.shipStats[ship][5])
      statsPane.addPanel(this.shipStats[ship][6])
      statsPane.addPanel(this.shipStats[ship][7])

      statsPane.invalidate();

      statsPane.alpha = statsPane.alpha * -1;

      // for(var i = 0; i < this.shipPanels.panels.length; i++){
      //   if(this.shipPanels.panels[i].id === 'submitButtonPanel'){
      //     this.shipPanels.panels[i].alpha = this.shipPanels.panels[i].alpha * -1;
      //   }
      // };
    }
  }
};

Shipyard.prototype._select= function(button){
  this.socket.emit('user/shipSelected', button.parent.id, this.game.auth.socket.id)
  this.game.emit('shipyard/hover', 'selectionSFX2')
  this.game.emit('user/shipSelected')
  this.destroy()
};

Shipyard.prototype._unhover = function(button) {
  var ships = this.shipPanels.panels,
      ship = button.parent.id;

  for(var i = 0; i < ships.length-2; i++){
    if(ships[i].children[1].id !== ship){
      ships[i].alpha = ships[i].alpha + 0.7;
    }
  }
  for(var i = 0; i < this.bg.panels.length; i++){
    if(this.bg.panels[i].id === 'statsPane'){
      var statsPane = this.bg.panels[i];

      statsPane.removeAll()
      statsPane.alpha = statsPane.alpha * -1;
      statsPane.invalidate();
    }
  };
};

Shipyard.prototype.resizeDynamic = function() {
  var w = window,
      d = document,
      e = d.documentElement,
      g = d.getElementsByTagName('body')[0],
      x = w.innerWidth || e.clientWidth || g.clientWidth,
      y = w.innerHeight|| e.clientHeight|| g.clientHeight;
  if(x < 1026 || y < 800){
    this.textHeight = 100;
    if(x < 900 || y < 800){
      this.shipContainersSize = 110;
      if(x < 860){
        this.shipContainersSize = 80;
      }
    }
  } else {
    this.textHeight = 175;
  };
};

Shipyard.prototype.show = function() {
};

Shipyard.prototype.hide = function() {

};

module.exports = Shipyard;
