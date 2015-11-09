
function Layout() {};

Layout.NONE = 0;
Layout.LEFT = 1;
Layout.RIGHT = 2;
Layout.TOP = 4;
Layout.BOTTOM = 8;
Layout.CENTER = 16;
Layout.HORIZONTAL = 32;
Layout.VERTICAL = 64;
Layout.TEMPORARY = 128;
Layout.STRETCH = 256;

Layout.UsePsSize = Layout.USE_PS_SIZE = 512;

Layout.TopLeft = Layout.LEFT  | Layout.TOP;
Layout.TopRight = Layout.RIGHT | Layout.TOP;
Layout.BottomLeft = Layout.LEFT  | Layout.BOTTOM;
Layout.BottomRight = Layout.RIGHT | Layout.prototype.BOTTOM;

module.exports = Layout;
