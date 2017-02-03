
function FrameData() {
  this._frames = [];
  this._frameNames = {};
};

FrameData.prototype = {

  addFrame: function(frame) {
    this._frames.push(frame);
    if(frame.name) {
      this._frameNames[frame.name] = frame;
    }
    return frame;
  },

  getFrame: function(index) {
    return this._frames[index];
  },

  getFrameByName: function(name) {
    return this._frameNames[name];
  },

  clone: function() {
    var output = new FrameData();
    for(var i=0; i<this._frames.length; i++) {
      output._frames.push(this._frames[i].clone());
    }
    for(var name in this._frameNames) {
      output._frameNames = this._frameNames[name];
    }
    return output;
  },

  getFrameRange: function(start, end, output) {
    if(output === undefined) { output = []; }
    for(var i=start; i<=end; i++) {
      output.push(this._frames[i]);
    }
    return output;
  },

  getFrameIndexes: function(frames, useNumericIndex, output) {
    if(useNumericIndex === undefined) { useNumericIndex = true; }
    if(output === undefined) { output = []; }
    if(frames === undefined || frames.length === 0) {
      for(var i=0; i<this._frames.length; i++) {
        output.push(this._frames[i].index);
      }
    } else {
      for(var i=0; i<frames.length; i++) {
        if(useNumericIndex) {
          output.push(this._frames[frames[i]].index);
        } else {
          if(this._frameNames[frames[i]]) {
            output.push(this._frameNames[frames[i]].index);
          }
        }
      }
    }
    return output;
  },

  destroy: function() {
    this._frames = undefined;
    this._frameNames = undefined;
  }
};

FrameData.prototype.constructor = FrameData;

Object.defineProperty(FrameData.prototype, 'total', {
  get: function() {
    return this._frames.length;
  }
});

module.exports = FrameData;
