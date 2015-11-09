
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

  // this.pivot.set(width / 2, height / 2);

  this.renderSettings = {
    // enableScrollDelta: true,
    copyCanvas: null
  };

  // this.debug = false;
  this.exists = true;

  // this.debugSettings = {
  //   missingImageFill: 'rgb(255,255,255)',
  //   debuggedTileOverfill: 'rgba(0,255,0,0.4)',

  //   forceFullRedraw: true,

  //   debugAlpha: 0.5,
  //   facingEdgeStroke: 'rgba(0,255,0,1)',
  //   collidingTileOverfill: 'rgba(0,255,0,0.2)'
  // };

  // this.scrollFactorX = 1;
  // this.scrollFactorY = 1;

  this.dirty = true;
  this.rayStepRate = 4;

  // this._wrap = false;
  this._mc = {

    // Used to bypass rendering without reliance on `dirty` and detect changes.
    // scrollX: 0,
    // scrollY: 0,
    renderWidth: 0,
    renderHeight: 0,

    tileWidth: tilemap.tileWidth,
    tileHeight: tilemap.tileHeight,

    // Collision width/height (pixels)
    // What purpose do these have? Most things use tile width/height directly.
    // This also only extends collisions right and down.       
    cw: tilemap.tileWidth,
    ch: tilemap.tileHeight,

    // Cached tilesets from index -> Tileset
    tilesets: []
  };

  // this._scrollX = 0;
  // this._scrollY = 0;
  this._results = [];

  // if(!Device.canvasBitBltShift) {
  //   this.renderSettings.copyCanvas = TilemapSprite.ensureSharedCopyCanvas();
  // }

  // this.fixedToCamera = true;
};

TilemapSprite.prototype = Object.create(Sprite.prototype);
TilemapSprite.prototype.constructor = TilemapSprite;

// TilemapSprite.sharedCopyCanvas = null;
// TilemapSprite.ensureSharedCopyCanvas = function() {
//   if(!this.sharedCopyCanvas) {
//     this.sharedCopyCanvas = Canvas.create(2, 2);
//   }
//   return this.sharedCopyCanvas;
// };

TilemapSprite.prototype.postUpdate = function() {
  Sprite.prototype.postUpdate.call(this);

  // prepare tilemap
  // for render
  this.render();
};

TilemapSprite.prototype.destroy = function() {
  Canvas.remove(this);
  Sprite.prototype.destroy.call(this);
};

TilemapSprite.prototype.resize = function(width, height) {
  // this.canvas.width = width;
  // this.canvas.height = height;

  // this.texture.frame.width = width;
  // this.texture.frame.height = height;

  // this.texture.width = width;
  // this.texture.height = height;

  // this.texture.crop.width = width;
  // this.texture.crop.height = height;

  // this.texture.baseTexture.width = width;
  // this.texture.baseTexture.height = height;

  // this.texture.update();
  // this.texture.requiresUpdate = true;

  // this.texture._updateUvs();

  // this.dirty = true;
};

// TilemapSprite.prototype.resizeWorld = function() {
//   this.game.world.setBounds(0, 0, this.layer.widthInPixels * this.scale.x, this.layer.heightInPixels * this.scale.y);
// };

TilemapSprite.prototype._fixX = function(x) {
  if(x < 0) { x = 0; }
  // if(this.scrollFactorX === 1) {
    return x;
  // }
  // return this._scrollX + (x - (this._scrollX / this.scrollFactorX));
};

// TilemapSprite.prototype._unfixX = function(x) {
//   if(this.scrollFactorX === 1) {
//     return x;
//   }
//   return (this._scrollX / this.scrollFactorX) + (x - this._scrollX);
// };

TilemapSprite.prototype._fixY = function(y) {
  if(y < 0) { y = 0; }
  // if(this.scrollFactorY === 1) {
    return y;
  // }
  // return this._scrollY + (y - (this._scrollY / this.scrollFactorY));
};

// TilemapSprite.prototype._unfixY = function(y) {
//   if(this.scrollFactorY === 1) {
//     return y;
//   }
//   return (this._scrollY / this.scrollFactorY) + (y - this._scrollY);
// };

TilemapSprite.prototype.getTileX = function(x) {
  // var tileWidth = this.tileWidth * this.scale.x;
  return global.Math.floor(this._fixX(x) / this._mc.tileWidth);
};

TilemapSprite.prototype.getTileY = function(y) {
  // var tileHeight = this.tileHeight * this.scale.y;
  return global.Math.floor(this._fixY(y) / this._mc.tileHeight);
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

  //  Adjust the x,y coordinates for scrollFactor
  x = this._fixX(x);
  y = this._fixY(y);

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

  //  Try for dense array if reasonable
  if(tileIndex < 2000) {
    while(tilesets.length < tileIndex) {
      tilesets.push(undefined);
    }
  }

  var setIndex = this.map.tiles[tileIndex] && this.map.tiles[tileIndex][2];
  if(setIndex != null) { // number: not null or undefined
    var tileset = this.map.tilesets[setIndex];

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

TilemapSprite.prototype.setScale = function(xScale, yScale) {
  xScale = xScale || 1;
  yScale = yScale || xScale;

  for(var y = 0; y < this.layer.data.length; y++) {
    var row = this.layer.data[y];

    for(var x = 0; x < row.length; x++) {
      var tile = row[x];

      tile.width = this.map.tileWidth * xScale;
      tile.height = this.map.tileHeight * yScale;

      tile.worldX = tile.x * tile.width;
      tile.worldY = tile.y * tile.height;
    }
  }

  this.scale.setTo(xScale, yScale);
};

TilemapSprite.prototype.renderRegion = function(scrollX, scrollY, left, top, right, bottom) {
  var context = this.context;

  var width = this.layer.width;
  var height = this.layer.height;
  var tw = this._mc.tileWidth;
  var th = this._mc.tileHeight;

  var tilesets = this._mc.tilesets;
  var lastAlpha = NaN;
  if(!this._wrap) {
    if(left <= right) {// Only adjust if going to render
      left = global.Math.max(0, left);
      right = global.Math.min(width - 1, right);
    }
    if(top <= bottom) {
      top = global.Math.max(0, top);
      bottom = global.Math.min(height - 1, bottom);
    }
  }
 
  // top-left pixel of top-left cell
  var baseX = (left * tw) - scrollX;
  var baseY = (top * th) - scrollY;

  // Fix normStartX/normStartY such it is normalized [0..width/height). This allows a simple conditional and decrement to always keep in range [0..width/height) during the loop. The major offset bias is to take care of negative values.
  var normStartX = (left + ((1 << 20) * width)) % width;
  var normStartY = (top + ((1 << 20) * height)) % height;

  // tx/ty - are pixel coordinates where tile is drawn
  // x/y - is cell location, normalized [0..width/height) in loop
  // xmax/ymax - remaining cells to render on column/row
  var tx, ty, x, y, xmax, ymax;

  context.fillStyle = this.tileColor;

  for(y = normStartY, ymax = bottom - top, ty = baseY;
    ymax >= 0;
    y++, ymax--, ty += th) {

    if(y >= height) { y -= height; }

    var row = this.layer.data[y];
    for(x = normStartX, xmax = right - left, tx = baseX;
      xmax >= 0;
      x++, xmax--, tx += tw) {

      if(x >= width) { x -= width; }

      var tile = row[x];
      if(!tile || tile.index < 0) {
        continue;
      }

      var index = tile.index;
      var set = tilesets[index];
      if(set === undefined) {
        set = this.resolveTileset(index);
      }

      //  Setting the globalAlpha is 'surprisingly expensive' in Chrome (38)
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
  var scrollX = 0;//this._mc.scrollX;
  var scrollY = 0;//this._mc.scrollY;

  var renderW = this.canvas.width;
  var renderH = this.canvas.height;

  var tw = this._mc.tileWidth;
  var th = this._mc.tileHeight;

  var left = 0; //global.Math.floor(scrollX / tw);
  var right = global.Math.floor((renderW - 1) / tw); //global.Math.floor((renderW - 1 + scrollX) / tw);
  var top = 0; //global.Math.floor(scrollY / th);
  var bottom = global.Math.floor((renderH - 1) / th); //global.Math.floor((renderH - 1 + scrollY) / th);

  this.context.clearRect(0, 0, renderW, renderH);
  this.renderRegion(scrollX, scrollY, left, top, right, bottom);
};

TilemapSprite.prototype.render = function() {
  var redrawAll = false;

  if(!this.visible) {
    return;
  }

  if(this.dirty || this.layer.dirty) {
    this.layer.dirty = false;
    redrawAll = true;
  }

  // var renderWidth = this.canvas.width; // Use Sprite.width/height?
  // var renderHeight = this.canvas.height;

  // //  Scrolling bias; whole pixels only
  // var scrollX = this._scrollX | 0;
  // var scrollY = this._scrollY | 0;

  // var mc = this._mc;
  // var shiftX = mc.scrollX - scrollX; // Negative when scrolling right/down
  // var shiftY = mc.scrollY - scrollY;

  if(!redrawAll) { //&&
      // shiftX === 0 && shiftY === 0 &&
      // mc.renderWidth === renderWidth && mc.renderHeight === renderHeight) {
    //  No reason to redraw map, looking at same thing and not invalidated.
    return;
  }

  this.context.save();
  
  // mc.scrollX = scrollX;
  // mc.scrollY = scrollY;

  // if(mc.renderWidth !== renderWidth || mc.renderHeight !== renderHeight) {
  //   //  Could support automatic canvas resizing
  //   mc.renderWidth = renderWidth;
  //   mc.renderHeight = renderHeight;
  // }

  // if(this.debug) {
  //   this.context.globalAlpha = this.debugSettings.debugAlpha;

  //   if(this.debugSettings.forceFullRedraw) {
  //     redrawAll = true;
  //   }
  // }

  // if(!redrawAll &&
  //     this.renderSettings.enableScrollDelta && (
  //     global.Math.abs(shiftX) + global.Math.abs(shiftY)) < global.Math.min(renderWidth, renderHeight)) {
  //   this.renderDeltaScroll(shiftX, shiftY);
  // } else {
    // Too much change or otherwise requires full render
    this.renderFull();
  // }

  // if(this.debug) {
  //   this.context.globalAlpha = 1;
  //   this.renderDebug();
  // }

  this.texture.update();
  this.dirty = false;
  this.context.restore();

  return true;
};

module.exports = TilemapSprite;
