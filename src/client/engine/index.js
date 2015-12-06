var Device = require('./system/Device'),
    Game = require('./core/Game'),
    State = require('./core/State'),
    Batch = require('./core/Batch'),
    Group = require('./core/Group'),
    Sprite = require('./display/Sprite'),
    Particle = require('./display/Particle'),
    Graphics = require('./display/Graphics'),
    RetroFont = require('./display/RetroFont'),
    Strip = require('./display/Strip'),
    Math = require('./utils/Math'),
    Color = require('./utils/Color'),
    Keyboard = require('./controls/Keyboard'),
    Mouse = require('./controls/Mouse'),
    Pointer = require('./controls/Pointer'),
    Class = require('./utils/Class'),
    Point = require('./geometry/Point'),
    Line = require('./geometry/Line'),
    Rectangle = require('./geometry/Rectangle'),
    Circle = require('./geometry/Circle'),
    Ellipse = require('./geometry/Ellipse'),
    Emitter = require('./particles/Emitter'),
    Easing = require('./tween/Easing'),
    Tilemap = require('./tilemap/Tilemap'),
    TilemapLayer = require('./tilemap/TilemapLayer'),
    TilemapSprite = require('./tilemap/TilemapSprite'),
    TilemapPathing = require('./tilemap/TilemapPathing'),
    Tileset = require('./tilemap/Tileset'),
    Tile = require('./tilemap/Tile');

var core = module.exports =
  Object.assign(require('./const'), {
    // core
    Device: Device,
    Game: Game,
    State: State,

    // display
    Batch: Batch,
    Group: Group,
    Sprite: Sprite,
    Particle: Particle,
    Graphics: Graphics,
    RetroFont: RetroFont,
    Strip: Strip,

    // geometry
    Point: Point,
    Line: Line,
    Rectangle: Rectangle,
    Circle: Circle,
    Ellipse: Ellipse,

    // controls
    Keyboard: Keyboard,
    Mouse: Mouse,
    Pointer: Pointer,

    // particles
    Emitter: Emitter,

    // tweens
    Easing: Easing,

    // tilemap
    Tilemap: Tilemap,
    TilemapLayer: TilemapLayer,
    TilemapSprite: TilemapSprite,
    TilemapPathing: TilemapPathing,
    Tileset: Tileset,
    Tile: Tile,

    // utils
    Math: Math,
    Class: Class,
    Color: Color
  });
