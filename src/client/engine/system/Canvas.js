
 var Canvas = {

  create: function(width, height, id) {
    width = width || 256;
    height = height || 256;

    var canvas = global.document.createElement('canvas');
    if(typeof id === 'string' && id !== '') {
      canvas.id = id;
    }

    canvas.width = width;
    canvas.height = height;
    canvas.style.display = 'block';

    return canvas;
  },

  addToDOM: function(canvas, parent) {
    var target;
    if(parent) {
      if(typeof parent === 'string') {
        // hopefully an element ID
        target = document.getElementById(parent);
      } else if(typeof parent === 'object' && parent.nodeType === 1) {
        // quick test for a HTMLelement
        target = parent;
      }
    }

    if(!target)
      target = document.body;
    
    target.appendChild(canvas);

    return canvas;
  },

  setTouchAction: function(canvas, value) {
    value = value || 'none';

    canvas.style.msTouchAction = value;
    canvas.style['ms-touch-action'] = value;
    canvas.style['touch-action'] = value;

    return canvas;
  },

  setUserSelect: function(canvas, value) {
    value = value || 'none';

    canvas.style['-webkit-touch-callout'] = value;
    canvas.style['-webkit-user-select'] = value;
    canvas.style['-khtml-user-select'] = value;
    canvas.style['-moz-user-select'] = value;
    canvas.style['-ms-user-select'] = value;
    canvas.style['user-select'] = value;
    canvas.style['-webkit-tap-highlight-color'] = 'rgba(0, 0, 0, 0)';

    return canvas;
  },

  setContextMenu: function(canvas, enable) {
    if(!enable) {
      canvas.oncontextmenu = function (e) {
        e.preventDefault();
      };
    } else {
      canvas.oncontextmenu = null;
    }
  },

  setSmoothingEnabled: function(context, value) {
    var s = Canvas.getSmoothingPrefix(context);
    if(s) {
      context[s] = value;
    }
    return context;
  },

  getSmoothingPrefix: function(context) {
    var s, vendor = [ 'i', 'webkitI', 'msI', 'mozI', 'oI' ];
    for(var prefix in vendor) {
      s = vendor[prefix] + 'mageSmoothingEnabled';
      if(s in context) {
        return s;
      }
    }
    return null;
  }

};

module.exports = Canvas;
