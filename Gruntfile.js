
module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    'browserify': {
      socket: {
        src: [],
        dest: 'public/build/socket.js',
        options: {
          alias: {
            socket: './node_modules/socket.io/node_modules/socket.io-client'
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
            pixi: './public/js/pixi.js'
          },
          transform: ['brfs']
        }
      },
      engine: {
        src: [],
        dest: 'public/build/engine.js',
        options: {
          external: ['pixi', 'socket'],
          watch: true,
          alias: {
            engine: './public/js/engine/index.js'
          },
          transform: ['brfs']
        }
      },
      solar: {
        src: ['public/js/index.js'],
        dest: 'public/build/solar.js',
        options: {
          external: ['pixi', 'engine', 'xhr'],
          watch: true,
          transform: ['brfs']
        }
      },
      production: {
        src: ['public/js/index.js'],
        dest: 'public/build/app.js',
        options: {
          alias: {
            pixi: './public/js/pixi.js',
            xhr: './node_modules/xhr',
            socket: './node_modules/socket.io/node_modules/socket.io-client',
            engine: './public/js/engine/index.js'
          },
          transform: ['brfs'],
          plugin: [require('bundle-collapser/plugin')]
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
        mangle: {
          screw_ie8: true
        },
        compress: {
          sequences: true,
          properties: true,
          dead_code: true,
          drop_debugger: true,
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
          'public/build/app.min.js': [
            'public/build/app.js'
          ]
        }
      }
    },

    'watch': {
      dev: {
        files: ['src/**/*', 'views/**/*', 'public/build/solar.js', 'public/build/engine.js'],
        tasks: ['concat:dev', 'develop:dev'],
        options: { nospawn: true }
      }
    },

    'develop': {
      dev: {
        file: 'app.js',
        env: { NODE_ENV: 'development', port: 4567 },
        args: ['--no-daemon', '--no-silent'],
        nodeArgs: []
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
    'concat:dev',
    'develop:dev',
    'watch:dev'
  ]);

  // grunt.registerTask('debug', [
  //   'browserify:socket',
  //   'browserify:pixi',
  //   'browserify:engine',
  //   'browserify:solar',
  //   'concat:dev',
  //   'develop:debug',
  //   'node-inspector:dev'
  // ]);

  grunt.registerTask('build', [
    'browserify:socket',
    'browserify:xhr',
    'browserify:pixi',
    'browserify:engine',
    'browserify:solar',
    'browserify:production',
    'concat:dev',
    'uglify:app',
    'compress:app'
  ]);
};
