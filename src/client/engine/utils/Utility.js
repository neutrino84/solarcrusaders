
module.exports = {
  splice: function(arr, i) {
    var tmp = arr[i],
        len = arr.length;
    arr[i] = arr[len - 1];
    delete arr[len - 1];
    arr.length--;
  }
};
