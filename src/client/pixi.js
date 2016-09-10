// run the polyfills
require('./polyfill');

var core = module.exports = require('../libs/pixi.js/src/core');
    core.mesh = require('../libs/pixi.js/src/mesh');
    // core.particles = require('../libs/pixi.js/src/particles');
    core.filters = {
      BlurFilter: require('../libs/pixi.js/src/filters/blur/BlurFilter')//,
      // DisplacementFilter: require('../libs/pixi.js/src/filters/displacement/DisplacementFilter'),
      // ColorMatrixFilter: require('../libs/pixi.js/src/filters/colormatrix/ColorMatrixFilter')
    };
    
    // sc pixi shims
    core.TRANSFORM_MODE.DEFAULT = 1;

// add core plugins.
// core.extras         = require('../libs/pixi.js/src/extras'); 
// core.filters        = require('../libs/pixi.js/src/filters');
// core.interaction    = require('../libs/pixi.js/src/interaction');
// core.loaders        = require('../libs/pixi.js/src/loaders');

// export a premade loader instance
/**
 * A premade instance of the loader that can be used to loader resources.
 *
 * @name loader
 * @memberof PIXI
 * @property {PIXI.loaders.Loader}
 */
// core.loader = new core.loaders.Loader();

// mixin the deprecation features.
// Object.assign(core, require('./deprecation'));
