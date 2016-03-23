
var engine = require('engine'),
    Layout = require('../Layout'),
    Pane = require('../components/Pane'),
    ButtonIcon = require('../components/ButtonIcon'),
    Class = engine.Class;

function ItemPane(game, settings) {
  Pane.call(this, game,
    Class.mixin(settings, {
      padding: [0],
      layout: {
        type: 'list',
        gap: [2, 2],
        columns: 3
      },
      cel: {
        bg: {
          fillAlpha: 0.2,
          color: 0x000000
        }
      },
      data: {
        atlas: 'texture-atlas'
      },
      bg: false
    })
  );

  // cels
  this.cels = [];

  // cache
  this.cache = {};
};

ItemPane.prototype = Object.create(Pane.prototype);
ItemPane.prototype.constructor = ItemPane;

ItemPane.prototype.reset = function(items) {
  var item,
      columns = this.settings.layout.columns,
      len = items.length,
      remaining = columns - items.length;
  
  // clear
  this.removeAll();

  // add items
  for(var i=0; i<len; i++) {
    item = this.getItem(items[i]);
    this.addPanel(Layout.NONE, item);
  }

  // add empty
  for(var i=0; i<remaining; i++) {
    this.addPanel(Layout.NONE, this.createCel());
  }
};

ItemPane.prototype.getItem = function(item) {
  var cache = this.cache,
      uuid = item.uuid;
  if(cache[uuid]) {
    return cache[uuid];
  } else {
    return cache[uuid] = this.createItem(item);
  }
};

ItemPane.prototype.createItem = function(item) {
  return new ButtonIcon(this.game,
    this.settings.data.atlas, {
      padding: [0],
      border: [0],
      bg: {
        color: 0x000000,
        fillAlpha: 0.5,
        blendMode: engine.BlendMode.NORMAL,
        radius: 0.0
      },
      icon: {
        padding: [4],
        border: [0],
        frame: item.sprite + '.png',
        bg: false
      }
    });
};

ItemPane.prototype.createCel = function() {
  var cels = this.cels,
      len = cels.length,
      cel;
  for(var i=0; i<len; i++) {
    if(!cels[i].parent) {
      cel = cels[i];
    }
  }
  if(!cel) {
    cels.push(cel = new Pane(this.game, this.settings.cel));
  }
  return cel;
};

module.exports = ItemPane;
