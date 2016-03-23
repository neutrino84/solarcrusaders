
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
        columns: 3,
        rows: 2
      },
      cell: {
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

  // cache
  this.cache = {};

  // create
  this.create();
};

ItemPane.prototype = Object.create(Pane.prototype);
ItemPane.prototype.constructor = ItemPane;

ItemPane.prototype.reset = function(items) {
  var data, item, cell, index = 0,
      cells = this.panels;
  for(var i in items) {
    data = items[i];
    cell = cells[index++];

    item = this.getItem(data);

    cell.removeAll();
    cell.addPanel(Layout.NONE, item);
  }
};

ItemPane.prototype.create = function() {
  var layout = this.settings.layout,
      columns = layout.columns,
      rows = layout.rows,
      len = columns * rows;
  for(var i=0; i<len; i++) {
    this.addPanel(Layout.NONE, this.createCell());
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
        blendMode: engine.BlendMode.NORMAL
      },
      icon: {
        padding: [4],
        border: [0],
        frame: item.sprite + '.png',
        bg: false
      }
    });
};

ItemPane.prototype.createCell = function() {
  return new Pane(this.game, this.settings.cell);
};

module.exports = ItemPane;
