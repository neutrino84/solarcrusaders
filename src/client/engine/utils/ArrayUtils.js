
var Math = require('./Math');

var ArrayUtils = {

  getRandomItem: function(objects, startIndex, length) {
    if(objects == null) { return null; }
    if(startIndex === undefined) { startIndex = 0; }
    if(length === undefined) { length = objects.length; }

    var randomIndex = startIndex + global.Math.floor(Math.random() * length);
    return objects[randomIndex] === undefined ? null : objects[randomIndex];
  },

  removeRandomItem: function(objects, startIndex, length) {
    if(objects == null) { return null; }
    if(startIndex === undefined) { startIndex = 0; }
    if(length === undefined) { length = objects.length; }

    var randomIndex = startIndex + global.Math.floor(Math.random() * length);
    if(randomIndex < objects.length) {
      var removed = objects.splice(randomIndex, 1);
      return removed[0] === undefined ? null : removed[0];
    } else {
      return null;
    }
  },

  shuffle: function(array) {
    for(var i = array.length - 1; i > 0; i--) {
      var j = global.Math.floor(Math.random() * (i + 1));
      var temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }

    return array;
  },

  transposeMatrix: function(array) {
    var sourceRowCount = array.length;
    var sourceColCount = array[0].length;

    var result = new Array(sourceColCount);
    for(var i = 0; i < sourceColCount; i++) {
      result[i] = new Array(sourceRowCount);
      for(var j = sourceRowCount - 1; j > -1; j--) {
        result[i][j] = array[j][i];
      }
    }

    return result;
  },

  rotateMatrix: function(matrix, direction) {
    if(typeof direction !== 'string') {
      direction = ((direction % 360) + 360) % 360;
    }

    if(direction === 90 || direction === -270 || direction === 'rotateLeft') {
      matrix = ArrayUtils.transposeMatrix(matrix);
      matrix = matrix.reverse();
    } else if(direction === -90 || direction === 270 || direction === 'rotateRight') {
      matrix = matrix.reverse();
      matrix = ArrayUtils.transposeMatrix(matrix);
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

  rotate: function(array) {
    var s = array.shift();
    array.push(s);
    return s;
  },

  numberArray: function(start, end) {
    var result = [];
    for(var i = start; i <= end; i++) {
      result.push(i);
    }
    return result;
  },

  numberArrayStep: function(start, end, step) {
    if(start === undefined || start === null) { start = 0; }
    if(end === undefined || end === null) {
      end = start;
      start = 0;
    }

    if(step === undefined) { step = 1; }

    var result = [];
    var total = global.Math.max(Math.roundAwayFromZero((end - start) / (step || 1)), 0);
    for(var i = 0; i < total; i++) {
      result.push(start);
      start += step;
    }

    return result;
  }

};

module.exports = ArrayUtils;
