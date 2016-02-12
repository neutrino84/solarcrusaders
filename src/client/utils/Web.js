
function Web() {};

Web.getQueryParameter = function(value, fallback) {
  var parameters = Web.getQueryParameters();
  if(parameters[value]) {
    if(parameters[value] === 'false') {
      return false;
    } else if(parameters[value] === 'true') {
      return true;
    } else {
      return parameters[value];
    }
  } else {
    return fallback;
  }
};

Web.getQueryParameters = function() {
  var search = global.location.search.substring(1).replace(/\+/g,' '),
      ptq = function(q) {
        var x = q.replace(/;/g,'&').split('&'),
            i, name, t;
        for(q={}, i=0; i<x.length; i++) {
          t = x[i].split('=', 2);
          name = unescape(t[0]);
          if(t.length > 1) {
            q[name] = unescape(t[1]);
          } else {
            q[name] = true;
          }
        }
        return q;
      };
  return ptq(search);
};

module.exports = Web;
