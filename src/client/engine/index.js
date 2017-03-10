var Device = require('./system/Device'),
    Game = require('./core/Game'),
    State = require('./core/State'),
    Group = require('./core/Group'),
    Sprite = require('./display/Sprite'),
    Shader = require('./display/Shader'),
    Particle = require('./display/Particle'),
    Graphics = require('./display/Graphics'),
    Font = require('./display/Font'),
    Strip = require('./display/Strip'),
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
    Timer = require('./time/Timer');

var core = module.exports =
  Object.assign(require('./const'), {
    // core
    Device: Device,
    Game: Game,
    State: State,

    // display
    Group: Group,
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

    // time
    Timer: Timer,

    // utils
    Math: Math,
    Class: Class,
    Color: Color
  });
