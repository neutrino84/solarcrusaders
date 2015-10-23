
var fs = require('fs');

module.exports = {
  exists: function(path, callback) {
    fs.stat(path, function(err, stat) {
      callback(!err && stat);
    });
  },

  existsSync: function(path) {
    var exists = false;
    try {
      exists = fs.statSync(path);
    } catch(err) {
      exists = false;
    }
    return !!exists;
  }
};
