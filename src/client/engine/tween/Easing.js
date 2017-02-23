
var Easing = {
  Linear: {
    None: function(k) {
      return k;
    }
  },

  Quadratic: {
    In: function(k) {
      return k * k;
    },

    Out: function(k) {
      return k * (2 - k);
    },

    InOut: function(k) {
      if((k *= 2) < 1) {
        return 0.5 * k * k;
      }
      return -0.5 * (--k * (k - 2) - 1);
    }
  },

  Sinusoidal: {
    In: function(k) {
      if(k === 0) return 0;
      if(k === 1) return 1;
      return 1 - global.Math.cos(k * global.Math.PI / 2);
    },

    Out: function(k) {
      if(k === 0) return 0;
      if(k === 1) return 1;
      return global.Math.sin(k * global.Math.PI / 2);
    },

    InOut: function(k) {
      if(k === 0) return 0;
      if(k === 1) return 1;
      return 0.5 * ( 1 - global.Math.cos(global.Math.PI * k));
    }
  }
};

Easing.Default = Easing.Linear.None;

Easing.getNameFromValue = function(value) {
  switch(value) {
    case Easing.Linear.None:
      return 'Easing.Linear.None';
    case Easing.Quadratic.In:
      return 'Easing.Quadratic.In';
    case Easing.Quadratic.Out:
      return 'Easing.Quadratic.Out';
    case Easing.Quadratic.InOut:
      return 'Easing.Quadratic.InOut';
    case Easing.Sinusoidal.In:
      return 'Easing.Sinusoidal.In';
    case Easing.Sinusoidal.Out:
      return 'Easing.Sinusoidal.Out';
    case Easing.Sinusoidal.InOut:
      return 'Easing.Sinusoidal.InOut';
  }
};

module.exports = Easing;
