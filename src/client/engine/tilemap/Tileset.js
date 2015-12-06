
function Tileset(name, firstgid, width, height, margin, spacing, properties) {
  if(width === undefined || width <= 0) { width = 32; }
  if(height === undefined || height <= 0) { height = 32; }
  if(margin === undefined) { margin = 0; }
  if(spacing === undefined) { spacing = 0; }

  this.name = name;
  this.firstgid = firstgid | 0;

  this.tileWidth = width | 0;
  this.tileHeight = height | 0;

  this.tileMargin = margin | 0;
  this.tileSpacing = spacing | 0;

  this.properties = properties || {};

  this.image = null;
  this.rows = 0;
  this.columns = 0;
  this.total = 0;

  this.drawCoords = [];
};

Tileset.prototype = {

  draw: function(context, x, y, index) {
    //  Correct the tile index for the set and bias for interlacing
    var coordIndex = (index - this.firstgid) << 1;

    if(coordIndex >= 0 && (coordIndex + 1) < this.drawCoords.length) {
      context.drawImage(
        this.image,
        this.drawCoords[coordIndex],
        this.drawCoords[coordIndex + 1],
        this.tileWidth,
        this.tileHeight,
        x,
        y,
        this.tileWidth,
        this.tileHeight
      );
    }
  },

  containsTileIndex: function(tileIndex) {
    return (
      tileIndex >= this.firstgid &&
      tileIndex < (this.firstgid + this.total)
    );
  },

  setImage: function(image) {
    this.image = image;
    this.updateTileData(image.width, image.height);
  },

  setSpacing: function(margin, spacing) {
    this.tileMargin = margin | 0;
    this.tileSpacing = spacing | 0;

    if(this.image) {
      this.updateTileData(this.image.width, this.image.height);
    }
  },

  updateTileData: function(imageWidth, imageHeight) {
    // May be fractional values
    var rowCount = (imageHeight - this.tileMargin * 2 + this.tileSpacing) / (this.tileHeight + this.tileSpacing);
    var colCount = (imageWidth - this.tileMargin * 2 + this.tileSpacing) / (this.tileWidth + this.tileSpacing);

    if(rowCount % 1 !== 0 || colCount % 1 !== 0) {
      console.warn("Tileset - image tile area is not an even multiple of tile size");
    }

    // In Tiled a tileset image that is not an even multiple of the tile dimensions
    // is truncated - hence the floor when calculating the rows/columns.
    rowCount = global.Math.floor(rowCount);
    colCount = global.Math.floor(colCount);

    if((this.rows && this.rows !== rowCount) || (this.columns && this.columns !== colCount)) {
      console.warn("Tileset - actual and expected number of tile rows and columns differ");
    }

    this.rows = rowCount;
    this.columns = colCount;
    this.total = rowCount * colCount;

    this.drawCoords.length = 0;

    var tx = this.tileMargin;
    var ty = this.tileMargin;
    for(var y = 0; y < this.rows; y++) {
      for(var x = 0; x < this.columns; x++) {
        this.drawCoords.push(tx);
        this.drawCoords.push(ty);
        tx += this.tileWidth + this.tileSpacing;
      }

      tx = this.tileMargin;
      ty += this.tileHeight + this.tileSpacing;
    }
  }
};

Tileset.prototype.constructor = Tileset;

module.exports = Tileset;
