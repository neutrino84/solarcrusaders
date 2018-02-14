
var engine = require('engine'),
    Panel = require('../../Panel'),
    Pane = require('../../components/Pane'),
    Label = require('../../components/Label'),
    ButtonIcon = require('../../components/ButtonIcon'),
    LoginPane = require('../../panes/LoginPane'),
    Layout = require('../../Layout');


function Shipyard(game) {
  this.socket = game.net.socket;
  this.loggedIn = false;
  var w = window,
      d = document;

  Pane.call(this, game, {
    constraint: Layout.CENTER,
    padding: [50, 50, 50, 50],
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
      fillAlpha: 0.05,
      color: 0x000c00
    }
  });

  this.textHeight = 150;
  this.shipContainersSize = 128;

  var text = new Label(this.game, {
    constraint: Layout.USE_PS_SIZE,
    text: {
      fontName: 'medium'
    },
    bg: false
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
  // this.resizeDynamic();

  this.topPane = new Pane(this.game, {
    constraint: Layout.TOP,
    width: this.game.width/2,
    height: this.game.height*2/10,
    layout: {
      type: 'flow',
      ax: Layout.LEFT, 
      ay: Layout.CENTER,
      direction: Layout.VERTICAL, 
      gap: 6
    },
    bg: {
      fillAlpha: 0.5,
      color: 0x000000
    }
  }); 
  this.middlePane = new Pane(this.game, {
    constraint: Layout.CENTER,
    width: this.game.width/2,
    height: this.game.height*4/10,
    layout: {
      type: 'border',
      gap: [5,5]
    },
    bg: {
      fillAlpha: 0.5,
      color: 0x000000
    }
  });
  this.bottomPane = new Pane(this.game, {
    constraint: Layout.BOTTOM,
    width: 100,
    height: this.game.height*3/10,
    layout: {
      type: 'flow',
      ax: Layout.LEFT, 
      ay: Layout.CENTER,
      direction: Layout.HORIZONTAL, 
      gap: 13
    },
    bg: {
      fillAlpha: 0.1,
      color: 0x000000
    }
  });

  // this.loginPlaceholder = new Pane(this.game, {
  //   constraint: Layout.CENTER,
  //   height: 90,
  //   width: this.game.width/2,
  //   layout: {
  //     type: 'stack',
  //   },
  //   bg: {
  //     fillAlpha: 1,
  //     color: 0xcc11b0
  //   }
  // });
  this.loginPlaceholder = new LoginPane(this.game);
  this.loginPlaceholder.create();

  this.chooseText = new Pane(this.game, {
    constraint: Layout.TOP,
    // height: 100,
    height: this.middlePane.psHeight*1/10,
    width: this.game.width/1.5,
    layout: {
      type: 'flow',
      ax: Layout.LEFT, 
      ay: Layout.CENTER,
      direction: Layout.VERTICAL
    },
    padding: [0, 30, 0, 0],
    bg: {
      fillAlpha: 0.0,
      color: 0xff0000
    }
  });


  this.shipPanels = new Pane(this.game, {
    constraint: Layout.BOTTOM,
    height: this.middlePane.psHeight*5/10,
    width: this.bg.width,
    padding: [0,30,0,0],
    // margin: [50, 0, 0, 0],
    layout: {
      type: 'list',
      columns: 3,
      gap: [2,2]
    },
    bg: {
      fillAlpha: 0,
      color: 0x002222
    },
    id: 'shipPanels'
  });
  // , submitButtonPanel = new Pane(this.game, {
  //   width: 128,
  //   height: 64,
  //   margin: [33,0,0,0],
  //   layout: {
  //     type: 'stack'
  //   },
  //   bg: {
  //     fillAlpha: 0.0,
  //     color: 0xAAAAAA
  //   }
  // }), 

  text.visible = true;
  text.text = 'Choose your ship';
  this.chooseText.addPanel(text);
  this.topPane.addPanel(this.loginPlaceholder);
  // this.topPane.addPanel(this.chooseText);
  this.topPane.id = 'topPane';
  this.bottomPane.id = 'bottomPane';
  // submitButtonPanel.id = 'submitButtonPanel';
  
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
  this.shipPanels.addPanel(spacerPanel);

  // this.bg.addPanel(this.chooseText);
  this.middlePane.addPanel(this.chooseText);
  this.middlePane.addPanel(this.shipPanels);

  this.bg.addPanel(this.topPane);
  // this.bg.addPanel(this.shipPanels);
  this.bg.addPanel(this.middlePane);
  this.bg.addPanel(this.bottomPane);

  this.addPanel(this.bg);

  this.fill();
  this.stats();
  // this.containers.push(submitButtonPanel)
  // this.shipPanels.addPanel(submitButtonPanel);
  // this.bg.alpha = 0;
  this.middlePane.alpha = 0;
  this.bottomPane.alpha = 0;

  this.game.on('ui/showShips', this._showShips, this)
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
  this.shipDescriptions = {
    'ubaidian-x01a' : {},
    'ubaidian-x01b' : {},
    'ubaidian-x01c' : {},
    'ubaidian-x01d' : {},
    'ubaidian-x01e' : {},
    'ubaidian-x01f' : {}
  };
  this.shipStats = {
    'ubaidian-x01a' : {},
    'ubaidian-x01b' : {},
    'ubaidian-x01c' : {},
    'ubaidian-x01d' : {},
    'ubaidian-x01e' : {},
    'ubaidian-x01f' : {}
  };
  this.shipAbilities = {
    'ubaidian-x01a' : {},
    'ubaidian-x01b' : {},
    'ubaidian-x01c' : {},
    'ubaidian-x01d' : {},
    'ubaidian-x01e' : {},
    'ubaidian-x01f' : {}
  };
  this.statsLeft = new Pane(this.game, {
    height: this.bottomPane.psHeight-25,
    width: 200,
    layout: {
      type: 'flow',
      ax: Layout.LEFT, 
      ay: Layout.TOP,
      direction: Layout.VERTICAL, 
      gap: 13
    },
    padding: [25,25,0,0],
    bg: {
      fillAlpha: 0.2,
      color: 0x000000,
      borderSize: 1.0,
      borderColor: 0xff00a4,
      borderAlpha: 0.0

    },
    id: 'statsLeft'
  });

  this.statsMid = new Pane(this.game, {
    height: this.bottomPane.psHeight-25,
    width: 200,
    layout: {
      type: 'flow',
      ax: Layout.LEFT, 
      ay: Layout.TOP,
      direction: Layout.VERTICAL, 
      gap: 13
    },
    padding: [25,25,0,0],
    bg: {
      fillAlpha: 0.2,
      color: 0x000000,
      borderSize: 1.0,
      borderColor: 0xff00a4,
      borderAlpha: 0.0

    },
    id: 'statsMid'
  });
  this.statsRight = new Pane(this.game, {
    height: this.bottomPane.psHeight-25,
    width: 200,
    layout: {
      type: 'flow',
      ax: Layout.LEFT, 
      ay: Layout.TOP,
      direction: Layout.VERTICAL, 
      gap: 13
    },
    padding: [25,25,0,0],
    bg: {
      fillAlpha: 0.2,
      color: 0x000000,
      borderSize: 1.0,
      borderColor: 0xff00a4,
      borderAlpha: 0.0

    },
    id: 'statsRight'
  });

  var translationArray = ['a','b','c','d','e','f'];
  for(var i = 0; i < 6; i++){
    for(var j = 0; j < 8; j++)
    this.shipDescriptions['ubaidian-x01' + translationArray[i]][j] = new Label(this.game, {
      constraint: Layout.USE_PS_SIZE,
      text: {
        fontName: 'medium'
      }, 
      bg: false
    });
  }
  for(var i = 0; i < 6; i++){
    for(var j = 0; j < 9; j++)
    this.shipStats['ubaidian-x01' + translationArray[i]][j] = new Label(this.game, {
      constraint: Layout.USE_PS_SIZE,
      text: {
        fontName: 'medium'
      }, 
      bg: false
    });
  }
  for(var i = 0; i < 6; i++){
    for(var j = 0; j < 6; j++)
    this.shipAbilities['ubaidian-x01' + translationArray[i]][j] = new Label(this.game, {
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

  this.shipDescriptions['ubaidian-x01a'][0].text = 'THE GREY-WOLF'
  this.shipDescriptions['ubaidian-x01a'][1].text = '           '
  this.shipDescriptions['ubaidian-x01a'][2].text = 'The foundation'
  this.shipDescriptions['ubaidian-x01a'][3].text = 'of the Ubadian'
  this.shipDescriptions['ubaidian-x01a'][4].text = 'fleet, the Grey Wolf'
  this.shipDescriptions['ubaidian-x01a'][5].text = 'is a battle hardened'
  this.shipDescriptions['ubaidian-x01a'][6].text = 'ship with mid range'
  this.shipDescriptions['ubaidian-x01a'][7].text = 'weapons and light armor'

  this.shipStats['ubaidian-x01a'][0].text = '-Stats-'
  this.shipStats['ubaidian-x01a'][1].text = ' '
  this.shipStats['ubaidian-x01a'][2].text = 'speed - 30'
  this.shipStats['ubaidian-x01a'][3].text = 'health - 100'
  this.shipStats['ubaidian-x01a'][4].text = 'healing - 0.5/sec'
  this.shipStats['ubaidian-x01a'][5].text = 'energy - 200'
  this.shipStats['ubaidian-x01a'][6].text = 'recharge - 1.2/sec'
  this.shipStats['ubaidian-x01a'][7].text = 'capacity - 1000'
  this.shipStats['ubaidian-x01a'][8].text = 'armor - 0.03'

  this.shipAbilities['ubaidian-x01a'][0].text = '-Special-'
  this.shipAbilities['ubaidian-x01a'][1].text = ' '
  this.shipAbilities['ubaidian-x01a'][2].text = 'Respawn time reduced'
  this.shipAbilities['ubaidian-x01a'][3].text = 'by 3 seconds.'
  this.shipAbilities['ubaidian-x01a'][4].text = ' '

  ///

  this.shipDescriptions['ubaidian-x01b'][0].text = 'THE HAMMER-HEAD'
  this.shipDescriptions['ubaidian-x01b'][1].text = '           '
  this.shipDescriptions['ubaidian-x01b'][2].text = 'With high armor'
  this.shipDescriptions['ubaidian-x01b'][3].text = 'and several missile'
  this.shipDescriptions['ubaidian-x01b'][4].text = 'bays, the Hammer Head'
  this.shipDescriptions['ubaidian-x01b'][5].text = 'is the vanguard'
  this.shipDescriptions['ubaidian-x01b'][6].text = 'of the Ubadian fleet'
  this.shipDescriptions['ubaidian-x01b'][7].text = ' '

  this.shipStats['ubaidian-x01b'][0].text = '-Stats-'
  this.shipStats['ubaidian-x01b'][1].text = ' '
  this.shipStats['ubaidian-x01b'][2].text = 'speed - 29'
  this.shipStats['ubaidian-x01b'][3].text = 'health - 200'
  this.shipStats['ubaidian-x01b'][4].text = 'healing - 0.21/sec'
  this.shipStats['ubaidian-x01b'][5].text = 'energy - 190'
  this.shipStats['ubaidian-x01b'][6].text = 'recharge - 1/sec'
  this.shipStats['ubaidian-x01b'][7].text = 'capacity - 1100'
  this.shipStats['ubaidian-x01b'][8].text = 'armor - 0.01'

  this.shipAbilities['ubaidian-x01b'][0].text = '-Special-'
  this.shipAbilities['ubaidian-x01b'][1].text = ' '
  this.shipAbilities['ubaidian-x01b'][2].text = 'Reduced cooldown'
  this.shipAbilities['ubaidian-x01b'][3].text = 'periods for abilities'
  this.shipAbilities['ubaidian-x01b'][4].text = 'and commands'

  ///

  this.shipDescriptions['ubaidian-x01c'][0].text = 'THE STAR-FIRE'
  this.shipDescriptions['ubaidian-x01c'][1].text = ' '
  this.shipDescriptions['ubaidian-x01c'][2].text = 'With high rates'
  this.shipDescriptions['ubaidian-x01c'][3].text = 'of energy recharge'
  this.shipDescriptions['ubaidian-x01c'][4].text = 'and healing, the Star Fire'
  this.shipDescriptions['ubaidian-x01c'][5].text = 'can outlast most ships'
  this.shipDescriptions['ubaidian-x01c'][6].text = 'in prolonged combat'
  this.shipDescriptions['ubaidian-x01c'][7].text = ' '

  this.shipStats['ubaidian-x01c'][0].text = '-Stats-'
  this.shipStats['ubaidian-x01c'][1].text = ' '
  this.shipStats['ubaidian-x01c'][2].text = 'speed - 30'
  this.shipStats['ubaidian-x01c'][3].text = 'health - 120'
  this.shipStats['ubaidian-x01c'][4].text = 'healing - 1/sec'
  this.shipStats['ubaidian-x01c'][5].text = 'energy - 130'
  this.shipStats['ubaidian-x01c'][6].text = 'recharge - 2/sec'
  this.shipStats['ubaidian-x01c'][7].text = 'capacity - 800'
  this.shipStats['ubaidian-x01c'][8].text = 'armor - 0.02'

  this.shipAbilities['ubaidian-x01c'][0].text = '-Special-'
  this.shipAbilities['ubaidian-x01c'][1].text = ' '
  this.shipAbilities['ubaidian-x01c'][2].text = 'Does increased damage'
  this.shipAbilities['ubaidian-x01c'][3].text = 'to larger ships'
  this.shipAbilities['ubaidian-x01c'][4].text = ' '

  ///

  this.shipDescriptions['ubaidian-x01d'][0].text = 'THE PIG-NOSE'
  this.shipDescriptions['ubaidian-x01d'][1].text = ' '
  this.shipDescriptions['ubaidian-x01d'][2].text = 'A militarized mining ship'
  this.shipDescriptions['ubaidian-x01d'][3].text = 'the Pig Nose has massive'
  this.shipDescriptions['ubaidian-x01d'][4].text = 'energy resevoirs and'
  this.shipDescriptions['ubaidian-x01d'][5].text = 'is a powerful'
  this.shipDescriptions['ubaidian-x01d'][6].text = 'support ship'
  this.shipDescriptions['ubaidian-x01d'][7].text = ' '

  this.shipStats['ubaidian-x01d'][0].text = '-Stats-'
  this.shipStats['ubaidian-x01d'][1].text = ' '
  this.shipStats['ubaidian-x01d'][2].text = 'speed - 30'
  this.shipStats['ubaidian-x01d'][3].text = 'health - 150'
  this.shipStats['ubaidian-x01d'][4].text = 'healing - 0.5/sec'
  this.shipStats['ubaidian-x01d'][5].text = 'energy - 280'
  this.shipStats['ubaidian-x01d'][6].text = 'recharge - 1/sec'
  this.shipStats['ubaidian-x01d'][7].text = 'capacity - 1800'
  this.shipStats['ubaidian-x01d'][8].text = 'armor - 0.01'

  this.shipAbilities['ubaidian-x01d'][0].text = '-Special-'
  this.shipAbilities['ubaidian-x01d'][1].text = ' '
  this.shipAbilities['ubaidian-x01d'][2].text = 'Squadron ships'
  this.shipAbilities['ubaidian-x01d'][3].text = 'charge half as much '
  this.shipAbilities['ubaidian-x01d'][4].text = ' '

  ///

  this.shipDescriptions['ubaidian-x01e'][0].text = 'THE OLD-LADY'
  this.shipDescriptions['ubaidian-x01e'][1].text = ' '
  this.shipDescriptions['ubaidian-x01e'][2].text = 'Once reserved for escorting'
  this.shipDescriptions['ubaidian-x01e'][3].text = 'the imperial family,'
  this.shipDescriptions['ubaidian-x01e'][4].text = 'the old lady has high'
  this.shipDescriptions['ubaidian-x01e'][5].text = 'health and heavy weapons'
  this.shipDescriptions['ubaidian-x01e'][6].text = ' '
  this.shipDescriptions['ubaidian-x01e'][7].text = ' '

  this.shipStats['ubaidian-x01e'][0].text = '-Stats-'
  this.shipStats['ubaidian-x01e'][1].text = ' '
  this.shipStats['ubaidian-x01e'][2].text = 'speed - 28'
  this.shipStats['ubaidian-x01e'][3].text = 'health - 110'
  this.shipStats['ubaidian-x01e'][4].text = 'healing - 0.6/sec'
  this.shipStats['ubaidian-x01e'][5].text = 'energy - 200'
  this.shipStats['ubaidian-x01e'][6].text = 'recharge - 1/sec'
  this.shipStats['ubaidian-x01e'][7].text = 'capacity - 1000'
  this.shipStats['ubaidian-x01e'][8].text = 'armor - 0.025'

  this.shipAbilities['ubaidian-x01e'][0].text = '-Special-'
  this.shipAbilities['ubaidian-x01e'][1].text = ' '
  this.shipAbilities['ubaidian-x01e'][2].text = 'Does increased damage'
  this.shipAbilities['ubaidian-x01e'][3].text = 'to smaller ships'
  this.shipAbilities['ubaidian-x01e'][4].text = ' '

  ///

  this.shipDescriptions['ubaidian-x01f'][0].text = 'THE BLUE-HAWK'
  this.shipDescriptions['ubaidian-x01f'][1].text = ' '
  this.shipDescriptions['ubaidian-x01f'][2].text = 'Acting as scouts'
  this.shipDescriptions['ubaidian-x01f'][3].text = 'for the Ubadian fleet,'
  this.shipDescriptions['ubaidian-x01f'][4].text = 'the blue hawk has a high'
  this.shipDescriptions['ubaidian-x01f'][5].text = 'top speed and increased'
  this.shipDescriptions['ubaidian-x01f'][6].text = 'sensor range'
  this.shipDescriptions['ubaidian-x01f'][7].text = ' '

  this.shipStats['ubaidian-x01f'][0].text = '-Stats-'
  this.shipStats['ubaidian-x01f'][1].text = ' '
  this.shipStats['ubaidian-x01f'][2].text = 'speed - 33'
  this.shipStats['ubaidian-x01f'][3].text = 'health - 100'
  this.shipStats['ubaidian-x01f'][4].text = 'healing - 0.4/sec'
  this.shipStats['ubaidian-x01f'][5].text = 'energy - 190'
  this.shipStats['ubaidian-x01f'][6].text = 'recharge - 1.2/sec'
  this.shipStats['ubaidian-x01f'][7].text = 'capacity - 700'
  this.shipStats['ubaidian-x01f'][8].text = 'armor - 0.01'

  this.shipAbilities['ubaidian-x01f'][0].text = '-Special-'
  this.shipAbilities['ubaidian-x01f'][1].text = ' '
  this.shipAbilities['ubaidian-x01f'][2].text = 'Large field radar'
  this.shipAbilities['ubaidian-x01f'][3].text = ''
  this.shipAbilities['ubaidian-x01f'][4].text = ' '

  for(var i = 0; i < this.bg.panels.length; i++){
    if(this.bg.panels[i].id === 'bottomPane'){
      var bottomPane = this.bg.panels[i];
      bottomPane.alpha = -1;
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
  if(!this.loggedIn){return}
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
  for(var i = 0; i < ships.length-1; i++){
    if(ships[i].children[1].id !== ship){
      // console.log('- ', ships[i])
      ships[i].alpha = ships[i].alpha - 0.7;
    }
  }
  // for(var i = 0; i < this.bg.panels.length; i++){
  //   if(this.bg.panels[i].id === 'bottomPane'){
  //     var bottomPane = this.bg.panels[i];

      this.bottomPane.removeAll();
      this.statsLeft.removeAll();
      this.statsMid.removeAll();
      this.statsRight.removeAll();

      this.bottomPane.addPanel(this.statsLeft);
      this.bottomPane.addPanel(this.statsMid);
      this.bottomPane.addPanel(this.statsRight);

      this.statsLeft.addPanel(this.shipDescriptions[ship][0])
      this.statsLeft.addPanel(this.shipDescriptions[ship][1])
      this.statsLeft.addPanel(this.shipDescriptions[ship][2])
      this.statsLeft.addPanel(this.shipDescriptions[ship][3])
      this.statsLeft.addPanel(this.shipDescriptions[ship][4])
      this.statsLeft.addPanel(this.shipDescriptions[ship][5])
      this.statsLeft.addPanel(this.shipDescriptions[ship][6])
      this.statsLeft.addPanel(this.shipDescriptions[ship][7])

      this.statsMid.addPanel(this.shipStats[ship][0])
      this.statsMid.addPanel(this.shipStats[ship][1])
      this.statsMid.addPanel(this.shipStats[ship][2])
      this.statsMid.addPanel(this.shipStats[ship][3])
      this.statsMid.addPanel(this.shipStats[ship][4])
      this.statsMid.addPanel(this.shipStats[ship][5])
      this.statsMid.addPanel(this.shipStats[ship][6])
      this.statsMid.addPanel(this.shipStats[ship][7])
      this.statsMid.addPanel(this.shipStats[ship][8])

      this.statsRight.addPanel(this.shipAbilities[ship][0])
      this.statsRight.addPanel(this.shipAbilities[ship][1])
      this.statsRight.addPanel(this.shipAbilities[ship][2])
      this.statsRight.addPanel(this.shipAbilities[ship][3])
      this.statsRight.addPanel(this.shipAbilities[ship][4])

      this.bottomPane.invalidate();

      // bottomPane.alpha = bottomPane.alpha * -1;

      // for(var i = 0; i < this.shipPanels.panels.length; i++){
      //   if(this.shipPanels.panels[i].id === 'submitButtonPanel'){
      //     this.shipPanels.panels[i].alpha = this.shipPanels.panels[i].alpha * -1;
      //   }
      // };
  //   }
  // }
};

Shipyard.prototype._select= function(button){
  var header = this.parent.panels[0],
      containers = this.containers;

  for(var i = 0; i < 6; i++){
    containers[i].panels[0].bg.removeListener('inputOver', this._hover, this)
    containers[i].panels[0].bg.removeListener('inputOut', this._unhover, this)
    containers[i].panels[0].bg.removeListener('inputDown', this._select, this)
  }

  this.socket.emit('user/ship', button.parent.id, this.game.auth.socket.id)
  this.game.emit('shipyard/hover', 'selectionSFX2')
  this.game.emit('user/shipSelected')

  this.selectedSequence1 = this.game.tweens.create(this);
  this.selectedSequence1.to({alpha : 0}, 3000);
  this.selectedSequence1.delay(1000);
  this.selectedSequence1.start();

  this.selectedSequence2 = this.game.tweens.create(this.parent.panels[0]);
  this.selectedSequence2.to({alpha : 1}, 5000);
  this.selectedSequence2.start();

  this.selectedSequence1.on('complete', function() {
    this.destroy()
  }, this);

  // var scope = this;
  // this.alpha = 0;

  // this.game.clock.events.loop(100, fadeInHeader = function(){
  //   scope.parent.panels[0].alpha += 0.025;
  //   // scope.alpha -= 0.1;
  //   if(scope.parent.panels[0].alpha >= 1){
  //     for(var i = 0; i < this.game.clock.events.events.length; i++){
  //       if(scope.game.clock.events.events[i].callback.name === 'fadeInHeader'){
  //         scope.game.clock.events.remove(scope.game.clock.events.events[i]);
  //       }
  //     }
  //     scope.destroy()
  //   }
  // }, this);

};

Shipyard.prototype._unhover = function(button) {
  if(!this.loggedIn){return}
  var ships = this.shipPanels.panels,
      ship = button.parent.id;

  for(var i = 0; i < ships.length-1; i++){
    if(ships[i].children[1].id !== ship){
      ships[i].alpha = ships[i].alpha + 0.7;
    }
  }
  for(var i = 0; i < this.bg.panels.length; i++){
    if(this.bg.panels[i].id === 'bottomPane'){
      var bottomPane = this.bg.panels[i];

      bottomPane.removeAll()
      // bottomPane.alpha = bottomPane.alpha * -1;
      bottomPane.invalidate();
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
      // this.shipContainersSize = 80;
      // if(x < 860){
      //   this.shipContainersSize = 50;
      // }
    }
  } else {
    this.textHeight = 175;
  };
};

Shipyard.prototype.show = function() {
};

Shipyard.prototype._showShips = function() {
  this.loggedIn = true;
  this.middlePane.alpha = 1;
  this.bottomPane.alpha = 1;
};

Shipyard.prototype.hide = function() {

};

module.exports = Shipyard;
