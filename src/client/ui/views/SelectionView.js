
var engine = require('engine'),
    Graphics = engine.Graphics,
    View = require('../View');

function SelectionView(game) {
  Graphics.call(this, game);
  View.call(this);

  this.sprite = this;
  this.world = game.world;
  this.camera = game.camera;

  this.enabled = false;
  this.isDragged = false;
  this.objectRenderer = 'wireframe';
  this.priorityID = 1;

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

SelectionView.prototype = Object.create(Graphics.prototype);
SelectionView.prototype.mixinPrototype(View.prototype);
SelectionView.prototype.constructor = SelectionView;

SelectionView.prototype.start = function() {
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

SelectionView.prototype.reset = function() {
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

SelectionView.prototype.stop = function() {
  if(this.enabled === false) {
    return;
  } else {
    this.enabled = false;
    this.game.input.interactiveItems.remove(this);
  }
};

SelectionView.prototype.validForInput = function(highestID, highestRenderID) {
  if(!this.enabled || this.priorityID < this.game.input.minPriorityID) { return false; }
  if(this.priorityID > highestID || this.priorityID === highestID) { return true; }
  return false;
};

SelectionView.prototype.checkPointerDown = function(pointer, fastTest) {
  if(!pointer.isDown || !this.enabled) { return false; }
  return true;
};

SelectionView.prototype.checkPointerOver = function(pointer, fastTest) {
  if(!this.enabled) { return false; }
  return true;
};

SelectionView.prototype.update = function(pointer) {
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

SelectionView.prototype._pointerOverHandler = function(pointer) {
  var data = this._pointerData[pointer.id];
  if(data.isOver === false || pointer.dirty) {
    data.isOver = true;
    data.isOut = false;
    data.x = pointer.x;
    data.y = pointer.y;
  }
};

SelectionView.prototype._pointerOutHandler = function(pointer) {
  var data = this._pointerData[pointer.id];
      data.isOver = false;
      data.isOut = true;
};

SelectionView.prototype._touchedHandler = function(pointer) {
  var data = this._pointerData[pointer.id];
  if(!data.isDown) {
    data.isDown = true;
    data.isUp = false;

    pointer.dirty = true;

    if(this.isDragged === false && pointer.button === engine.Mouse.LEFT_BUTTON) {
      this._startDrag(pointer);
    } else if(pointer.button === engine.Mouse.RIGHT_BUTTON) {
      this._selected(pointer);
    }
  }
};

SelectionView.prototype._buttonDownHandler = SelectionView.prototype._touchedHandler;

SelectionView.prototype._releasedHandler = function(pointer) {
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
};

SelectionView.prototype._buttonUpHandler = SelectionView.prototype._releasedHandler;

SelectionView.prototype._startDrag = function(pointer) {
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

SelectionView.prototype._updateDrag = function(pointer) {
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

SelectionView.prototype._updateVector = function() {
  this._tempPoint.copyFrom(this.camera.position);
  this._tempVector = engine.Point.subtract(this._tempPoint, this._tempStartPoint, this._tempVector);
  this._tempVector.multiply(this.world.scale.x, this.world.scale.y);
};

SelectionView.prototype._drawDrag = function() {
  var sx = this._dragStartPoint.x - this._tempVector.x,
      sy = this._dragStartPoint.y - this._tempVector.y,
      px = this._dragPoint.x + this._tempVector.x,
      py = this._dragPoint.y + this._tempVector.y;

  this.clear();
  this.lineStyle(2.0, 0x336699, 0.75);
  this.drawRect(sx, sy, px, py);
};

SelectionView.prototype._stopDrag = function(pointer) {
  var sx = this._dragStartPoint.x - this._tempVector.x,
      sy = this._dragStartPoint.y - this._tempVector.y,
      px = pointer.x,
      py = pointer.y,
      rect = engine.Rectangle.aabb([
        {x: sx, y: sy}, {x: px, y: py}
      ]);

  this.isDragged = false;
  this._draggedPointerID = -1;
  this._pointerData[pointer.id].isDragged = false;

  // non-zero bounding box
  if(rect.volume === 0) {
    rect.resize(2, 2);
    rect.centerOn(pointer.x, pointer.y);
  }

  // emit selected bounding rect
  this._selected(pointer, rect);

  // clear rect
  this.clear();
};

SelectionView.prototype._selected = function(pointer, rect) {
  this.emit('selected', pointer, rect || new engine.Rectangle(pointer.x-1, pointer.y-1, 2, 2));
};

module.exports = SelectionView;
