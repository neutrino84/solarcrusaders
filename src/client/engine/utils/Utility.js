
var Math = require('./Math');

var Utility = {

  splice: function(arr, index) {
    var j = index,
        length = arr.length;
    if(length) {
      while(j < length) {
        arr[j++] = arr[j];
      }
      --arr.length;
    }
  },

  random: function(arr, start, length) {
    var start = start || 0,
        length = length || arr.length,
        index = start + global.Math.floor(global.Math.random() * length);
    return arr[index] === undefined ? null : arr[index];
  },

  randomRemove: function(arr, start, length) {
    var start = start || 0,
        length = length || arr.length,
        index = start + global.Math.floor(global.Math.random() * length);
    if(index < arr.length) {
      var removed = Utility.splice(index, 1);
      return removed[0] === undefined ? null : removed[0];
    } else {
      return null;
    }
  },

  shuffle: function(arr) {
    var j, temp;
    for(var i=arr.length-1; i>0; i--) {
      j = global.Math.floor(global.Math.random() * (i + 1));
      temp = arr[i];
      arr[i] = arr[j];
      arr[j] = temp;
    }
    return arr;
  },

  transposeMatrix: function(arr) {
    var sourceRowCount = arr.length,
        sourceColCount = arr[0].length,
        result = new Array(sourceColCount);
    for(var i = 0; i < sourceColCount; i++) {
      result[i] = new Array(sourceRowCount);
      for(var j = sourceRowCount - 1; j > -1; j--) {
        result[i][j] = arr[j][i];
      }
    }
    return result;
  },

  rotateMatrix: function(matrix, direction) {
    if(typeof direction !== 'string') {
      direction = ((direction % 360) + 360) % 360;
    }
    if(direction === 90 || direction === -270 || direction === 'rotateLeft') {
      matrix = Utility.transposeMatrix(matrix);
      matrix = matrix.reverse();
    } else if(direction === -90 || direction === 270 || direction === 'rotateRight') {
      matrix = matrix.reverse();
      matrix = Utility.transposeMatrix(matrix);
    } else if(Math.abs(direction) === 180 || direction === 'rotate180') {
      for(var i = 0; i < matrix.length; i++) {
        matrix[i].reverse();
      }
      matrix = matrix.reverse();
    }
    return matrix;
  },

  findClosest: function(value, arr) {
    if(!arr.length) {
      return NaN;
    } else if(arr.length === 1 || value < arr[0]) {
      return arr[0];
    }

    var i = 1;
    while(arr[i] < value) {
      i++;
    }

    var low = arr[i - 1];
    var high = (i < arr.length) ? arr[i] : Number.POSITIVE_INFINITY;
    return ((high - value) <= (value - low)) ? high : low;
  },

  rotate: function(arr) {
    var s = arr.shift();
        arr.push(s);
    return s;
  },

  numberArray: function(start, end) {
    var result = [];
    for(var i=start; i<=end; i++) {
      result.push(i);
    }
    return result;
  },

  numberArrayStep: function(start, end, step) {
    var result = [],
        end = end || 0,
        start = start || 0,
        step = step || 1,
        total = global.Math.max(Math.roundAwayFromZero((end - start) / (step || 1)), 0);
    for(var i = 0; i < total; i++) {
      result.push(start);
      start += step;
    }
    return result;
  }
};

module.exports = Utility;
