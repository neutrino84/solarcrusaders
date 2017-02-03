var bundleCollapser = require('bundle-collapser/plugin');

module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    'browserify': {
      socket: {
        src: [],
        dest: 'public/build/socket.js',
        options: {
          alias: {
            socket: './node_modules/socket.io-client'
          }
        }
      },
      xhr: {
        src: [],
        dest: 'public/build/xhr.js',
        options: {
          alias: {
            xhr: './node_modules/xhr'
          }
        }
      },
      pixi: {
        src: [],
        dest: 'public/build/pixi.js',
        options: {
          alias: {
            pixi: './src/client/pixi.js'
          },
          transform: [['babelify', {presets: [['es2015', {'loose': true}]], plugins: ['version-inline', 'static-fs']}], 'glslify', 'browserify-versionify']
        }
      },
      engine: {
        src: [],
        dest: 'public/build/engine.js',
        options: {
          external: ['pixi', 'socket'],
          alias: {
            engine: './src/client/engine/index.js'
          },
          transform: ['glslify']
        }
      },
      solar: {
        src: ['src/client/index.js'],
        dest: 'public/build/solar.js',
        options: {
          external: ['pixi', 'engine', 'xhr'],
          transform: ['glslify', 'browserify-versionify']
        }
      },
      website: {
        src: ['src/website/index.js'],
        dest: 'public/build/website.js',
        options: {
          alias: {
            jquery: './src/libs/jquery/dist/jquery',
            fullpage: './src/libs/fullpage.js/jquery.fullPage',
            slick: './src/libs/slick-carousel/slick/slick',
            magnific: './src/libs/magnific-popup/dist/jquery.magnific-popup'
          }
        }
      },
      production: {
        src: ['src/client/index.js'],
        dest: 'public/build/app.js',
        options: {
          alias: {
            xhr: './node_modules/xhr',
            socket: './node_modules/socket.io-client'
          },
          require: [
            ['./src/client/engine/index.js', { expose: 'engine', plugin: [bundleCollapser] }],
            ['./src/client/pixi.js', { expose: 'pixi', plugin: [bundleCollapser] }]
          ],
          transform: [['babelify', {presets: [['es2015', {'loose': true}]]}], 'glslify', 'browserify-versionify'],
          plugin: [bundleCollapser, 'version-inline']
        }
      }
    },

    'concat': {
      dev: {
        dest: 'public/build/app.js',
        src: [
          'public/build/socket.js',
          'public/build/xhr.js',
          'public/build/pixi.js',
          'public/build/engine.js',
          'public/build/solar.js'
        ]
      }
    },

    'uglify': {
      options: {
        mangle: {},
        compress: {
          sequences: true,
          properties: true,
          dead_code: true,
          drop_debugger: true,
          drop_console: true,
          unsafe: true,
          conditionals : true,
          comparisons: true,
          evaluate: true,
          booleans: true,
          loops: true,
          unused: true,
          hoist_funs: true,
          hoist_vars: true,
          if_return: true,
          join_vars: true,
          cascade: true,
          side_effects: true,
          warnings: true
        }
      },
      app: {
        // options: {
        //   sourceMap: true,
        //   sourceMapName: 'public/build/app.min.map'
        // },
        files: {
          'public/build/website.min.js': [
            'public/build/website.js'
          ],
          'public/build/app.min.js': [
            'public/build/app.js'
          ]
        }
      }
    },

    'cssmin': {
      options: {
        shorthandCompacting: false,
        roundingPrecision: -1
      },
      target: {
        files: {
          'public/build/base.min.css': ['public/css/base.css'],
          'public/build/home.min.css': ['public/css/home.css']
        }
      }
    },

    'watch': {
      dev: {
        files: ['src/**/*', 'views/**/*', 'public/build/solar.js', 'public/build/engine.js'],
        tasks: ['build:solar', 'develop:dev'],
        options: {
          nospawn: true
        }
      }
    },

    'develop': {
      dev: {
        file: 'app.js',
        env: { NODE_ENV: 'development', port: 4567 },
        args: ['--no-daemon', '--no-silent'],
        nodeArgs: ['--debug']
      }//,
      // debug: {
      //   file: 'app.js',
      //   nodeArgs: ['--debug']
      // }
    },

    'compress': {
      app: {
        options: {
          mode: 'gzip'
        },
        files: [{
          expand: true,
          src: ['public/build/app.min.js'],
          dest: './',
          ext: '.min.gz.js'
        },{
          expand: true,
          src: ['public/build/website.min.js'],
          dest: './',
          ext: '.min.gz.js'
        }]
      }
    },
    
    'node-inspector': {
      dev: {
        options: {
          'web-port': 1337,
          'web-host': 'localhost',
          'debug-port': 5858,
          'save-live-edit': true,
          'no-preload': true,
          'stack-trace-limit': 4,
          'hidden': ['node_modules']
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-develop');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-node-inspector');

  grunt.registerTask('default', [
    'browserify:socket',
    'browserify:xhr',
    'browserify:pixi',
    'browserify:engine',
    'browserify:solar',
    'browserify:website',
    'develop:dev',
    'watch:dev'
  ]);

  grunt.registerTask('build:core', [
    'browserify:socket',
    'browserify:xhr',
    'browserify:pixi'
  ]);

  grunt.registerTask('build:solar', [
    'browserify:engine',
    'browserify:solar',
    'browserify:website'
  ]);

  grunt.registerTask('build', [
    'browserify:website',
    'browserify:production',
    'cssmin',
    'uglify:app',
    'compress:app'
  ]);
};
