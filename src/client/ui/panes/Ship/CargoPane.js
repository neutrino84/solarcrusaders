
var engine = require('engine'),
    Layout = require('../../Layout'),
    ContentPane = require('../ContentPane'),
    ItemPane = require('../ItemPane'),
    Pane = require('../../components/Pane'),
    Button = require('../../components/Button'),
    Label = require('../../components/Label'),
    Class = engine.Class;

function CargoPane(game, settings) {
  ContentPane.call(this, game, 'cargo hold',
    Class.mixin(settings, {
      content: {
        padding: [0]
      },
      category: {
        padding: [0],
        bg: {
          fillAlpha: 0.1,
          color: 0x000000
        }
      },
      label: {
        padding: [5],
        text: {
          fontName: 'small'
        },
        bg: false
      },
      item: {
        padding: [1],
        layout: {
          gap: [1, 1],
          columns: 6
        },
        cel: {
          width: 40,
          height: 40
        }
      },
      bg: false
    })
  );

  this.items = {};
  this.itemPanes = {};

  // this.content.bg.inputEnabled = true;
  // this.content.bg.input.priorityID = 4;
  // this.content.bg.input.stop();
  // this.content.bg.input.enableDrop();
  // this.content.bg.on('inputDropped', this._itemDropped, this);
};

CargoPane.prototype = Object.create(ContentPane.prototype);
CargoPane.prototype.constructor = CargoPane;

CargoPane.prototype.reset = function() {
  var items = this.items, pane,
      itemPanes = this.itemPanes;
  
  this.removeAllContent();
  
  for(var i in items) {
    if(itemPanes[i] == undefined) {
      itemPanes[i] = this.createCategoryPane(i);
    }

    pane = itemPanes[i].panels[1];
    pane.reset(items[i]);

    this.addContent(Layout.NONE, itemPanes[i]);
  }
};

CargoPane.prototype.start = function() {
  // this.content.bg.input.start();
};

CargoPane.prototype.stop = function() {
  // this.content.bg.input.stop();
};

CargoPane.prototype.create = function(data) {
  var cargo = data.cargo,
      items = this.items = {
        system: [], hardpoint: [],
        ammo: [], component: [],
        resource: []
      },
      itemPanes = this.itemPanes;

  // process cargo
  for(var c in cargo) {
    items[cargo[c].type].push(cargo[c]);
  }

  this.reset();
};

CargoPane.prototype.createCategoryPane = function(category) {
  var game = this.game,
      settings = this.settings,
      pane = new Pane(game, settings.category),
      label = new Label(game, category, settings.label),
      itemPane = new ItemPane(game, settings.item);
  
  pane.addPanel(Layout.STRETCH, label);
  pane.addPanel(Layout.STRETCH, itemPane);
  
  return pane;
};

CargoPane.prototype._itemDropped = function(item) {
  //..
};

module.exports = CargoPane;
