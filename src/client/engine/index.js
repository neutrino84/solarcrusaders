var Device = require('./system/Device'),
    Game = require('./core/Game'),
    State = require('./core/State'),
    // Batch = require('./core/Batch'),
    Group = require('./core/Group'),
    Sprite = require('./display/Sprite'),
    Shader = require('./display/Shader'),
    Particle = require('./display/Particle'),
    Graphics = require('./display/Graphics'),
    Font = require('./display/Font'),
    Strip = require('./display/Strip'),
    Pinned = require('./display/transforms/Pinned'),
    Math = require('./utils/Math'),
    Color = require('./utils/Color'),
    Keyboard = require('./controls/Keyboard'),
    Mouse = require('./controls/Mouse'),
    Pointer = require('./controls/Pointer'),
    InputHandler = require('./controls/InputHandler'),
    Class = require('./utils/Class'),
    Point = require('./geometry/Point'),
    Line = require('./geometry/Line'),
    Rectangle = require('./geometry/Rectangle'),
    Circle = require('./geometry/Circle'),
    Ellipse = require('./geometry/Ellipse'),
    Emitter = require('./particles/Emitter'),
    Easing = require('./tween/Easing'),
    // Tilemap = require('./tilemap/Tilemap'),
    // TilemapLayer = require('./tilemap/TilemapLayer'),
    // TilemapSprite = require('./tilemap/TilemapSprite'),
    // TilemapPathing = require('./tilemap/TilemapPathing'),
    // Tileset = require('./tilemap/Tileset'),
    // Tile = require('./tilemap/Tile'),

    // plugins
    WireframeRenderer = require('./renderers/WireframeRenderer');

var core = module.exports =
  Object.assign(require('./const'), {
    // core
    Device: Device,
    Game: Game,
    State: State,

    // display
    // Batch: Batch,
    Group: Group,
    Pinned: Pinned,
    Sprite: Sprite,
    Shader: Shader,
    Particle: Particle,
    Graphics: Graphics,
    Font: Font,
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
    InputHandler: InputHandler,

    // particles
    Emitter: Emitter,

    // tweens
    Easing: Easing,

    // tilemap
    // Tilemap: Tilemap,
    // TilemapLayer: TilemapLayer,
    // TilemapSprite: TilemapSprite,
    // TilemapPathing: TilemapPathing,
    // Tileset: Tileset,
    // Tile: Tile,

    // utils
    Math: Math,
    Class: Class,
    Color: Color
  });
