
function FrameData() {
  this._frames = [];
  this._frameNames = [];
};

FrameData.prototype = {

  addFrame: function(frame) {
    frame.index = this._frames.length;
    this._frames.push(frame);

    if(frame.name !== '') {
      this._frameNames[frame.name] = frame.index;
    }

    return frame;
  },

  getFrame: function(index) {
    if(index >= this._frames.length) {
      index = 0;
    }
    return this._frames[index];
  },

  getFrameByName: function(name) {
    if(typeof this._frameNames[name] === 'number') {
      return this._frames[this._frameNames[name]];
    }
    return null;
  },

  checkFrameName: function(name) {
    if(this._frameNames[name] == null) {
      return false;
    }
    return true;
  },

  clone: function() {
    var output = new FrameData();

    //  No input array, so we loop through all frames
    for(var i = 0; i < this._frames.length; i++) {
      output._frames.push(this._frames[i].clone());
    }

    for(var p in this._frameNames) {
      if(this._frameNames.hasOwnProperty(p)) {
        output._frameNames.push(this._frameNames[p]);
      }
    }

    return output;
  },

  getFrameRange: function(start, end, output) {
    if(output === undefined) { output = []; }
    for(var i = start; i <= end; i++) {
      output.push(this._frames[i]);
    }
    return output;
  },

  getFrames: function(frames, useNumericIndex, output) {
    if(useNumericIndex === undefined) { useNumericIndex = true; }
    if(output === undefined) { output = []; }
    if(frames === undefined || frames.length === 0) {
      //  No input array, so we loop through all frames
      for(var i = 0; i < this._frames.length; i++) {
        //  We only need the indexes
        output.push(this._frames[i]);
      }
    } else {
      //  Input array given, loop through that instead
      for(var i = 0; i < frames.length; i++) {
        //  Does the input array contain names or indexes?
        if(useNumericIndex) {
          //  The actual frame
          output.push(this.getFrame(frames[i]));
        } else {
          //  The actual frame
          output.push(this.getFrameByName(frames[i]));
        }
      }
    }
    return output;
  },

  getFrameIndexes: function(frames, useNumericIndex, output) {
    if(useNumericIndex === undefined) { useNumericIndex = true; }
    if(output === undefined) { output = []; }

    if(frames === undefined || frames.length === 0) {
      //  No frames array, so we loop through all frames
      for(var i = 0; i < this._frames.length; i++) {
        output.push(this._frames[i].index);
      }
    } else {
      //  Input array given, loop through that instead
      for(var i = 0; i < frames.length; i++) {
        //  Does the frames array contain names or indexes?
        if(useNumericIndex) {
          output.push(this._frames[frames[i]].index);
        } else {
          if(this.getFrameByName(frames[i])) {
            output.push(this.getFrameByName(frames[i]).index);
          }
        }
      }
    }

    return output;
  },

  destroy: function() {
    this._frames = null;
    this._frameNames = null;
  }

};

FrameData.prototype.constructor = FrameData;

Object.defineProperty(FrameData.prototype, 'total', {
  get: function() {
    return this._frames.length;
  }
});

module.exports = FrameData;
