
module.exports = {
  extend: function(origin, add, exists) {
    if(!add || typeof add !== 'object') { return origin; }
    var keys = Object.keys(add),
        i = keys.length;
    while(i--) {
      if(exists !== undefined) {
        if(exists === false && !origin[keys[i]]) {
          origin[keys[i]] = add[keys[i]];
        } else if(exists === true && origin[keys[i]]) {
          origin[keys[i]] = add[keys[i]];
        }
      } else {
        origin[keys[i]] = add[keys[i]];
      }
    }
    return origin;
  }
};
