
var Panel = require('../../Panel'),
    Pane = require('../../components/Pane'),
    Label = require('../../components/Label'),
    ButtonIcon = require('../../components/ButtonIcon'),
    Layout = require('../../Layout');

function Shipyard(game) {
  Pane.call(this, game, {
    constraint: Layout.CENTER,
    padding: [125, 100, 100, 100],
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
      fillAlpha: 0.75,
      color: 0x000000
    }
  });
  this.shipPanels = new Pane(this.game, {
    constraint: Layout.CENTER,
    height: 100,
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
    height: 50,
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
      ay: Layout.BOTTOM,
      direction: Layout.VERTICAL, 
      gap: 4
    },
    bg: {
      fillAlpha: 0.2,
      color: 0xff00bb
    }
  });
  text.visible = true;
  text.text = 'Choose your ship';
  textPane.addPanel(text);
  textPane.id = 'textPane';
  statsPane.id = 'statsPane';
  
  

  // generate containers
  this.containers = [];
  for(var i=0; i<6; i++) {
    this.containers.push(
      new Pane(this.game, {
        // constraint: Layout.CENTER,
        width: 128,
        height: 128,
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
  this.bg.addPanel(textPane);
  this.bg.addPanel(this.shipPanels);
  this.bg.addPanel(statsPane);


  console.log(this.containers)

  this.addPanel(this.bg);

  this.fill();
  this.stats();
};

Shipyard.prototype = Object.create(Pane.prototype);
Shipyard.prototype.constructor = Shipyard;

Shipyard.prototype.create = function(ship) {
  // console.log('got to create function, this.bg is ', this.bg)
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
      color: 0x009999,
      alpha: {
        enabled: 0.0,
        disabled: 0.0,
        over: 0.1,
        down: 0.85,
        up: 0.85
      }
    },
    icon: {
      key: 'texture-atlas',
      frame: ship + '.png',
      width: 128,
      height: 128,
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
    for(var j = 0; j < 7; j++)
    this.shipStats['ubaidian-x01' + translationArray[i]][j] = new Label(this.game, {
      constraint: Layout.USE_PS_SIZE,
      text: {
        fontName: 'medium'
      }, 
      bg: false
    });
  }
  // console.log('this.shipStats is ', this.shipStats)
  var spacer = new Label(this.game, {
      constraint: Layout.STRETCH,
      text: {
        fontName: 'medium'
      },
      bg: false
    }); 
    //   ubaidian_x01a1 = new Label(this.game, {
    //   constraint: Layout.USE_PS_SIZE,
    //   text: {
    //     fontName: 'medium'
    //   }, 
    //   bg: false
    // }),
    //   ubaidian_x01a2 = new Label(this.game, {
    //   constraint: Layout.USE_PS_SIZE,
    //   text: {
    //     fontName: 'medium'
    //   },
    //   bg: false
    // }),
    //   ubaidian_x01a3 = new Label(this.game, {
    //   constraint: Layout.USE_PS_SIZE,
    //   text: {
    //     fontName: 'medium'
    //   },
    //   bg: false
    // }),
    //   ubaidian_x01a4 = new Label(this.game, {
    //   constraint: Layout.USE_PS_SIZE,
    //   text: {
    //     fontName: 'medium'
    //   },
    //   bg: false
    // }),
    //   ubaidian_x01a5 = new Label(this.game, {
    //   constraint: Layout.USE_PS_SIZE,
    //   text: {
    //     fontName: 'medium'
    //   },
    //   bg: false
    // }),
    //   ubaidian_x01a6 = new Label(this.game, {
    //   constraint: Layout.USE_PS_SIZE,
    //   text: {
    //     fontName: 'medium'
    //   },
    //   bg: false
    // }),
    //   ubaidian_x01a7 = new Label(this.game, {
    //   constraint: Layout.USE_PS_SIZE,
    //   text: {
    //     fontName: 'medium'
    //   },
    //   bg: false
    // }),
    //   ubaidian_x01c = new Label(this.game, {
    //   constraint: Layout.USE_PS_SIZE,
    //   text: {
    //     fontName: 'medium'
    //   },
    //   bg: false
    // }),
    //   ubaidian_x01d = new Label(this.game, {
    //   constraint: Layout.USE_PS_SIZE,
    //   text: {
    //     fontName: 'medium'
    //   },
    //   bg: false
    // }),
    //   ubaidian_x01e = new Label(this.game, {
    //   constraint: Layout.USE_PS_SIZE,
    //   text: {
    //     fontName: 'medium'
    //   },
    //   bg: false
    // }),
    //   ubaidian_x01f = new Label(this.game, {
    //   constraint: Layout.USE_PS_SIZE,
    //   text: {
    //     fontName: 'medium'
    //   },
    //   bg: false
    // });
  spacer.text = '                                                                      '

  this.shipStats['ubaidian-x01a'][0].text = '       ubaidian-x01a "grey-wolf"'
  this.shipStats['ubaidian-x01a'][1].text = '       speed - 30               '
  this.shipStats['ubaidian-x01a'][2].text = '       health - 100             '
  this.shipStats['ubaidian-x01a'][3].text = '       energy - 200             '
  this.shipStats['ubaidian-x01a'][4].text = '       capacity - 1000                                                        '
  this.shipStats['ubaidian-x01a'][5].text = '       healing - 0.5/sec                                                      '
  this.shipStats['ubaidian-x01a'][6].text = '       armor - 0.03                                                           '

  this.shipStats['ubaidian-x01b'][0].text = '       ubaidian-x01b "hammer-head"                                              '
  this.shipStats['ubaidian-x01b'][1].text = '       speed - 29                                                             '
  this.shipStats['ubaidian-x01b'][2].text = '       health - 200                                                           '
  this.shipStats['ubaidian-x01b'][3].text = '       energy - 190                                                           '
  this.shipStats['ubaidian-x01b'][4].text = '       capacity - 1000                                                        '
  this.shipStats['ubaidian-x01b'][5].text = '       healing - 0.21/sec                                                      '
  this.shipStats['ubaidian-x01b'][6].text = '       armor - 0.01                                                           '

  // this.shipStats['x02-0'].text = '       ubaidian-x01b "hammer-head"                                              '
  // this.shipStats['x02_1'].text = '       speed - 29                                                             '
  // this.shipStats['x02_2'].text = '       health - 200                                                           '
  // this.shipStats['x02_3'].text = '       energy - 190                                                           '
  // this.shipStats['x02_4'].text = '       capacity - 1000                                                        '
  // this.shipStats['x02_5'].text = '       healing - 0.21/sec                                                      '
  // this.shipStats['x02_6'].text = '       armor - 0.01                                                           '

  // this.shipStats['x03_0'].text = '       ubaidian-x03a "star-fire"                                              '
  // this.shipStats['x03_1'].text = '       speed - 30                                                             '
  // this.shipStats['x03_2'].text = '       health - 120                                                           '
  // this.shipStats['x03_3'].text = '       energy - 130                                                           '
  // this.shipStats['x03_4'].text = '       capacity - 1000                                                        '
  // this.shipStats['x03_5'].text = '       healing - 0.5/sec                                                      '
  // this.shipStats['x03_6'].text = '       armor - 0.02                                                           '

  // ubaidian_x01d.text = 'ubaidian-x01d'
  // ubaidian_x01d.visible = false;
  // ubaidian_x01e.text = 'ubaidian-x01e'
  // ubaidian_x01e.visible = false;
  // ubaidian_x01f.text = 'ubaidian-x01f'
  // ubaidian_x01f.visible = false;
  // console.log(this.bg.panels)

  var w = window,
      d = document,
      e = d.documentElement,
      g = d.getElementsByTagName('body')[0],
      x = w.innerWidth || e.clientWidth || g.clientWidth,
      y = w.innerHeight|| e.clientHeight|| g.clientHeight;
  console.log(x + ' × ' + y);

  for(var i = 0; i < this.bg.panels.length; i++){
    if(this.bg.panels[i].id === 'statsPane'){
      var statsPane = this.bg.panels[i];
      // statsPane.addPanel(spacer)
      // statsPane.addPanel(spacer)
      statsPane.addPanel(this.shipStats['ubaidian-x01a'][0])
      statsPane.addPanel(this.shipStats['ubaidian-x01a'][1])
      statsPane.addPanel(this.shipStats['ubaidian-x01a'][2])
      statsPane.addPanel(this.shipStats['ubaidian-x01a'][3])
      statsPane.addPanel(this.shipStats['ubaidian-x01a'][4])
      statsPane.addPanel(this.shipStats['ubaidian-x01a'][5])
      statsPane.addPanel(this.shipStats['ubaidian-x01a'][6])
      statsPane.alpha = 0;
    }
  }
  this.invalidate();
};

Shipyard.prototype.fill = function() {
  var ships = ['ubaidian-x01a','ubaidian-x01b','ubaidian-x01c','ubaidian-x01d','ubaidian-x01e','ubaidian-x01f'],
      containers = this.containers;
  for(var i = 0; i < 6; i++){
    button = this.create(ships[i]);
    button.id = ships[i];
    button.bg.on('inputUp', this._select, this);
    button.start();
    containers[i].addPanel(button);
  }
  for(var i = 0; i < this.bg.panels.length; i++){
    if(this.bg.panels[i].id === 'statsPane'){
      console.log(this.bg.panels[i])
      this.bg.panels[i].alpha = 1;
    }
  }

  // buttons[enhancement] = button;

  this.invalidate();
};
Shipyard.prototype._select = function(button) {
  var ships = this.shipPanels.panels,
      ship = button.parent.id,
      spacer = new Label(this.game, {
        constraint: Layout.USE_PS_SIZE,
        text: {
          fontName: 'medium'
        },
        bg: false
      }); 
      spacer.text = '                    ';
  // console.log('button selected. context is button is ', button.parent.id)
  // console.log(this.shipPanels.panels)
  for(var i = 0; i < ships.length; i++){
    // console.log(button.parent.id)
    // if(ships[i].children[1].id === ship && ships[i].visible)
    if(ships[i].children[1].id !== ship){
      ships[i].visible = !ships[i].visible;
    }
  }
  for(var i = 0; i < this.bg.panels.length; i++){
    if(this.bg.panels[i].id === 'statsPane'){
      var statsPane = this.bg.panels[i];

        // console.log('ayoooooo', this.shipStats[ship])
        // statsPane.addPanel(spacer)
        // statsPane.addPanel(spacer)
      // for(var i = 0; i < this.shipStats[ship.toString()].length; i++){
      //   statsPane.addPanel(this.shipStats['ubaidian_x01a'][i])
      // }
      for(var i in this.shipStats[ship]){
        // statsPane.addPanel(this.shipStats[ship][i])
      }





      statsPane.alpha = 1;
      // console.log(this.bg.panels[i])
      // this.bg.panels[i].visible = !this.bg.panels[i].visible
      // this.bg.panels[i].alpha = this.bg.panels[i].alpha * -1;
      if(statsPane.alpha > 0){
        console.log('visible')
        // this.bg.panels[i].addPanel(ubaidian_x01a)
      }
    }
  }
  // console.log(this.bg)
  // button.parent.visible = false;
};

Shipyard.prototype.show = function() {
};

Shipyard.prototype.hide = function() {

};

module.exports = Shipyard;
