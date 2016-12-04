var Point = require('../geometry/Point'),
    Mouse = require('../controls/Mouse');

function InputHandler(sprite) {
  this.sprite = sprite;
  this.game = sprite.game;
  
  this.enabled = false;
  this.checked = false;

  this.priorityID = 0;
  this.useHandCursor = false;

  this._setHandCursor = false;

  this.isDragged = false;
  this.allowHorizontalDrag = true;
  this.allowVerticalDrag = true;

  this.bringToTop = false;

  this.snapOffset = null;
  this.snapOnDrag = false;
  this.snapOnRelease = false;

  this.snapX = 0;
  this.snapY = 0;

  this.snapOffsetX = 0;
  this.snapOffsetY = 0;

  this.pixelPerfectOver = false;
  this.pixelPerfectClick = false;
  this.pixelPerfectAlpha = 255;

  this.draggable = false;

  this.boundsRect = null;
  this.boundsSprite = null;

  this.scaleLayer = false;
  
  this.dragFromCenter = false;
  this.dragStartPoint = new Point();
  this.dragOffset = new Point();

  this.snapPoint = new Point();

  this._dragPoint = new Point();
  this._tempPoint = new Point();
  this._dragPhase = false;
  this._wasEnabled = false;

  this._pointerData = [];
  this._pointerData.push(this._defaultPointerData());
};

InputHandler.prototype = {
  
  _defaultPointerButtonData: function () {
    return {
      isDown: false, 
      timeDown: 0,
      timeUp: 0,
      downDuration: 0
    };
  },
  
  _defaultPointerData: function (id) {
    return {
      id: id || 0,
      x: 0,
      y: 0,
      // for touch input:
      isDown: false, // in case of mouse: is any of the buttons down
      isUp: false, // in case of mouse: are all of the buttons up
      timeDown: 0,
      timeUp: 0,
      downDuration: 0,
      // for mouse input:
      leftButton: this._defaultPointerButtonData(),
      middleButton: this._defaultPointerButtonData(),
      rightButton: this._defaultPointerButtonData(),
      // general
      isOver: false,
      isOut: false,
      timeOver: 0,
      timeOut: 0,
      isDragged: false
    };
  },
  
  _getPointerButtonData: function (pointer) {
    if (pointer.button === Mouse.LEFT_BUTTON) {
      return this._pointerData[pointer.id].leftButton;
    }
    if (pointer.button === Mouse.MIDDLE_BUTTON) {
      return this._pointerData[pointer.id].middleButton;
    }
    if (pointer.button === Mouse.RIGHT_BUTTON) {
      return this._pointerData[pointer.id].rightButton;
    }
    return null;
  },

  start: function(priority, useHandCursor) {
    if(useHandCursor === undefined) { useHandCursor = false; }

    priority = priority || 0;

    // Turning on
    if(this.enabled === false) {
      // Register, etc
      this.game.input.interactiveItems.add(this);
      this.useHandCursor = useHandCursor;
      this.priorityID = priority;

      // only ever 1 pointer
      for(var i = 0; i < 1; i++) {
        this._pointerData[i] = this._defaultPointerData(i);
      }

      this.snapOffset = new Point();
      this.enabled = true;

      this._wasEnabled = true;
    }

    // TODO: implement this
    // this.sprite.events.onAddedToGroup.add(this.addedToGroup, this);
    // this.sprite.events.onRemovedFromGroup.add(this.removedFromGroup, this);

    this.flagged = false;

    return this.sprite;
  },

  /*
  addedToGroup: function() {
    if(this._dragPhase) { return; }
    if(this._wasEnabled && !this.enabled) {
      this.start();
    }
  },

  removedFromGroup: function() {
    if(this._dragPhase) { return; }
    if(this.enabled) {
      this._wasEnabled = true;
      this.stop();
    } else {
      this._wasEnabled = false;
    }
  },
  */

  reset: function() {
    this.enabled = false;
    this.flagged = false;

    // only ever 1 pointer
    for(var i = 0; i < 1; i++) {
      this._pointerData[i] = this._defaultPointerData(i);
    }
  },

  stop: function() {
    // Turning off
    if(this.enabled === false) {
      return;
    } else {
      // De-register, etc
      this.enabled = false;
      this.game.input.interactiveItems.remove(this);
    }
  },

  destroy: function() {
    if(this.sprite) {
      if(this._setHandCursor) {
        this.game.canvas.style.cursor = '';
        this._setHandCursor = false;
      }

      this.enabled = false;
      this.game.input.interactiveItems.remove(this);

      this._pointerData.length = 0;
      this.boundsRect = null;
      this.boundsSprite = null;
      this.sprite = null;
    }
  },

  validForInput: function(highestID, highestRenderID, includePixelPerfect) {
    if(includePixelPerfect === undefined) { includePixelPerfect = true; }
    if(!this.enabled || this.sprite.scale.x === 0 || this.sprite.scale.y === 0 ||
        this.priorityID < this.game.input.minPriorityID) {
      return false;
    }

    // If we're trying to specifically IGNORE pixel perfect objects,
    // then set includePixelPerfect to false and skip it
    if(!includePixelPerfect && (
        this.pixelPerfectClick || this.pixelPerfectOver)) {
      return false;
    }

    if(this.priorityID > highestID || (
        this.priorityID === highestID &&
        this.sprite.renderOrderID < highestRenderID)) {
      return true;
    }

    return false;
  },

  isPixelPerfect: function() {
    return (this.pixelPerfectClick || this.pixelPerfectOver);
  },

  pointerX: function(pointer) {
    pointer = pointer || 0;
    return this._pointerData[pointer].x;
  },

  pointerY: function(pointer) {
    pointer = pointer || 0;
    return this._pointerData[pointer].y;
  },

  pointerDown: function(pointer) {
    pointer = pointer || 0;
    return this._pointerData[pointer].isDown;
  },

  pointerUp: function(pointer) {
    pointer = pointer || 0;
    return this._pointerData[pointer].isUp;
  },

  pointerTimeDown: function(pointer) {
    pointer = pointer || 0;
    return this._pointerData[pointer].timeDown;
  },

  pointerTimeUp: function(pointer) {
    pointer = pointer || 0;
    return this._pointerData[pointer].timeUp;
  },

  pointerOver: function(index) {
    if(this.enabled) {
      if(index === undefined) {
        // only ever 1 pointer
        for(var i = 0; i < 1; i++) {
          if(this._pointerData[i].isOver) {
            return true;
          }
        }
      } else {
        return this._pointerData[index].isOver;
      }
    }
    return false;
  },

  pointerOut: function(index) {
    if(this.enabled) {
      if(index === undefined) {
        // only ever 1 pointer
        for(var i = 0; i < 1; i++) {
          if(this._pointerData[i].isOut) {
            return true;
          }
        }
      } else {
        return this._pointerData[index].isOut;
      }
    }
    return false;
  },

  pointerTimeOver: function(pointer) {
    pointer = pointer || 0;
    return this._pointerData[pointer].timeOver;
  },

  pointerTimeOut: function(pointer) {
    pointer = pointer || 0;
    return this._pointerData[pointer].timeOut;
  },

  pointerDragged: function(pointer) {
    pointer = pointer || 0;
    return this._pointerData[pointer].isDragged;
  },

  checkPointerDown: function(pointer, fastTest) {
    if(!pointer.isDown || !this.enabled || !this.sprite ||
        !this.sprite.parent || !this.sprite.visible ||
        !this.sprite.parent.visible) {
      return false;
    }

    // Need to pass it a temp point, in case we need it again for the pixel check
    if(this.game.input.hitTest(this.sprite, pointer, this._tempPoint)) {
      if(fastTest === undefined) { fastTest = false; }
      if(!fastTest && this.pixelPerfectClick) {
        return this.checkPixel(this._tempPoint.x, this._tempPoint.y);
      } else {
        return true;
      }
    }

    return false;
  },

  checkPointerOver: function(pointer, fastTest) {
    if(!this.enabled || !this.sprite || !this.sprite.parent ||
        !this.sprite.visible || !this.sprite.parent.visible) {
      return false;
    }

    // Need to pass it a temp point, in case we need it again for the pixel check
    if(this.game.input.hitTest(this.sprite, pointer, this._tempPoint)) {
      if(fastTest === undefined) { fastTest = false; }

      if(!fastTest && this.pixelPerfectOver) {
        return this.checkPixel(this._tempPoint.x, this._tempPoint.y);
      } else {
        return true;
      }
    }

    return false;
  },

  checkPixel: function(x, y, pointer) {
    // Grab a pixel from our image into the hitCanvas and then test it
    if(this.sprite.texture.baseTexture.source) {
      if(x === null && y === null) {
        // Use the pointer parameter
        this.game.input.getLocalPosition(this.sprite, pointer, this._tempPoint);

        var x = this._tempPoint.x;
        var y = this._tempPoint.y;
      }

      if(this.sprite.anchor.x !== 0) {
        x -= -this.sprite.texture.frame.width * this.sprite.anchor.x;
      }

      if(this.sprite.anchor.y !== 0) {
        y -= -this.sprite.texture.frame.height * this.sprite.anchor.y;
      }

      x += this.sprite.texture.frame.x;
      y += this.sprite.texture.frame.y;

      if(this.sprite.texture.trim) {
        x -= this.sprite.texture.trim.x;
        y -= this.sprite.texture.trim.y;

        // If the coordinates are outside the trim area we return false immediately, to save doing a draw call
        if(x < this.sprite.texture.orig.x || x > this.sprite.texture.orig.right || y < this.sprite.texture.orig.y || y > this.sprite.texture.orig.bottom) {
          this._dx = x;
          this._dy = y;
          return false;
        }
      }

      this._dx = x;
      this._dy = y;

      this.game.input.hitContext.clearRect(0, 0, 1, 1);
      this.game.input.hitContext.drawImage(this.sprite.texture.baseTexture.source, x, y, 1, 1, 0, 0, 1, 1);

      var rgb = this.game.input.hitContext.getImageData(0, 0, 1, 1);
      if(rgb.data[3] >= this.pixelPerfectAlpha) {
        return true;
      }
    }

    return false;
  },

  update: function(pointer) {
    if(this.sprite === null || this.sprite.parent === undefined) { return; }

    if(!this.enabled || !this.sprite.visible || !this.sprite.parent.visible) {
      this._pointerOutHandler(pointer);
      return false;
    }

    if(this.draggable && this._draggedPointerID === pointer.id) {
      return this.updateDrag(pointer);
    } else if(this._pointerData[pointer.id].isOver) {
      if(this.checkPointerOver(pointer)) {
        this._pointerData[pointer.id].x = pointer.x - this.sprite.x;
        this._pointerData[pointer.id].y = pointer.y - this.sprite.y;
        return true;
      } else {
        this._pointerOutHandler(pointer);
        return false;
      }
    }
  },

  _pointerOverHandler: function(pointer) {
    // Abort. We've been destroyed.
    if(this.sprite === null) { return; }

    var sendEvent, data = this._pointerData[pointer.id];
    if(data.isOver === false || pointer.dirty) {
      sendEvent = data.isOver === false;

      data.isOver = true;
      data.isOut = false;
      data.timeOver = this.game.clock.time;
      data.x = pointer.x - this.sprite.x;
      data.y = pointer.y - this.sprite.y;

      if(this.useHandCursor && data.isDragged === false) {
        this.game.canvas.style.cursor = 'pointer';
        this._setHandCursor = true;
      }

      if(sendEvent && this.sprite) {
        this.sprite.emit('inputOver', this.sprite, pointer);
      }
    }
  },

  _pointerOutHandler: function(pointer) {
    // Abort. We've been destroyed.
    if(this.sprite === null) { return; }

    var data = this._pointerData[pointer.id];
        data.isOver = false;
        data.isOut = true;
        data.timeOut = this.game.clock.time;

    if(this.useHandCursor && data.isDragged === false) {
      this.game.canvas.style.cursor = '';
      this._setHandCursor = false;
    }

    if(this.sprite) {
      this.sprite.emit('inputOut', this.sprite, pointer);
    }
  },
  
  // general code for both touch and mouse input, when a down event is detected
  // from outside the appropriate specific (touch or mouse) handler needs to be called!
  _handlePointerDown: function (pointer) {
    if (this.sprite) {
      this.sprite.emit('inputDown', this.sprite, pointer);
    }

    // It's possible the onInputDown event
    // created a new Sprite that is on-top of this one,
    // so we ought to force a Pointer update
    pointer.dirty = true;

    // Start drag
    if (((!pointer.isMouse) || (pointer.button === Mouse.LEFT_BUTTON)) && this.draggable && (this.isDragged === false)) {
      this.startDrag(pointer);
    }

    if (this.bringToTop) {
      this.sprite.bringToTop();
    }
  },

  // for touch input only (not aware of different buttons)
  _touchedHandler: function(pointer) {
    // Abort. We've been destroyed.
    if(this.sprite === null) { return; }

    var data = this._pointerData[pointer.id];
    if(!data.isDown && data.isOver) {
      if(this.pixelPerfectClick && !this.checkPixel(null, null, pointer)) { return; }

      data.isDown = true;
      data.isUp = false;
      data.timeDown = this.game.clock.time;

      this._handlePointerDown(pointer);
    }
  },
  
  // for mouse input (handles different mouse buttons)
  _buttonDownHandler: function(pointer) {
    // Abort. We've been destroyed.
    if(this.sprite === null) { return; }

    var data = this._pointerData[pointer.id],
        buttonData = this._getPointerButtonData(pointer);
    if (!buttonData) { return; } // unrecognized mouse button
    if (!buttonData.isDown && data.isOver) {
      if(this.pixelPerfectClick && !this.checkPixel(null, null, pointer)) { return; }

      data.isDown = true;
      data.isUp = false;
      
      buttonData.isDown = true;
      buttonData.timeDown = this.game.clock.time;

      this._handlePointerDown(pointer);
    }
  },
  
  // general code for both touch and mouse input, when an up event is detected
  // from outside the appropriate specific (touch or mouse) handler needs to be called!
  _handlePointerUp: function (pointer) {
    // Only release the InputUp signal if the
    // pointer is still over this sprite
    var isOver = this.checkPointerOver(pointer);
    if (this.sprite) {
      this.sprite.emit('inputUp', this.sprite, pointer, isOver);

      // The onInputUp event may have changed the sprite so
      // that checkPointerOver is no longer true, so update
      if (isOver) {
        isOver = this.checkPointerOver(pointer);
      }
    }

    this._pointerData[pointer.id].isOver = isOver;

    if (!isOver && this.useHandCursor) {
      this.game.canvas.style.cursor = '';
      this._setHandCursor = false;
    }

    // It's possible the onInputUp event created a new
    // Sprite that is on-top of this one, so force a Pointer update
    pointer.dirty = true;

    // Stop drag
    if ((!pointer.isMouse || (pointer.button === Mouse.LEFT_BUTTON)) && this.draggable && this.isDragged && this._draggedPointerID === pointer.id) {
      this.stopDrag(pointer);
    }
  },
  
  // for touch input only (not aware of different buttons)
  _releasedHandler: function(pointer) {
    // Abort. We've been destroyed.
    if(this.sprite === null) { return; }

    // If was previously touched by this Pointer, 
    // check if still is AND still over this item
    var data = this._pointerData[pointer.id];
    if(data.isDown && pointer.isUp) {
      data.isDown = false;
      data.isUp = true;
      data.timeUp = this.game.clock.time;
      data.downDuration = data.timeUp - data.timeDown;

      this._handlePointerUp(pointer);
    }
  },
  
  // for mouse input (handles different mouse buttons)
  _buttonUpHandler: function(pointer) {
    // Abort. We've been destroyed.
    if(this.sprite === null) { return; }

    // If was previously clicked on by this Pointer, 
    // check if still is AND still over this item
    var data = this._pointerData[pointer.id],
        buttonData = this._getPointerButtonData(pointer);
    if (!buttonData) { return; } // unrecognized mouse button
    if (buttonData.isDown) {
      
      buttonData.isDown = false;
      buttonData.timeUp = this.game.clock.time;
      buttonData.downDuration = buttonData.timeUp - buttonData.timeDown;
      
      data.isDown = data.leftButton.isDown || data.middleButton.isDown || data.rightButton.isDown;
      data.isUp = !data.isDown;

      this._handlePointerUp(pointer);
    }
  },

  _dropHandler: function(pointer) {
    // Abort. Not a droppable.
    if(!this.drop) { return; }

    var data = this._pointerData[pointer.id];
    if(pointer.isUp && this.checkPointerOver(pointer)) {
      pointer.targetObject.sprite.caught = true;
      this.sprite.emit('inputDropped', pointer.targetObject.sprite, pointer);
    }
  },

  updateDrag: function(pointer) {
    if(pointer.isUp) {
      this.stopDrag(pointer);
      return false;
    }

    var px = this.globalToLocalX(pointer.x) + this._dragPoint.x + this.dragOffset.x;
    var py = this.globalToLocalY(pointer.y) + this._dragPoint.y + this.dragOffset.y;
    
    if(this.sprite.fixedToCamera) {
      if(this.allowHorizontalDrag) { this.sprite.cameraOffset.x = px; }
      if(this.allowVerticalDrag) { this.sprite.cameraOffset.y = py; }
      if(this.boundsRect) { this.checkBoundsRect(); }
      if(this.boundsSprite) { this.checkBoundsSprite(); }

      if(this.snapOnDrag) {
        this.sprite.cameraOffset.x = Math.round((this.sprite.cameraOffset.x - (this.snapOffsetX % this.snapX)) / this.snapX) * this.snapX + (this.snapOffsetX % this.snapX);
        this.sprite.cameraOffset.y = Math.round((this.sprite.cameraOffset.y - (this.snapOffsetY % this.snapY)) / this.snapY) * this.snapY + (this.snapOffsetY % this.snapY);
        this.snapPoint.set(this.sprite.cameraOffset.x, this.sprite.cameraOffset.y);
      }
    } else {
      if(this.allowHorizontalDrag) { this.sprite.x = px; }
      if(this.allowVerticalDrag) { this.sprite.y = py; }
      if(this.boundsRect) { this.checkBoundsRect(); }
      if(this.boundsSprite) { this.checkBoundsSprite(); }

      if(this.snapOnDrag) {
        this.sprite.x = Math.round((this.sprite.x - (this.snapOffsetX % this.snapX)) / this.snapX) * this.snapX + (this.snapOffsetX % this.snapX);
        this.sprite.y = Math.round((this.sprite.y - (this.snapOffsetY % this.snapY)) / this.snapY) * this.snapY + (this.snapOffsetY % this.snapY);
        this.snapPoint.set(this.sprite.x, this.sprite.y);
      }
    }

    this.sprite.emit('dragUpdate', this.sprite, pointer, px, py, this.snapPoint);

    return true;
  },

  justOver: function(pointer, delay) {
    pointer = pointer || 0;
    delay = delay || 500;
    return (this._pointerData[pointer].isOver && this.overDuration(pointer) < delay);
  },

  justOut: function(pointer, delay) {
    pointer = pointer || 0;
    delay = delay || 500;
    return (this._pointerData[pointer].isOut && (this.game.clock.time - this._pointerData[pointer].timeOut < delay));
  },

  justPressed: function(pointer, delay) {
    pointer = pointer || 0;
    delay = delay || 500;
    return (this._pointerData[pointer].isDown && this.downDuration(pointer) < delay);
  },

  justReleased: function(pointer, delay) {
    pointer = pointer || 0;
    delay = delay || 500;
    return (this._pointerData[pointer].isUp && (this.game.clock.time - this._pointerData[pointer].timeUp < delay));
  },

  overDuration: function(pointer) {
    pointer = pointer || 0;
    if(this._pointerData[pointer].isOver) {
      return this.game.clock.time - this._pointerData[pointer].timeOver;
    }
    return -1;
  },

  downDuration: function(pointer) {
    pointer = pointer || 0;
    if(this._pointerData[pointer].isDown) {
      return this.game.clock.time - this._pointerData[pointer].timeDown;
    }
    return -1;
  },

  enableDrop: function(accepts) {
    this.drop = true;
  },

  disableDrop: function() {
    this.drop = false;
  },

  enableDrag: function(lockCenter, bringToTop, pixelPerfect, alphaThreshold, boundsRect, boundsSprite) {
    if(lockCenter === undefined) { lockCenter = false; }
    if(bringToTop === undefined) { bringToTop = false; }
    if(pixelPerfect === undefined) { pixelPerfect = false; }
    if(alphaThreshold === undefined) { alphaThreshold = 255; }
    if(boundsRect === undefined) { boundsRect = null; }
    if(boundsSprite === undefined) { boundsSprite = null; }

    this._dragPoint = new Point();
    this.draggable = true;
    this.bringToTop = bringToTop;
    this.dragOffset = new Point();
    this.dragFromCenter = lockCenter;

    this.pixelPerfectClick = pixelPerfect;
    this.pixelPerfectAlpha = alphaThreshold;

    if(boundsRect) {
      this.boundsRect = boundsRect;
    }

    if(boundsSprite) {
      this.boundsSprite = boundsSprite;
    }
  },

  disableDrag: function() {
    if(this._pointerData) {
      // only ever 1 pointer
      for(var i = 0; i < 1; i++) {
        this._pointerData[i].isDragged = false;
      }
    }
    this.draggable = false;
    this.isDragged = false;
    this._draggedPointerID = -1;
  },

  startDrag: function(pointer) {
    var x = this.sprite.x;
    var y = this.sprite.y;

    this.isDragged = true;
    this._draggedPointerID = pointer.id;
    this._pointerData[pointer.id].isDragged = true;

    if(this.sprite.fixedToCamera) {
      if(this.dragFromCenter) {
        this.sprite.centerOn(pointer.x, pointer.y);
        this._dragPoint.setTo(this.sprite.cameraOffset.x - pointer.x, this.sprite.cameraOffset.y - pointer.y);
      } else {
        this._dragPoint.setTo(this.sprite.cameraOffset.x - pointer.x, this.sprite.cameraOffset.y - pointer.y);
      }
    } else {
      if(this.dragFromCenter) {
        var bounds = this.sprite.getBounds();

        this.sprite.x = this.globalToLocalX(pointer.x) + (this.sprite.x - bounds.centerX);
        this.sprite.y = this.globalToLocalY(pointer.y) + (this.sprite.y - bounds.centerY);
      }

      this._dragPoint.setTo(this.sprite.x - this.globalToLocalX(pointer.x), this.sprite.y - this.globalToLocalY(pointer.y));
    }

    this.updateDrag(pointer);

    if(this.bringToTop) {
      this._dragPhase = true;
      this.sprite.bringToTop();
    }

    this.dragStartPoint.set(x, y);
    this.sprite.emit('dragStart', this.sprite, pointer, x, y);
  },

  globalToLocalX: function(x) {
    if(this.scaleLayer) {
      x -= this.game.scale.grid.boundsFluid.x;
      x *= this.game.scale.grid.scaleFluidInversed.x;
    }
    return x;
  },

  globalToLocalY: function(y) {
    if(this.scaleLayer) {
      y -= this.game.scale.grid.boundsFluid.y;
      y *= this.game.scale.grid.scaleFluidInversed.y;
    }
    return y;
  },

  stopDrag: function(pointer) {
    this.isDragged = false;
    this._draggedPointerID = -1;
    this._pointerData[pointer.id].isDragged = false;
    this._dragPhase = false;

    if(this.snapOnRelease) {
      if(this.sprite.fixedToCamera) {
        this.sprite.cameraOffset.x = Math.round((this.sprite.cameraOffset.x - (this.snapOffsetX % this.snapX)) / this.snapX) * this.snapX + (this.snapOffsetX % this.snapX);
        this.sprite.cameraOffset.y = Math.round((this.sprite.cameraOffset.y - (this.snapOffsetY % this.snapY)) / this.snapY) * this.snapY + (this.snapOffsetY % this.snapY);
      } else {
        this.sprite.x = Math.round((this.sprite.x - (this.snapOffsetX % this.snapX)) / this.snapX) * this.snapX + (this.snapOffsetX % this.snapX);
        this.sprite.y = Math.round((this.sprite.y - (this.snapOffsetY % this.snapY)) / this.snapY) * this.snapY + (this.snapOffsetY % this.snapY);
      }
    }

    this.sprite.emit('dragStop', this.sprite, pointer);

    if(this.checkPointerOver(pointer) === false) {
      this._pointerOutHandler(pointer);
    }
  },

  setDragLock: function(allowHorizontal, allowVertical) {
    if(allowHorizontal === undefined) { allowHorizontal = true; }
    if(allowVertical === undefined) { allowVertical = true; }

    this.allowHorizontalDrag = allowHorizontal;
    this.allowVerticalDrag = allowVertical;
  },

  enableSnap: function(snapX, snapY, onDrag, onRelease, snapOffsetX, snapOffsetY) {
    if(onDrag === undefined) { onDrag = true; }
    if(onRelease === undefined) { onRelease = false; }
    if(snapOffsetX === undefined) { snapOffsetX = 0; }
    if(snapOffsetY === undefined) { snapOffsetY = 0; }

    this.snapX = snapX;
    this.snapY = snapY;
    this.snapOffsetX = snapOffsetX;
    this.snapOffsetY = snapOffsetY;
    this.snapOnDrag = onDrag;
    this.snapOnRelease = onRelease;
  },

  disableSnap: function() {
    this.snapOnDrag = false;
    this.snapOnRelease = false;
  },

  checkBoundsRect: function() {
    if(this.sprite.fixedToCamera) {
      if(this.sprite.cameraOffset.x < this.boundsRect.left) {
        this.sprite.cameraOffset.x = this.boundsRect.left;
      } else if((this.sprite.cameraOffset.x + this.sprite.width) > this.boundsRect.right) {
        this.sprite.cameraOffset.x = this.boundsRect.right - this.sprite.width;
      }

      if(this.sprite.cameraOffset.y < this.boundsRect.top) {
        this.sprite.cameraOffset.y = this.boundsRect.top;
      } else if((this.sprite.cameraOffset.y + this.sprite.height) > this.boundsRect.bottom) {
        this.sprite.cameraOffset.y = this.boundsRect.bottom - this.sprite.height;
      }
    } else {
      if(this.sprite.left < this.boundsRect.left) {
        this.sprite.x = this.boundsRect.x + this.sprite.offsetX;
      } else if(this.sprite.right > this.boundsRect.right) {
        this.sprite.x = this.boundsRect.right - (this.sprite.width - this.sprite.offsetX);
      }
      if(this.sprite.top < this.boundsRect.top) {
        this.sprite.y = this.boundsRect.top + this.sprite.offsetY;
      } else if(this.sprite.bottom > this.boundsRect.bottom) {
        this.sprite.y = this.boundsRect.bottom - (this.sprite.height - this.sprite.offsetY);
      }
    }
  },

  checkBoundsSprite: function() {
    if(this.sprite.fixedToCamera && this.boundsSprite.fixedToCamera) {
      if(this.sprite.cameraOffset.x < this.boundsSprite.cameraOffset.x) {
        this.sprite.cameraOffset.x = this.boundsSprite.cameraOffset.x;
      } else if((this.sprite.cameraOffset.x + this.sprite.width) > (this.boundsSprite.cameraOffset.x + this.boundsSprite.width)) {
        this.sprite.cameraOffset.x = (this.boundsSprite.cameraOffset.x + this.boundsSprite.width) - this.sprite.width;
      }

      if(this.sprite.cameraOffset.y < this.boundsSprite.cameraOffset.y) {
        this.sprite.cameraOffset.y = this.boundsSprite.cameraOffset.y;
      } else if((this.sprite.cameraOffset.y + this.sprite.height) > (this.boundsSprite.cameraOffset.y + this.boundsSprite.height)) {
        this.sprite.cameraOffset.y = (this.boundsSprite.cameraOffset.y + this.boundsSprite.height) - this.sprite.height;
      }
    } else {
      if(this.sprite.left < this.boundsSprite.left) {
        this.sprite.x = this.boundsSprite.left + this.sprite.offsetX;
      } else if(this.sprite.right > this.boundsSprite.right) {
        this.sprite.x = this.boundsSprite.right - (this.sprite.width - this.sprite.offsetX);
      }

      if(this.sprite.top < this.boundsSprite.top) {
        this.sprite.y = this.boundsSprite.top + this.sprite.offsetY;
      } else if(this.sprite.bottom > this.boundsSprite.bottom) {
        this.sprite.y = this.boundsSprite.bottom - (this.sprite.height - this.sprite.offsetY);
      }

      // if(this.sprite.x < this.boundsSprite.x)
      // {
      //    this.sprite.x = this.boundsSprite.x;
      // }
      // else if((this.sprite.x + this.sprite.width) > (this.boundsSprite.x + this.boundsSprite.width))
      // {
      //    this.sprite.x = (this.boundsSprite.x + this.boundsSprite.width) - this.sprite.width;
      // }

      // if(this.sprite.y < this.boundsSprite.y)
      // {
      //    this.sprite.y = this.boundsSprite.y;
      // }
      // else if((this.sprite.y + this.sprite.height) > (this.boundsSprite.y + this.boundsSprite.height))
      // {
      //    this.sprite.y = (this.boundsSprite.y + this.boundsSprite.height) - this.sprite.height;
      // }
    }
  }
};

InputHandler.prototype.constructor = InputHandler;

module.exports = InputHandler;
