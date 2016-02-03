
var TilemapParser = require('./TilemapParser'),
    Tile = require('./Tile'),
    TilemapLayer = require('./TilemapLayer'),
    TilemapSprite = require('./TilemapSprite'),
    Sprite = require('../display/Sprite'),
    ArrayUtils = require('../utils/ArrayUtils');

function Tilemap(game, key, mixin) {
  this.game = game;
  this.key = key;

  var data = this.parse(key, mixin);

  this.width = data.width;
  this.height = data.height;

  this.tileWidth = data.tileWidth;
  this.tileHeight = data.tileHeight;

  this.orientation = data.orientation;
  this.format = data.format;

  this.version = data.version;
  this.properties = data.properties;

  this.widthInPixels = data.widthInPixels;
  this.heightInPixels = data.heightInPixels;

  this.layers = data.layers;
  this.tilesets = data.tilesets;
  
  this.imagecollections = data.imagecollections;

  this.tiles = data.tiles;
  this.objects = data.objects;

  this.collideIndexes = [];
  this.collision = data.collision;

  this.images = data.images;

  this.currentLayer = 0;

  this.debugMap = [];

  this._results = [];
  this._tempA = 0;
  this._tempB = 0;
};

Tilemap.NORTH = 0;
Tilemap.EAST = 1;
Tilemap.SOUTH = 2;
Tilemap.WEST = 3;

Tilemap.prototype = {

  parse: function(key, mixin) {
    return TilemapParser.parse(this.game, key, mixin);
  },

  create: function(name, width, height, tileWidth, tileHeight, group) {
    if(group === undefined) { group = this.game.world; }

    this.width = width;
    this.height = height;

    this.setTileSize(tileWidth, tileHeight);

    this.layers.length = 0;

    return this.createBlankLayer(name, width, height, tileWidth, tileHeight, group);
  },

  setTileSize: function(tileWidth, tileHeight) {
    this.tileWidth = tileWidth;
    this.tileHeight = tileHeight;
    this.widthInPixels = this.width * tileWidth;
    this.heightInPixels = this.height * tileHeight;
  },

  addTilesetImage: function(tileset, key, tileWidth, tileHeight, tileMargin, tileSpacing, gid) {
    if(tileset === undefined) { return null; }
    if(tileWidth === undefined) { tileWidth = this.tileWidth; }
    if(tileHeight === undefined) { tileHeight = this.tileHeight; }
    if(tileMargin === undefined) { tileMargin = 0; }
    if(tileSpacing === undefined) { tileSpacing = 0; }
    if(gid === undefined) { gid = 0; }

    //  In-case we're working from a blank map
    if(tileWidth === 0) {
      tileWidth = 32;
    }

    if(tileHeight === 0) {
      tileHeight = 32;
    }

    var img = null;
    if(key === undefined || key === null) {
      key = tileset;
    }

    if(!this.game.cache.checkImageKey(key)) {
      console.warn('Tilemap.addTilesetImage: Invalid image key given: "' + key + '"');
      return null;
    }
    img = this.game.cache.getImage(key);

    var idx = this.getTilesetIndex(tileset);
    if(idx === null) {
      console.warn('Tilemap.addTilesetImage: No data found in the JSON matching the tileset name: "' + key + '"');
      return null;
    }

    if(this.tilesets[idx]) {
      this.tilesets[idx].setImage(img);
      return this.tilesets[idx];
    } else {
      var newSet = new Tileset(tileset, gid, tileWidth, tileHeight, tileMargin, tileSpacing, {});

      newSet.setImage(img);

      this.tilesets.push(newSet);

      var i = this.tilesets.length - 1;
      var x = tileMargin;
      var y = tileMargin;

      var count = 0;
      var countX = 0;
      var countY = 0;

      for(var t = gid; t < gid + newSet.total; t++) {
        this.tiles[t] = [x, y, i];
        x += tileWidth + tileSpacing;
        count++;

        if(count === newSet.total) {
          break;
        }

        countX++;
        if(countX === newSet.columns) {
          x = tileMargin;
          y += tileHeight + tileSpacing;

          countX = 0;
          countY++;

          if(countY === newSet.rows) {
            break;
          }
        }
      }

      return newSet;
    }

    return null;
  },

  createFromObjects: function(name, gid, key, frame, exists, autoCull, group, CustomClass, adjustY) {
      if(exists === undefined) { exists = true; }
      if(autoCull === undefined) { autoCull = false; }
      if(group === undefined) { group = this.game.world; }
      if(CustomClass === undefined) { CustomClass = Sprite; }
      if(adjustY === undefined) { adjustY = true; }

      if(!this.objects[name]) {
        console.warn('Tilemap.createFromObjects: Invalid objectgroup name given: ' + name);
        return;
      }

      var found, obj, sprite;
      for(var i = 0; i < this.objects[name].length; i++) {
        found = false;
        obj = this.objects[name][i];

        if(obj.gid !== undefined && typeof gid === 'number' && obj.gid === gid) {
          found = true;
        } else if(obj.id !== undefined && typeof gid === 'number' && obj.id === gid) {
          found = true;
        } else if(obj.name !== undefined && typeof gid === 'string' && obj.name === gid) {
          found = true;
        }

        if(found) {
          sprite = new CustomClass(this.game, parseFloat(obj.x, 10), parseFloat(obj.y, 10), key, frame);

          sprite.name = obj.name;
          sprite.visible = obj.visible;
          sprite.autoCull = autoCull;
          sprite.exists = exists;

          if(obj.width) { sprite.width = obj.width; }
          if(obj.height) { sprite.height = obj.height; }
          if(obj.rotation) { sprite.angle = obj.rotation; }
          if(adjustY) { sprite.y -= sprite.height; }

          group.add(sprite);

          for(var property in obj.properties) {
            group.set(sprite, property, obj.properties[property], false, false, 0, true);
          }
        }
      }
    },

  createFromTiles: function(tiles, replacements, key, layer, group, properties) {
    if(typeof tiles === 'number') { tiles = [tiles]; }
    if(replacements === undefined || replacements === null) {
      replacements = [];
    } else if(typeof replacements === 'number') {
      replacements = [replacements];
    }

    layer = this.getLayer(layer);

    if(group === undefined) { group = this.game.world; }
    if(properties === undefined) { properties = {}; }
    if(properties.customClass === undefined) {
      properties.customClass = Sprite;
    }

    if(properties.adjustY === undefined) {
      properties.adjustY = true;
    }

    var lw = this.layers[layer].width;
    var lh = this.layers[layer].height;

    this.copy(0, 0, lw, lh, layer);

    if(this._results.length < 2) {
      return 0;
    }

    var total = 0;
    var sprite;
    for(var i = 1, len = this._results.length; i < len; i++) {
      if(tiles.indexOf(this._results[i].index) !== -1) {
        sprite = new properties.customClass(this.game, this._results[i].worldX, this._results[i].worldY, key);

        for(var property in properties) {
          sprite[property] = properties[property];
        }

        group.add(sprite);
        total++;
      }
    }

    if(replacements.length === 1) {
      //  Assume 1 replacement for all types of tile given
      for(i = 0; i < tiles.length; i++) {
        this.replace(tiles[i], replacements[0], 0, 0, lw, lh, layer);
      }
    }
    else if(replacements.length > 1) {
      //  Assume 1 for 1 mapping
      for(i = 0; i < tiles.length; i++) {
        this.replace(tiles[i], replacements[i], 0, 0, lw, lh, layer);
      }
    }

    return total;
  },

  createSprite: function(layer, width, height, group) {
    //  Add Buffer support for the left of the canvas
    if(width === undefined) { width = this.widthInPixels; }
    if(height === undefined) { height = this.heightInPixels; }
    if(group === undefined) { group = this.game.world; }

    var index = layer;
    if(typeof layer === 'string') {
      index = this.getLayerIndex(layer);
    }

    if(index === null || index > this.layers.length) {
      console.warn('Tilemap.createLayer: Invalid layer ID given: ' + index);
      return;
    }

    return group.add(new TilemapSprite(this.game, this, index, width, height));
  },

  createLayer: function(layer, width, height, group) {
    //  Add Buffer support for the left of the canvas
    if(width === undefined) { width = this.game.width; }
    if(height === undefined) { height = this.game.height; }
    if(group === undefined) { group = this.game.world; }

    var index = layer;
    if(typeof layer === 'string') {
      index = this.getLayerIndex(layer);
    }

    if(index === null || index > this.layers.length) {
      console.warn('Tilemap.createLayer: Invalid layer ID given: ' + index);
      return;
    }

    return group.add(new TilemapLayer(this.game, this, index, width, height));
  },

  createBlankLayer: function(name, width, height, tileWidth, tileHeight, group) {
    if(group === undefined) { group = this.game.world; }
    if(this.getLayerIndex(name) !== null) {
      console.warn('Tilemap.createBlankLayer: Layer with matching name already exists');
      return;
    }

    var layer = {
      name: name,
      x: 0,
      y: 0,
      width: width,
      height: height,
      widthInPixels: width * tileWidth,
      heightInPixels: height * tileHeight,
      alpha: 1,
      visible: true,
      properties: {},
      indexes: [],
      callbacks: [],
      bodies: [],
      data: null
    };

    var row;
    var output = [];
    for(var y = 0; y < height; y++) {
      row = [];
      for(var x = 0; x < width; x++) {
        // row.push(null);
        row.push(new Tile(layer, -1, x, y, tileWidth, tileHeight));
      }
      output.push(row);
    }

    layer.data = output;
    this.layers.push(layer);
    this.currentLayer = this.layers.length - 1;

    var w = layer.widthInPixels;
    var h = layer.heightInPixels;

    if(w > this.game.width) {
      w = this.game.width;
    }

    if(h > this.game.height) {
      h = this.game.height;
    }

    var output = new TilemapLayer(this.game, this, this.layers.length - 1, w, h);
        output.name = name;
    return group.add(output);
  },

  getIndex: function(location, name) {
    for(var i = 0; i < location.length; i++) {
      if(location[i].name === name) {
        return i;
      }
    }

    return null;
  },

  getLayerIndex: function(name) {
    return this.getIndex(this.layers, name);
  },

  getTilesetIndex: function(name) {
    return this.getIndex(this.tilesets, name);
  },

  getImageIndex: function(name) {
    return this.getIndex(this.images, name);
  },

  getObjectIndex: function(name) {
    return this.getIndex(this.objects, name);
  },

  setTileIndexCallback: function(indexes, callback, callbackContext, layer) {
    layer = this.getLayer(layer);
    if(typeof indexes === 'number') {
      //  This may seem a bit wasteful, because it will cause empty array elements to be created, but the look-up cost is much
      //  less than having to iterate through the callbacks array hunting down tile indexes each frame, so I'll take the small memory hit.
      this.layers[layer].callbacks[indexes] = { callback: callback, callbackContext: callbackContext };
    } else {
      for(var i = 0, len = indexes.length; i < len; i++) {
        this.layers[layer].callbacks[indexes[i]] = { callback: callback, callbackContext: callbackContext };
      }
    }
  },

  setTileLocationCallback: function(x, y, width, height, callback, callbackContext, layer) {
    layer = this.getLayer(layer);
    this.copy(x, y, width, height, layer);

    if(this._results.length < 2) {
      return;
    }

    for(var i = 1; i < this._results.length; i++) {
      this._results[i].setCollisionCallback(callback, callbackContext);
    }
  },

  setCollision: function(indexes, collides, layer, recalculate) {
    if(collides === undefined) { collides = true; }
    if(recalculate === undefined) { recalculate = true; }
    
    layer = this.getLayer(layer);

    if(typeof indexes === 'number') {
      return this.setCollisionByIndex(indexes, collides, layer, true);
    } else if(Array.isArray(indexes)) {
      //  Collide all of the IDs given in the indexes array
      for(var i = 0; i < indexes.length; i++) {
        this.setCollisionByIndex(indexes[i], collides, layer, false);
      }

      if(recalculate) {
        //  Now re-calculate interesting faces
        this.calculateFaces(layer);
      }
    }
  },

  setCollisionBetween: function(start, stop, collides, layer, recalculate) {
    if(collides === undefined) { collides = true; }
    if(recalculate === undefined) { recalculate = true; }
    
    layer = this.getLayer(layer);

    if(start > stop) {
      return;
    }

    for(var index = start; index <= stop; index++) {
      this.setCollisionByIndex(index, collides, layer, false);
    }

    if(recalculate) {
      //  Now re-calculate interesting faces
      this.calculateFaces(layer);
    }
  },

  setCollisionByExclusion: function(indexes, collides, layer, recalculate) {
    if(collides === undefined) { collides = true; }
    if(recalculate === undefined) { recalculate = true; }
    
    layer = this.getLayer(layer);

    //  Collide everything, except the IDs given in the indexes array
    for(var i = 0, len = this.tiles.length; i < len; i++) {
      if(indexes.indexOf(i) === -1) {
        this.setCollisionByIndex(i, collides, layer, false);
      }
    }

    if(recalculate) {
      //  Now re-calculate interesting faces
      this.calculateFaces(layer);
    }
  },

  setCollisionByIndex: function(index, collides, layer, recalculate) {
    if(collides === undefined) { collides = true; }
    if(layer === undefined) { layer = this.currentLayer; }
    if(recalculate === undefined) { recalculate = true; }

    if(collides) {
      this.collideIndexes.push(index);
    } else {
      var i = this.collideIndexes.indexOf(index);
      if(i > -1) {
        this.collideIndexes.splice(i, 1);
      }
    }

    for(var y = 0; y < this.layers[layer].height; y++) {
      for(var x = 0; x < this.layers[layer].width; x++) {
        var tile = this.layers[layer].data[y][x];

        if(tile && tile.index === index) {
          if(collides) {
            tile.setCollision(true, true, true, true);
          } else {
            tile.resetCollision();
          }

          tile.faceTop = collides;
          tile.faceBottom = collides;
          tile.faceLeft = collides;
          tile.faceRight = collides;
        }
      }
    }

    if(recalculate) {
      //  Now re-calculate interesting faces
      this.calculateFaces(layer);
    }

    return layer;
  },

  getLayer: function(layer) {
    if(layer === undefined) {
      layer = this.currentLayer;
    } else if(typeof layer === 'string') {
      layer = this.getLayerIndex(layer);
    } else if(layer instanceof TilemapLayer) {
      layer = layer.index;
    }

    return layer;
  },

  setPreventRecalculate: function(value) {
    if(value === true && this.preventingRecalculate !== true) {
      this.preventingRecalculate = true;
      this.needToRecalculate = {};
    }

    if(value === false && this.preventingRecalculate === true) {
      this.preventingRecalculate = false;

      for(var i in this.needToRecalculate) {
        this.calculateFaces(i);
      }

      this.needToRecalculate = false;
    }
  },

  calculateFaces: function(layer) {
    if(this.preventingRecalculate) {
      this.needToRecalculate[layer] = true;
      return;
    }
    
    var above = null;
    var below = null;
    var left = null;
    var right = null;

    for(var y = 0, h = this.layers[layer].height; y < h; y++) {
      for(var x = 0, w = this.layers[layer].width; x < w; x++) {
        var tile = this.layers[layer].data[y][x];

        if(tile) {
          above = this.getTileAbove(layer, x, y);
          below = this.getTileBelow(layer, x, y);
          left = this.getTileLeft(layer, x, y);
          right = this.getTileRight(layer, x, y);

          if(tile.collides) {
            tile.faceTop = true;
            tile.faceBottom = true;
            tile.faceLeft = true;
            tile.faceRight = true;
          }

          if(above && above.collides) {
            //  There is a tile above this one that also collides, so the top of this tile is no longer interesting
            tile.faceTop = false;
          }

          if(below && below.collides) {
            //  There is a tile below this one that also collides, so the bottom of this tile is no longer interesting
            tile.faceBottom = false;
          }

          if(left && left.collides) {
            //  There is a tile left this one that also collides, so the left of this tile is no longer interesting
            tile.faceLeft = false;
          }

          if(right && right.collides) {
            //  There is a tile right this one that also collides, so the right of this tile is no longer interesting
            tile.faceRight = false;
          }
        }
      }
    }
  },

  getTileAbove: function(layer, x, y) {
    if(y > 0) {
      return this.layers[layer].data[y - 1][x];
    }
    return null;
  },

  getTileBelow: function(layer, x, y) {
    if(y < this.layers[layer].height - 1) {
      return this.layers[layer].data[y + 1][x];
    }
    return null;
  },

  getTileLeft: function(layer, x, y) {
    if(x > 0) {
      return this.layers[layer].data[y][x - 1];
    }
    return null;
  },

  getTileRight: function(layer, x, y) {
    if(x < this.layers[layer].width - 1) {
      return this.layers[layer].data[y][x + 1];
    }
    return null;
  },

  setLayer: function(layer) {
    layer = this.getLayer(layer);

    if(this.layers[layer]) {
      this.currentLayer = layer;
    }
  },

  hasTile: function(x, y, layer) {
    layer = this.getLayer(layer);

    if(this.layers[layer].data[y] === undefined ||
        this.layers[layer].data[y][x] === undefined) {
      return false;
    }
    return (this.layers[layer].data[y][x].index > -1);
  },

  removeTile: function(x, y, layer) {
    layer = this.getLayer(layer);

    if(x >= 0 && x < this.layers[layer].width && y >= 0 && y < this.layers[layer].height) {
      if(this.hasTile(x, y, layer)) {
        var tile = this.layers[layer].data[y][x];

        this.layers[layer].data[y][x] = new Tile(this.layers[layer], -1, x, y, this.tileWidth, this.tileHeight);
        this.layers[layer].dirty = true;

        this.calculateFaces(layer);

        return tile;
      }
    }
  },

  removeTileWorldXY: function(x, y, tileWidth, tileHeight, layer) {
    layer = this.getLayer(layer);

    x = this.game.math.snapToFloor(x, tileWidth) / tileWidth;
    y = this.game.math.snapToFloor(y, tileHeight) / tileHeight;

    return this.removeTile(x, y, layer);
  },

  putTile: function(tile, x, y, layer) {
    if(tile === null) {
      return this.removeTile(x, y, layer);
    }

    layer = this.getLayer(layer);

    if(x >= 0 && x < this.layers[layer].width && y >= 0 && y < this.layers[layer].height) {
      var index;

      if(tile instanceof Tile) {
        index = tile.index;

        if(this.hasTile(x, y, layer)) {
          this.layers[layer].data[y][x].copy(tile);
        } else {
          this.layers[layer].data[y][x] = new Tile(layer, index, x, y, tile.width, tile.height);
        }
      } else {
        index = tile;

        if(this.hasTile(x, y, layer)) {
          this.layers[layer].data[y][x].index = index;
        } else {
          this.layers[layer].data[y][x] = new Tile(this.layers[layer], index, x, y, this.tileWidth, this.tileHeight);
        }
      }

      if(this.collideIndexes.indexOf(index) > -1) {
        this.layers[layer].data[y][x].setCollision(true, true, true, true);
      } else {
        this.layers[layer].data[y][x].resetCollision();
      }

      this.layers[layer].dirty = true;
      this.calculateFaces(layer);

      return this.layers[layer].data[y][x];
    }

    return null;
  },

  putTileWorldXY: function(tile, x, y, tileWidth, tileHeight, layer) {
    layer = this.getLayer(layer);

    x = this.game.math.snapToFloor(x, tileWidth) / tileWidth;
    y = this.game.math.snapToFloor(y, tileHeight) / tileHeight;

    return this.putTile(tile, x, y, layer);
  },

  searchTileIndex: function(index, skip, reverse, layer) {
    if(skip === undefined) { skip = 0; }
    if(reverse === undefined) { reverse = false; }

    layer = this.getLayer(layer);

    var c = 0;
    if(reverse) {
      for(var y = this.layers[layer].height - 1; y >= 0; y--) {
        for(var x = this.layers[layer].width - 1; x >= 0; x--) {
          if(this.layers[layer].data[y][x].index === index) {
            if(c === skip) {
              return this.layers[layer].data[y][x];
            } else {
              c++;
            }
          }
        }
      }
    } else {
      for(var y = 0; y < this.layers[layer].height; y++) {
        for(var x = 0; x < this.layers[layer].width; x++) {
          if(this.layers[layer].data[y][x].index === index) {
            if(c === skip) {
              return this.layers[layer].data[y][x];
            } else {
              c++;
            }
          }
        }
      }
    }

    return null;
  },

  getTile: function(x, y, layer, nonNull) {
    if(nonNull === undefined) { nonNull = false; }

    layer = this.getLayer(layer);

    if(x >= 0 && x < this.layers[layer].width && y >= 0 && y < this.layers[layer].height) {
      if(this.layers[layer].data[y][x].index === -1) {
        if(nonNull) {
          return this.layers[layer].data[y][x];
        } else {
          return null;
        }
      } else {
        return this.layers[layer].data[y][x];
      }
    } else {
      return null;
    }
  },

  getTileWorldXY: function(x, y, tileWidth, tileHeight, layer, nonNull) {
    if(tileWidth === undefined) { tileWidth = this.tileWidth; }
    if(tileHeight === undefined) { tileHeight = this.tileHeight; }

    layer = this.getLayer(layer);

    x = this.game.math.snapToFloor(x, tileWidth) / tileWidth;
    y = this.game.math.snapToFloor(y, tileHeight) / tileHeight;

    return this.getTile(x, y, layer, nonNull);
  },

  copy: function(x, y, width, height, layer) {
    layer = this.getLayer(layer);

    if(!this.layers[layer]) {
      this._results.length = 0;
      return;
    }

    if(x === undefined) { x = 0; }
    if(y === undefined) { y = 0; }
    if(width === undefined) { width = this.layers[layer].width; }
    if(height === undefined) { height = this.layers[layer].height; }
    
    if(x < 0) {
      x = 0;
    }

    if(y < 0) {
      y = 0;
    }

    if(width > this.layers[layer].width) {
      width = this.layers[layer].width;
    }

    if(height > this.layers[layer].height) {
      height = this.layers[layer].height;
    }

    this._results.length = 0;
    this._results.push({ x: x, y: y, width: width, height: height, layer: layer });

    for(var ty = y; ty < y + height; ty++) {
      for(var tx = x; tx < x + width; tx++) {
        this._results.push(this.layers[layer].data[ty][tx]);
      }
    }

    return this._results;
  },

  paste: function(x, y, tileblock, layer) {
    if(x === undefined) { x = 0; }
    if(y === undefined) { y = 0; }

    layer = this.getLayer(layer);

    if(!tileblock || tileblock.length < 2) {
      return;
    }

    // Find out the difference between tileblock[1].x/y and x/y and use it as an offset, 
    // as it's the top left of the block to paste
    var diffX = x - tileblock[1].x;
    var diffY = y - tileblock[1].y;
    for(var i = 1; i < tileblock.length; i++) {
      this.layers[layer].data[ diffY + tileblock[i].y ][ diffX + tileblock[i].x ].copy(tileblock[i]);
    }

		this.layers[layer].dirty = true;
    this.calculateFaces(layer);
  },

  swap: function(tileA, tileB, x, y, width, height, layer) {
    layer = this.getLayer(layer);
    this.copy(x, y, width, height, layer);

    if(this._results.length < 2) {
      return;
    }

    this._tempA = tileA;
    this._tempB = tileB;

    this._results.forEach(this.swapHandler, this);
    this.paste(x, y, this._results, layer);
  },

  swapHandler: function(value) {
    if(value.index === this._tempA) {
      //  Swap A with B
      value.index = this._tempB;
    } else if(value.index === this._tempB) {
      //  Swap B with A
      value.index = this._tempA;
    }
  },

  forEach: function(callback, context, x, y, width, height, layer) {
    layer = this.getLayer(layer);
    this.copy(x, y, width, height, layer);

    if(this._results.length < 2) {
      return;
    }

    this._results.forEach(callback, context);
    this.paste(x, y, this._results, layer);
  },

  replace: function(source, dest, x, y, width, height, layer) {
    layer = this.getLayer(layer);
    this.copy(x, y, width, height, layer);

    if(this._results.length < 2) {
      return;
    }

    for(var i = 1; i < this._results.length; i++) {
      if(this._results[i].index === source) {
        this._results[i].index = dest;
      }
    }

    this.paste(x, y, this._results, layer);
  },

  random: function(x, y, width, height, layer) {
    layer = this.getLayer(layer);
    this.copy(x, y, width, height, layer);

    if(this._results.length < 2) {
      return;
    }

    var indexes = [];
    for(var t = 1; t < this._results.length; t++) {
      if(this._results[t].index) {
        var idx = this._results[t].index;
        if(indexes.indexOf(idx) === -1) {
          indexes.push(idx);
        }
      }
    }

    for(var i = 1; i < this._results.length; i++) {
      this._results[i].index = this.game.rnd.pick(indexes);
    }

    this.paste(x, y, this._results, layer);
  },

  shuffle: function(x, y, width, height, layer) {
    layer = this.getLayer(layer);
    this.copy(x, y, width, height, layer);

    if(this._results.length < 2) {
      return;
    }

    var indexes = [];
    for(var t = 1; t < this._results.length; t++) {
      if(this._results[t].index) {
        indexes.push(this._results[t].index);
      }
    }

    ArrayUtils.shuffle(indexes);

    for(var i = 1; i < this._results.length; i++) {
      this._results[i].index = indexes[i - 1];
    }

    this.paste(x, y, this._results, layer);
  },

  fill: function(index, x, y, width, height, layer) {
    layer = this.getLayer(layer);
    this.copy(x, y, width, height, layer);

    if(this._results.length < 2) {
      return;
    }
    for(var i = 1; i < this._results.length; i++) {
      this._results[i].index = index;
    }

    this.paste(x, y, this._results, layer);
  },

  removeAllLayers: function() {
    this.layers.length = 0;
    this.currentLayer = 0;
  },

  dump: function() {
    var txt = '';
    var args = [''];

    for(var y = 0; y < this.layers[this.currentLayer].height; y++) {
      for(var x = 0; x < this.layers[this.currentLayer].width; x++) {
        txt += "%c  ";

        if(this.layers[this.currentLayer].data[y][x] > 1) {
          if(this.debugMap[this.layers[this.currentLayer].data[y][x]]) {
            args.push("background: " + this.debugMap[this.layers[this.currentLayer].data[y][x]]);
          } else {
            args.push("background: #ffffff");
          }
        } else {
          args.push("background: rgb(0, 0, 0)");
        }
      }

      txt += "\n";
    }

    args[0] = txt;
    console.log.apply(console, args);
  },

  destroy: function() {
    this.removeAllLayers();
    this.game = null;
  }
};

Tilemap.prototype.constructor = Tilemap;

Object.defineProperty(Tilemap.prototype, 'layer', {
  get: function() {
    return this.layers[this.currentLayer];
  },

  set: function(value) {
    if(value !== this.currentLayer) {
      this.setLayer(value);
    }
  }
});

module.exports = Tilemap;
