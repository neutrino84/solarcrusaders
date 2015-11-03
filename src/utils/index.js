
module.exports = {
  extend: function(origin, add) {
    if(!add || typeof add !== 'object') {
      return origin;
    }
    var keys = Object.keys(add),
        i = keys.length;
    while (i--) {
      origin[keys[i]] = add[keys[i]];
    }
    return origin;
  }
};
