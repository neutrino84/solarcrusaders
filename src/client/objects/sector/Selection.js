
var engine = require('engine'),
    Indicator = require('./misc/Indicator');

function Selection(manager) {
  this.manager = manager;
  this.game = manager.game;
  this.socket = this.game.net.socket;
  
  this.pixelPerfectAlpha = 1.0;
  this.tempPoint = new engine.Point();
  this.shipsGroup = manager.shipManager.shipsGroup;

  // icon
  this.indicator = new Indicator(this.game);
  this.shipsGroup.add(this.indicator);

  // subscribe to messages
  this.game.on('gui/selected', this._selected, this);
};

Selection.prototype.constructor = Selection;

Selection.prototype.destroy = function() {
  this.game.removeListener('gui/selected', this._selected);

  this.manager = this.game =
    this.socket = this.shipsGroup = undefined;
};

Selection.prototype._plot = function(ship, destination) {
  // show icon
  this.indicator.show(destination);
  
  // plot server
  this.socket.emit('ship/plot', {
    uuid: ship.uuid,
    destination: destination,
    current: ship.movement.current,
    previous: ship.movement.previous,
    rotation: ship.rotation
  });

  // plot local
  ship.movement.plot(destination);
};

Selection.prototype._selected = function(pointer, rectangle) {
  var target, highest,
      highestRenderOrderID = global.Number.MAX_VALUE,
      destination, ship,
      select = [],
      player = [],
      targets = [],
      selected = [];

  this.shipsGroup.forEach(function(child) {
    if(pointer.button === engine.Mouse.LEFT_BUTTON) {
      if(child.overlap(rectangle)) {
        select.push(child);
      }
      if(child.isPlayer) {
        player.push(child);

        if(child.target) {
          targets.push(child.target);
        }
      }
    }
    if(pointer.button === engine.Mouse.RIGHT_BUTTON) {
      if(child.selected) {
        selected.push(child);
      }
    }
  });

  // always update
  if(pointer.button === engine.Mouse.LEFT_BUTTON) {
    if(rectangle.volume <= 300) {
      for(var s in select) {
        if(this._checkPixel(select[s].chassis, pointer) &&
            select[s].renderOrderID < highestRenderOrderID) {
          highest = select[s];
          highestRenderOrderID = select[s].renderOrderID;
        }
      }
      select = highest ? [highest].concat(targets) : select;
    }
    this.game.emit('ships/selected', select.concat(player));
  }

  if(selected.length > 0) {
    destination = this.shipsGroup.worldTransform.applyInverse(pointer);
    
    for(var i=0; i<selected.length; i++) {
      ship = selected[i];
      if(ship.isPlayer && !ship.destroyed) {
        this._plot(ship, destination);
      }
    }
  }
};

Selection.prototype._checkPixel = function(sprite, pointer) {
  var x, y,
      input = this.game.input,
      texture = sprite.texture;
  if(texture.baseTexture.source) {
    input.getLocalPosition(sprite, pointer, this.tempPoint);
    x = this.tempPoint.x;
    y = this.tempPoint.y;

    if(sprite.anchor.x !== 0) {
      x -= -texture.frame.width * sprite.anchor.x;
    }

    if(sprite.anchor.y !== 0) {
      y -= -texture.frame.height * sprite.anchor.y;
    }

    x += texture.frame.x;
    y += texture.frame.y;

    if(texture.trim) {
      x -= texture.trim.x;
      y -= texture.trim.y;

      // if the coordinates are outside the trim area we return
      // false immediately, to save doing a draw call
      if(x < texture.crop.x || x > texture.crop.right ||
          y < texture.crop.y || y > texture.crop.bottom) {
        this._dx = x;
        this._dy = y;
        return false;
      }
    }

    this._dx = x;
    this._dy = y;

    input.hitContext.clearRect(0, 0, 1, 1);
    input.hitContext.drawImage(texture.baseTexture.source, x, y, 1, 1, 0, 0, 1, 1);

    var rgb = input.hitContext.getImageData(0, 0, 1, 1);
    if(rgb.data[3] >= this.pixelPerfectAlpha) {
      return true;
    }
  }

  return false;
};

module.exports = Selection;
