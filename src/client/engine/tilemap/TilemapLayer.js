
var pixi = require('pixi'),
    Const = require('../const'),
    Sprite = require('../display/Sprite'),
    Canvas = require('../system/Canvas'),
    Device = require('../system/Device');

function TilemapLayer(game, tilemap, index, width, height) {
  width |= 0;
  height |= 0;

  Sprite.call(this, game, 0, 0);

  ////..
  // this.pivot.set(game.width / 2, game.height / 2);
  ////..

  this.map = tilemap;
  this.index = index;
  this.layer = tilemap.layers[index];
  this.type = Const.TILEMAPLAYER;
  
  this.canvas = Canvas.create(width, height);
  this.context = this.canvas.getContext('2d');

  this.texture = new pixi.Texture(new pixi.BaseTexture(this.canvas));

  this.renderSettings = {
    enableScrollDelta: true,
    overdrawRatio: 0.20,
    copyCanvas: null
  };

  this.debug = false;
  this.exists = true;

  this.debugSettings = {
    missingImageFill: 'rgb(255,255,255)',
    debuggedTileOverfill: 'rgba(0,255,0,0.4)',

    forceFullRedraw: true,

    debugAlpha: 0.5,
    facingEdgeStroke: 'rgba(0,255,0,1)',
    collidingTileOverfill: 'rgba(0,255,0,0.2)'
  };

  this.scrollFactorX = 1;
  this.scrollFactorY = 1;

  this.dirty = true;
  this.rayStepRate = 4;

  this._wrap = false;
  this._mc = {

    // Used to bypass rendering without reliance on `dirty` and detect changes.
    scrollX: 0,
    scrollY: 0,
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

  this._scrollX = 0;
  this._scrollY = 0;
  this._results = [];

  if(!Device.canvasBitBltShift) {
    this.renderSettings.copyCanvas = TilemapLayer.ensureSharedCopyCanvas();
  }

  this.fixedToCamera = true;
};

TilemapLayer.prototype = Object.create(Sprite.prototype);
TilemapLayer.prototype.constructor = TilemapLayer;

TilemapLayer.sharedCopyCanvas = null;
TilemapLayer.ensureSharedCopyCanvas = function() {
  if(!this.sharedCopyCanvas) {
    this.sharedCopyCanvas = Canvas.create(2, 2);
  }
  return this.sharedCopyCanvas;
};

TilemapLayer.prototype.postUpdate = function() {
  var camera = this.game.camera;

  Sprite.prototype.postUpdate.call(this);

  this.scrollX = camera.x;
  this.scrollY = camera.y;

  this.render();
};

TilemapLayer.prototype.destroy = function() {
  Canvas.remove(this);
  Destroy.prototype.destroy.call(this);
};

TilemapLayer.prototype.resize = function(width, height) {
  this.canvas.width = width;
  this.canvas.height = height;

  this.texture.frame.width = width;
  this.texture.frame.height = height;

  this.texture.width = width;
  this.texture.height = height;

  this.texture.crop.width = width;
  this.texture.crop.height = height;

  this.texture.baseTexture.width = width;
  this.texture.baseTexture.height = height;

  this.texture.update();
  this.texture.requiresUpdate = true;

  this.texture._updateUvs();

  this.dirty = true;
};

TilemapLayer.prototype.resizeWorld = function() {
  this.game.world.setBounds(0, 0, this.layer.widthInPixels * this.scale.x, this.layer.heightInPixels * this.scale.y);
};

TilemapLayer.prototype._fixX = function(x) {
  if(x < 0) { x = 0; }
  if(this.scrollFactorX === 1) {
    return x;
  }
  return this._scrollX + (x - (this._scrollX / this.scrollFactorX));
};

TilemapLayer.prototype._unfixX = function(x) {
  if(this.scrollFactorX === 1) {
    return x;
  }
  return (this._scrollX / this.scrollFactorX) + (x - this._scrollX);
};

TilemapLayer.prototype._fixY = function(y) {
  if(y < 0) { y = 0; }
  if(this.scrollFactorY === 1) {
    return y;
  }
  return this._scrollY + (y - (this._scrollY / this.scrollFactorY));
};

TilemapLayer.prototype._unfixY = function(y) {
  if(this.scrollFactorY === 1) {
    return y;
  }
  return (this._scrollY / this.scrollFactorY) + (y - this._scrollY);
};

TilemapLayer.prototype.getTileX = function(x) {
  // var tileWidth = this.tileWidth * this.scale.x;
  return global.Math.floor(this._fixX(x) / this._mc.tileWidth);
};

TilemapLayer.prototype.getTileY = function(y) {
  // var tileHeight = this.tileHeight * this.scale.y;
  return global.Math.floor(this._fixY(y) / this._mc.tileHeight);
};

TilemapLayer.prototype.getTileXY = function(x, y, point) {
  point.x = this.getTileX(x);
  point.y = this.getTileY(y);

  return point;
};

TilemapLayer.prototype.getRayCastTiles = function(line, stepRate, collides, interestingFace) {
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

TilemapLayer.prototype.getTiles = function(x, y, width, height, collides, interestingFace) {
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

TilemapLayer.prototype.resolveTileset = function(tileIndex) {
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

TilemapLayer.prototype.resetTilesetCache = function() {
  var tilesets = this._mc.tilesets;
  while(tilesets.length) {
    tilesets.pop();
  }
};

TilemapLayer.prototype.setScale = function(xScale, yScale) {
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

TilemapLayer.prototype.shiftCanvas = function(context, x, y) {
  var canvas = context.canvas;
  var copyW = canvas.width - global.Math.abs(x);
  var copyH = canvas.height - global.Math.abs(y);

  //  When x/y non-negative
  var dx = 0;
  var dy = 0;
  var sx = x;
  var sy = y;

  if(x < 0) {
    dx = -x;
    sx = 0;
  }

  if(y < 0) {
    dy = -y;
    sy = 0;
  }

  var copyCanvas = this.renderSettings.copyCanvas;
  if(copyCanvas) {
    // Use a second copy buffer, without slice support, for Safari .. again.
    // Ensure copy canvas is large enough
    if(copyCanvas.width < copyW || copyCanvas.height < copyH) {
      copyCanvas.width = copyW;
      copyCanvas.height = copyH;
    }

    var copyContext = copyCanvas.getContext('2d');
    copyContext.clearRect(0, 0, copyW, copyH);
    copyContext.drawImage(canvas, dx, dy, copyW, copyH, 0, 0, copyW, copyH);
    // clear allows default 'source-over' semantics
    context.clearRect(sx, sy, copyW, copyH);
    context.drawImage(copyCanvas, 0, 0, copyW, copyH, sx, sy, copyW, copyH);
  } else {
    // Avoids a second copy but flickers in Safari / Safari Mobile
    // Ref. https://github.com/photonstorm/phaser/issues/1439
    context.save();
    context.globalCompositeOperation = 'copy';
    context.drawImage(canvas, dx, dy, copyW, copyH, sx, sy, copyW, copyH);
    context.restore();
  }
};

TilemapLayer.prototype.renderRegion = function(scrollX, scrollY, left, top, right, bottom) {
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

TilemapLayer.prototype.renderDeltaScroll = function(shiftX, shiftY) {
  var scrollX = this._mc.scrollX;
  var scrollY = this._mc.scrollY;

  var renderW = this.canvas.width;
  var renderH = this.canvas.height;

  var tw = this._mc.tileWidth;
  var th = this._mc.tileHeight;

  // Only cells with coordinates in the 'plus' formed by `left <= x <= right` OR `top <= y <= bottom` are drawn. These coordinates may be outside the layer bounds.

  // Start in pixels
  var left = 0;
  var right = -tw;
  var top = 0;
  var bottom = -th;
  if(shiftX < 0) { // layer moving left, damage right
    left = renderW + shiftX; // shiftX neg.
    right = renderW - 1;
  } else if(shiftX > 0) {
    // left -> 0
    right = shiftX;
  }

  if(shiftY < 0) { // layer moving down, damage top
    top = renderH + shiftY; // shiftY neg.
    bottom = renderH - 1;
  } else if(shiftY > 0) {
    // top -> 0
    bottom = shiftY;
  }

  this.shiftCanvas(this.context, shiftX, shiftY);

  // Transform into tile-space
  left = global.Math.floor((left + scrollX) / tw);
  right = global.Math.floor((right + scrollX) / tw);
  top = global.Math.floor((top + scrollY) / th);
  bottom = global.Math.floor((bottom + scrollY) / th);

  if(left <= right) {
    // Clear left or right edge
    this.context.clearRect(((left * tw) - scrollX), 0, (right - left + 1) * tw, renderH);

    var trueTop = global.Math.floor((0 + scrollY) / th);
    var trueBottom = global.Math.floor((renderH - 1 + scrollY) / th);
    this.renderRegion(scrollX, scrollY, left, trueTop, right, trueBottom);
  }

  if(top <= bottom) {
    // Clear top or bottom edge
    this.context.clearRect(0, ((top * th) - scrollY), renderW, (bottom - top + 1) * th);

    var trueLeft = global.Math.floor((0 + scrollX) / tw);
    var trueRight = global.Math.floor((renderW - 1 + scrollX) / tw);
    this.renderRegion(scrollX, scrollY, trueLeft, top, trueRight, bottom);
  }
};

TilemapLayer.prototype.renderFull = function() {
  var scrollX = this._mc.scrollX;
  var scrollY = this._mc.scrollY;

  var renderW = this.canvas.width;
  var renderH = this.canvas.height;

  var tw = this._mc.tileWidth;
  var th = this._mc.tileHeight;

  var left = global.Math.floor(scrollX / tw);
  var right = global.Math.floor((renderW - 1 + scrollX) / tw);
  var top = global.Math.floor(scrollY / th);
  var bottom = global.Math.floor((renderH - 1 + scrollY) / th);

  this.context.clearRect(0, 0, renderW, renderH);
  this.renderRegion(scrollX, scrollY, left, top, right, bottom);
};

TilemapLayer.prototype.render = function() {
  var redrawAll = false;

  if(!this.visible) {
    return;
  }

  if(this.dirty || this.layer.dirty) {
    this.layer.dirty = false;
    redrawAll = true;
  }

  var renderWidth = this.canvas.width; // Use Sprite.width/height?
  var renderHeight = this.canvas.height;

  //  Scrolling bias; whole pixels only
  var scrollX = this._scrollX | 0;
  var scrollY = this._scrollY | 0;

  var mc = this._mc;
  var shiftX = mc.scrollX - scrollX; // Negative when scrolling right/down
  var shiftY = mc.scrollY - scrollY;

  if(!redrawAll &&
      shiftX === 0 && shiftY === 0 &&
      mc.renderWidth === renderWidth && mc.renderHeight === renderHeight) {
    //  No reason to redraw map, looking at same thing and not invalidated.
    return;
  }

  this.context.save();
  
  mc.scrollX = scrollX;
  mc.scrollY = scrollY;

  if(mc.renderWidth !== renderWidth || mc.renderHeight !== renderHeight) {
    //  Could support automatic canvas resizing
    mc.renderWidth = renderWidth;
    mc.renderHeight = renderHeight;
  }

  if(this.debug) {
    this.context.globalAlpha = this.debugSettings.debugAlpha;

    if(this.debugSettings.forceFullRedraw) {
      redrawAll = true;
    }
  }

  if(!redrawAll &&
      this.renderSettings.enableScrollDelta && (
      global.Math.abs(shiftX) + global.Math.abs(shiftY)) < global.Math.min(renderWidth, renderHeight)) {
    this.renderDeltaScroll(shiftX, shiftY);
  } else {
    // Too much change or otherwise requires full render
    this.renderFull();
  }

  if(this.debug) {
    this.context.globalAlpha = 1;
    this.renderDebug();
  }

  this.texture.update();
  this.dirty = false;
  this.context.restore();

  return true;
};

TilemapLayer.prototype.renderDebug = function() {
  var scrollX = this._mc.scrollX;
  var scrollY = this._mc.scrollY;

  var context = this.context;
  var renderW = this.canvas.width;
  var renderH = this.canvas.height;

  var width = this.layer.width;
  var height = this.layer.height;
  var tw = this._mc.tileWidth;
  var th = this._mc.tileHeight;

  var left = global.Math.floor(scrollX / tw);
  var right = global.Math.floor((renderW - 1 + scrollX) / tw);
  var top = global.Math.floor(scrollY / th);
  var bottom = global.Math.floor((renderH - 1 + scrollY) / th);

  var baseX = (left * tw) - scrollX;
  var baseY = (top * th) - scrollY;

  var normStartX = (left + ((1 << 20) * width)) % width;
  var normStartY = (top + ((1 << 20) * height)) % height;

  var tx, ty, x, y, xmax, ymax;

  context.strokeStyle = this.debugSettings.facingEdgeStroke;

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
      if(!tile || tile.index < 0 || !tile.collides) {
        continue;
      }

      if(this.debugSettings.collidingTileOverfill) {
        context.fillStyle = this.debugSettings.collidingTileOverfill;
        context.fillRect(tx, ty, this._mc.cw, this._mc.ch);
      }

      if(this.debugSettings.facingEdgeStroke) {
        context.beginPath();

        if(tile.faceTop) {
          context.moveTo(tx, ty);
          context.lineTo(tx + this._mc.cw, ty);
        }

        if(tile.faceBottom) {
          context.moveTo(tx, ty + this._mc.ch);
          context.lineTo(tx + this._mc.cw, ty + this._mc.ch);
        }

        if(tile.faceLeft) {
          context.moveTo(tx, ty);
          context.lineTo(tx, ty + this._mc.ch);
        }

        if(tile.faceRight) {
          context.moveTo(tx + this._mc.cw, ty);
          context.lineTo(tx + this._mc.cw, ty + this._mc.ch);
        }

        context.stroke();
      }
    }
  }
};


Object.defineProperty(TilemapLayer.prototype, 'wrap', {
  get: function() {
    return this._wrap;
  },

  set: function(value) {
    this._wrap = value;
    this.dirty = true;
  }
});

Object.defineProperty(TilemapLayer.prototype, 'scrollX', {
  get: function() {
    return this._scrollX;
  },

  set: function(value) {
    this._scrollX = value;
  }
});

Object.defineProperty(TilemapLayer.prototype, 'scrollY', {
  get: function() {
    return this._scrollY;
  },

  set: function(value) {
    this._scrollY = value;
  }
});

Object.defineProperty(TilemapLayer.prototype, 'collisionWidth', {
  get: function() {
    return this._mc.cw;
  },

  set: function(value) {
    this._mc.cw = value | 0;
    this.dirty = true;
  }
});

Object.defineProperty(TilemapLayer.prototype, 'collisionHeight', {
  get: function() {
    return this._mc.ch;
  },

  set: function(value) {
    this._mc.ch = value | 0;
    this.dirty = true;
  }
});

module.exports = TilemapLayer;
