
var pixi = require('pixi'),
    Const = require('../const'),
    Sprite = require('../display/Sprite'),
    Canvas = require('../system/Canvas'),
    Device = require('../system/Device');

function TilemapSprite(game, tilemap, index, width, height) {
  width |= 0;
  height |= 0;

  Sprite.call(this, game, 0, 0);

  this.map = tilemap;
  this.index = index;
  this.layer = tilemap.layers[index];
  this.type = Const.TILEMAPSPRITE;

  this.canvas = Canvas.create(width, height);
  this.context = this.canvas.getContext('2d');
  this.texture = new pixi.Texture(new pixi.BaseTexture(this.canvas));

  this.debug = false;
  this.exists = true;

  this.debugSettings = {
    missingImageFill: 'rgb(255,255,255)',
    debuggedTileOverfill: 'rgba(0,255,0,0.4)'
  };

  this.dirty = true;
  this.rayStepRate = 4;

  this._mc = {
    // used to bypass rendering without
    // reliance on `dirty` and detect changes.
    renderWidth: 0,
    renderHeight: 0,

    tileWidth: tilemap.tileWidth,
    tileHeight: tilemap.tileHeight,

    // collision width/height (pixels)
    // what purpose do these have? Most things use tile width/height directly.
    // this also only extends collisions right and down.       
    cw: tilemap.tileWidth,
    ch: tilemap.tileHeight,

    // Cached tilesets from index -> Tileset
    tilesets: []
  };

  this._results = [];
};

TilemapSprite.prototype = Object.create(Sprite.prototype);
TilemapSprite.prototype.constructor = TilemapSprite;

TilemapSprite.prototype.postUpdate = function() {
  Sprite.prototype.postUpdate.call(this);

  this.render();
};

TilemapSprite.prototype.destroy = function() {
  Canvas.remove(this);
  Sprite.prototype.destroy.call(this);
};

TilemapSprite.prototype.resize = function(width, height) {};

TilemapSprite.prototype.getTileX = function(x) {
  return global.Math.floor(x / this._mc.tileWidth);
};

TilemapSprite.prototype.getTileY = function(y) {
  return global.Math.floor(y / this._mc.tileHeight);
};

TilemapSprite.prototype.getTileXY = function(x, y, point) {
  point.x = this.getTileX(x);
  point.y = this.getTileY(y);

  return point;
};

TilemapSprite.prototype.getRayCastTiles = function(line, stepRate, collides, interestingFace) {
  if(!stepRate) { stepRate = this.rayStepRate; }
  if(collides === undefined) { collides = false; }
  if(interestingFace === undefined) { interestingFace = false; }

  //  First get all tiles that touch the bounds of the line
  var tiles = this.getTiles(line.x, line.y, line.width, line.height, collides, interestingFace);
  if(tiles.length === 0) {
    return [];
  }

  //  Now we only want the tiles that intersect with the points on this line
  var coords = line.coordinatesOnLine(stepRate);
  var results = [];
  for(var i = 0; i < tiles.length; i++) {
    for(var t = 0; t < coords.length; t++) {
      var tile = tiles[i];
      var coord = coords[t];
      if(tile.containsPoint(coord[0], coord[1])) {
        results.push(tile);
        break;
      }
    }
  }

  return results;
};

TilemapSprite.prototype.getTiles = function(x, y, width, height, collides, interestingFace) {
  // Should we only get tiles that have at least one of their collision
  // flags set? (true = yes, false = no just get them all)
  if(collides === undefined) { collides = false; }
  if(interestingFace === undefined) { interestingFace = false; }

  var fetchAll = !(collides || interestingFace);

  //  Convert the pixel values into tile coordinates
  var tx = global.Math.floor(x / (this._mc.cw * this.scale.x));
  var ty = global.Math.floor(y / (this._mc.ch * this.scale.y));
  //  Don't just use ceil(width/cw) to allow account for x/y diff within cell
  var tw = global.Math.ceil((x + width) / (this._mc.cw * this.scale.x)) - tx;
  var th = global.Math.ceil((y + height) / (this._mc.ch * this.scale.y)) - ty;

  while(this._results.length) {
    this._results.pop();
  }

  for(var wy = ty; wy < ty + th; wy++) {
    for(var wx = tx; wx < tx + tw; wx++) {
      var row = this.layer.data[wy];

      if(row && row[wx]) {
        if(fetchAll || row[wx].isInteresting(collides, interestingFace)) {
          this._results.push(row[wx]);
        }
      }
    }
  }

  return this._results.slice();
};

TilemapSprite.prototype.resolveTileset = function(tileIndex) {
  var tilesets = this._mc.tilesets;

  // try for dense array if reasonable
  if(tileIndex < 2000) {
    while(tilesets.length < tileIndex) {
      tilesets.push(undefined);
    }
  }

  var tileset,
      setIndex = this.map.tiles[tileIndex] && this.map.tiles[tileIndex][2];
  if(setIndex != null) {
    tileset = this.map.tilesets[setIndex];
    if(tileset && tileset.containsTileIndex(tileIndex)) {
      return (tilesets[tileIndex] = tileset);
    }
  }

  return (tilesets[tileIndex] = null);
};

TilemapSprite.prototype.resetTilesetCache = function() {
  var tilesets = this._mc.tilesets;
  while(tilesets.length) {
    tilesets.pop();
  }
};

TilemapSprite.prototype.renderRegion = function(scrollX, scrollY, left, top, right, bottom) {
  var context = this.context,
      width = this.layer.width,
      height = this.layer.height,
      tw = this._mc.tileWidth,
      th = this._mc.tileHeight,
      tilesets = this._mc.tilesets,
      lastAlpha = NaN;
 
  // top-left pixel of top-left cell
  var baseX = (left * tw) - scrollX;
  var baseY = (top * th) - scrollY;

  // fix normStartX / normStartY such it is normalized [0..width/height).
  // this allows a simple conditional and decrement to always keep in range [0..width/height)
  // during the loop. The major offset bias is to take care of negative values.
  var normStartX = (left + ((1 << 20) * width)) % width;
  var normStartY = (top + ((1 << 20) * height)) % height;

  // tx/ty - are pixel coordinates where tile is drawn
  // x/y - is cell location, normalized [0..width/height) in loop
  // xmax/ymax - remaining cells to render on column/row
  var tx, ty, x, y, xmax, ymax;

  context.fillStyle = this.tileColor;

  for(y=normStartY, ymax=bottom-top, ty=baseY;
      ymax>=0;
      y++, ymax--, ty+=th) {

    if(y >= height) { y -= height; }

    var row = this.layer.data[y];
    for(x=normStartX, xmax=right-left, tx=baseX;
      xmax >= 0;
      x++, xmax--, tx+=tw) {

      if(x >= width) { x -= width; }

      var tile = row[x];

      if(!tile || tile.index < 0) { continue; }

      var index = tile.index;
      var set = tilesets[index];
      if(set === undefined) {
        set = this.resolveTileset(index);
      }

      // setting the globalAlpha is
      // surprisingly expensive in Chrome
      if(tile.alpha !== lastAlpha && !this.debug) {
        context.globalAlpha = tile.alpha;
        lastAlpha = tile.alpha;
      }

      if(set) {
        if(tile.rotation || tile.flipped) {
          context.save();
          context.translate(tx + tile.centerX, ty + tile.centerY);
          context.rotate(tile.rotation);

          if(tile.flipped) {
            context.scale(-1, 1);
          }

          set.draw(context, -tile.centerX, -tile.centerY, index);
          context.restore();
        } else {
          set.draw(context, tx, ty, index);
        }
      } else if(this.debugSettings.missingImageFill) {
        context.fillStyle = this.debugSettings.missingImageFill;
        context.fillRect(tx, ty, tw, th);
      }

      if(tile.debug && this.debugSettings.debuggedTileOverfill) {
        context.fillStyle = this.debugSettings.debuggedTileOverfill;
        context.fillRect(tx, ty, tw, th);
      }
    }
  }
};

TilemapSprite.prototype.renderFull = function() {
  var scrollX = 0,
      scrollY = 0,
      renderW = this.canvas.width,
      renderH = this.canvas.height,
      tw = this._mc.tileWidth,
      th = this._mc.tileHeight,
      left = 0,
      top = 0,
      right = global.Math.floor((renderW - 1) / tw),
      bottom = global.Math.floor((renderH - 1) / th);
  this.context.clearRect(0, 0, renderW, renderH);
  this.renderRegion(scrollX, scrollY, left, top, right, bottom);
};

TilemapSprite.prototype.render = function() {
  var redrawAll = false;

  if(!this.visible) { return; }
  if(this.dirty || this.layer.dirty) {
    this.layer.dirty = false;
    redrawAll = true;
  }

  if(!redrawAll) { return; }

  this.context.save();
  this.renderFull();
  this.texture.update();
  this.dirty = false;
  this.context.restore();
};

module.exports = TilemapSprite;
