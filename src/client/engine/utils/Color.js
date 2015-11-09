
var Color = {

  getColor: function(r, g, b) {
    return r << 16 | g << 8 | b;
  },

  getRGB: function(color) {
    if(color > 16777215) {
      // The color value has an alpha component
      return {
        alpha: color >>> 24,
        red: color >> 16 & 0xFF,
        green: color >> 8 & 0xFF,
        blue: color & 0xFF,
        a: color >>> 24,
        r: color >> 16 & 0xFF,
        g: color >> 8 & 0xFF,
        b: color & 0xFF
      };
    } else {
      return {
          alpha: 255,
          red: color >> 16 & 0xFF,
          green: color >> 8 & 0xFF,
          blue: color & 0xFF,
          a: 255,
          r: color >> 16 & 0xFF,
          g: color >> 8 & 0xFF,
          b: color & 0xFF
      };
    }
  },

  interpolateColor: function(color1, color2, steps, currentStep) {
    var src1 = Color.getRGB(color1);
    var src2 = Color.getRGB(color2);
    var r = (((src2.red - src1.red) * currentStep) / steps) + src1.red;
    var g = (((src2.green - src1.green) * currentStep) / steps) + src1.green;
    var b = (((src2.blue - src1.blue) * currentStep) / steps) + src1.blue;

    return Color.getColor(r, g, b);
  },

  interpolateColorWithRGB: function(color, r, g, b, steps, currentStep) {
    var src = Color.getRGB(color);
    var or = (((r - src.red) * currentStep) / steps) + src.red;
    var og = (((g - src.green) * currentStep) / steps) + src.green;
    var ob = (((b - src.blue) * currentStep) / steps) + src.blue;

    return Color.getColor(or, og, ob);
  },

  interpolateRGB: function(r1, g1, b1, r2, g2, b2, steps, currentStep) {
    var r = (((r2 - r1) * currentStep) / steps) + r1;
    var g = (((g2 - g1) * currentStep) / steps) + g1;
    var b = (((b2 - b1) * currentStep) / steps) + b1;

    return Color.getColor(r, g, b);
  }
};

module.exports = Color;
