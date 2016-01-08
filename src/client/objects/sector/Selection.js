
var engine = require('engine');

function Selection(manager) {
  this.manager = manager;
  this.game = manager.game;
  this.socket = manager.socket;
  this.shipsGroup = manager.shipsGroup;
  this.trajectoryGraphics = manager.trajectoryGraphics;
  
  this.pixelPerfectAlpha = 1.0;

  this._tempPoint = new engine.Point();

  // subscribe to messages
  this.game.on('gui/selected', this._selected, this);
  this.game.input.on('onTap', this._tap, this);
}

Selection.prototype.constructor = Selection;

Selection.prototype.destroy = function() {
  this.game.removeListener('gui/selected', this._selected);

  this.manager = this.game =
    this.socket = this.shipsGroup =
    this.trajectoryGraphics = undefined;
};

Selection.prototype._tap = function(pointer, doubleTap) {
  var point;
  if(doubleTap) {
    pointer.button = engine.Mouse.RIGHT_BUTTON;
    this._selected(pointer, new engine.Rectangle(pointer.x, pointer.y, 1, 1));
  }
};

Selection.prototype._selected = function(pointer, rectangle) {
  var target, highest,
      highestRenderOrderID = global.Number.MAX_VALUE,
      point, ship,
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
      if(child.selected && rectangle.volume <= 300) {
        selected.push(child);
      }
    }
  });

  // always update
  if(pointer.button === engine.Mouse.LEFT_BUTTON) {
    if(rectangle.volume <= 300) {
      for(var s in select) {
        if(this._checkPixel(select[s], pointer) &&
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
    point = game.world.worldTransform.applyInverse(rectangle);
    
    this.trajectoryTween && this.trajectoryTween.stop();
    this.trajectoryGraphics.clear();
    this.trajectoryGraphics.alpha = 1.0;

    for(var i=0; i<selected.length; i++) {
      ship = selected[i];
      if(ship.isPlayer && !ship.destroyed) {
        movement = ship.movement;
        this.socket.emit('ship/plot', {
          uuid: ship.uuid,
          destination: point,
          current: movement.current,
          previous: movement.previous,
          rotation: ship.rotation
        });
        movement.plot(point);
        if(ship.movement.valid) {
          ship.movement.drawDebug();
        }
      }
    }

    this.trajectoryTween = this.game.tweens.create(this.trajectoryGraphics);
    this.trajectoryTween.to({ alpha: 0.0 }, 500, engine.Easing.Quadratic.InOut);
    this.trajectoryTween.start();
  }
};

Selection.prototype._checkPixel = function(sprite, pointer) {
  var x, y,
      input = this.game.input;
  if(sprite.texture.baseTexture.source) {
    input.getLocalPosition(sprite, pointer, this._tempPoint);
    x = this._tempPoint.x;
    y = this._tempPoint.y;

    if(sprite.anchor.x !== 0) {
      x -= -sprite.texture.frame.width * sprite.anchor.x;
    }

    if(sprite.anchor.y !== 0) {
      y -= -sprite.texture.frame.height * sprite.anchor.y;
    }

    x += sprite.texture.frame.x;
    y += sprite.texture.frame.y;

    if(sprite.texture.trim) {
      x -= sprite.texture.trim.x;
      y -= sprite.texture.trim.y;

      // if the coordinates are outside the trim area we return
      // false immediately, to save doing a draw call
      if(x < sprite.texture.crop.x || x > sprite.texture.crop.right ||
          y < sprite.texture.crop.y || y > sprite.texture.crop.bottom) {
        this._dx = x;
        this._dy = y;
        return false;
      }
    }

    this._dx = x;
    this._dy = y;

    input.hitContext.clearRect(0, 0, 1, 1);
    input.hitContext.drawImage(sprite.texture.baseTexture.source, x, y, 1, 1, 0, 0, 1, 1);

    var rgb = input.hitContext.getImageData(0, 0, 1, 1);
    if(rgb.data[3] >= this.pixelPerfectAlpha) {
      return true;
    }
  }

  return false;
};

module.exports = Selection;
