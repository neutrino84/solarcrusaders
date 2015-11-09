
var engine = require('engine'),
    Graphics = engine.Graphics,
    Class = engine.Class;

function Selection(game) {
  Graphics.call(this, game);

  this.sprite = this;
  this.camera = game.camera;

  this.enabled = false;
  this.isDragged = false;
  this.priorityID = 0;
  this.consumePointerEvent = false;

  this.blendMode = engine.BlendMode.ADD;

  this._dragStartPoint = new engine.Point();
  this._dragPoint = new engine.Point();
  
  this._tempStartPoint = new engine.Point();
  this._tempPoint = new engine.Point();
  this._tempVector = new engine.Point();

  this._pointerData = [];
  this._pointerData.push({
    id: 0,
    x: 0,
    y: 0,
    isDown: false,
    isUp: false,
    isOver: false,
    isOut: false,
    isDragged: false
  });
};

Selection.prototype = Object.create(Graphics.prototype);
Selection.prototype.constructor = Selection;

Selection.prototype.start = function() {
  if(this.enabled === false) {
    this.enabled = true;
    this.game.input.interactiveItems.add(this);

    // only ever 1 pointer
    for(var i=0; i<1; i++) {
      this._pointerData[i] = {
        id: i,
        x: 0,
        y: 0,
        isDown: false,
        isUp: false,
        isOver: false,
        isOut: false,
        isDragged: false
      };
    }
  }
};

Selection.prototype.reset = function() {
  this.enabled = false;

  // only ever 1 pointer
  for(var i=0; i<1; i++) {
    this._pointerData[i] = {
      id: i,
      x: 0,
      y: 0,
      isDown: false,
      isUp: false,
      isOver: false,
      isOut: false,
      isDragged: false
    };
  }
};

Selection.prototype.stop = function() {
  if(this.enabled === false) {
    return;
  } else {
    this.enabled = false;
    this.game.input.interactiveItems.remove(this);
  }
};

Selection.prototype.validForInput = function(highestID, highestRenderID) {
  if(!this.enabled || this.priorityID < this.game.input.minPriorityID) { return false; }
  if(this.priorityID > highestID || this.priorityID === highestID) { return true; }
  return false;
};

Selection.prototype.checkPointerDown = function(pointer, fastTest) {
  if(!pointer.isDown || !this.enabled) { return false; }
  return true;
};

Selection.prototype.checkPointerOver = function(pointer, fastTest) {
  if(!this.enabled) { return false; }
  return true;
};

Selection.prototype.update = function(pointer) {
  if(pointer) {
    if(!this.enabled) {
      this._pointerOutHandler(pointer);
      return false;
    }
    if(this._draggedPointerID === pointer.id) {
      return this._updateDrag(pointer);
    }
  } else if(this.isDragged) {
    this._updateVector();
    this._drawDrag();
  }
};

Selection.prototype._pointerOverHandler = function(pointer) {
  var data = this._pointerData[pointer.id];
  if(data.isOver === false || pointer.dirty) {
    data.isOver = true;
    data.isOut = false;
    data.x = pointer.x;
    data.y = pointer.y;
  }
}

Selection.prototype._pointerOutHandler = function(pointer) {
  var data = this._pointerData[pointer.id];
      data.isOver = false;
      data.isOut = true;
}

Selection.prototype._touchedHandler = function(pointer) {
  var data = this._pointerData[pointer.id];
  if(!data.isDown) {
    data.isDown = true;
    data.isUp = false;

    pointer.dirty = true;

    if(this.isDragged === false) {
      this._startDrag(pointer);
    }
  }

  // consume the event?
  return this.consumePointerEvent;
}

Selection.prototype._releasedHandler = function(pointer) {
  var data = this._pointerData[pointer.id];
  if(data.isDown && pointer.isUp) {
    data.isDown = false;
    data.isUp = true;

    pointer.dirty = true;

    // Stop drag
    if(this.isDragged && this._draggedPointerID === pointer.id) {
      this._stopDrag(pointer);
    }
  }
}

Selection.prototype._startDrag = function(pointer) {
  var x = pointer.x,
      y = pointer.y,
      position = this.camera.position;

  this.isDragged = true;

  this._draggedPointerID = pointer.id;
  this._pointerData[pointer.id].isDragged = true;

  this._dragPoint.setTo(0, 0);
  this._dragStartPoint.set(x, y);

  this._tempStartPoint.copyFrom(position);
  this._tempPoint.copyFrom(position);
  this._tempVector.setTo(0, 0);

  this._updateDrag(pointer);
};

Selection.prototype._updateDrag = function(pointer) {
  if(pointer.isUp) {
    this._stopDrag(pointer);
    return false;
  }

  // update view vec
  this._updateVector();

  // dragged size (width/height)
  var px = pointer.x - this._dragStartPoint.x,
      py = pointer.y - this._dragStartPoint.y;
  this._dragPoint.setTo(px, py);

  // draw drag
  this._drawDrag();
};

Selection.prototype._updateVector = function() {
  this._tempPoint.copyFrom(this.camera.position);
  this._tempVector = engine.Point.subtract(this._tempStartPoint, this._tempPoint, this._tempVector);
};

Selection.prototype._drawDrag = function() {
  var sx = this._dragStartPoint.x,
      sy = this._dragStartPoint.y,
      px = this._dragPoint.x,
      py = this._dragPoint.y;

  this.clear();
  this.lineStyle(1.0, 0xFFFFFF, 0.75);
  this.beginFill(0xFFFFFF, 0.25);
  this.drawRect(sx, sy, px, py);
  this.endFill();
}

Selection.prototype._stopDrag = function(pointer) {
  var sx = this._dragStartPoint.x,
      sy = this._dragStartPoint.y,
      px = pointer.x,
      py = pointer.y;

  this.isDragged = false;
  this._draggedPointerID = -1;
  this._pointerData[pointer.id].isDragged = false;

  // emit selected bounding rect
  this.emit('selected', engine.Rectangle.aabb([
    {x: sx, y: sy}, {x: px, y: py}
  ]));

  // clear rect
  this.clear();
};

module.exports = Selection;
