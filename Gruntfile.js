
module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    browserify: {
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
      socket: {
        src: [],
        dest: 'public/build/socket.js',
        options: {
          alias: {
            socket: './node_modules/socket.io/lib/client.js'
          }
        }
      },
      engine: {
        src: [],
        dest: 'public/build/engine.js',
        options: {
          external: ['pixi'],
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
          external: ['pixi', 'engine'],
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
            socket: './node_modules/socket.io/lib/client.js',
            engine: './public/js/engine/index.js'
          },
          transform: ['brfs'],
          plugin: [require('bundle-collapser/plugin')]
        }
      }
    },

    concat: {
      dev: {
        dest: 'public/build/app.js',
        src: [
          'public/build/pixi.js',
          'public/build/socket.js',
          'public/build/engine.js',
          'public/build/solar.js'
        ]
      }
    },

    uglify: {
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

    watch: {
      dev: {
        files: ['public/build/solar.js', 'public/build/engine.js'],
        tasks: ['concat:dev'],
        options: { nospawn: true }
      }
    },

    develop: {
      server: {
        file: 'app.js'
      }
    },

    compress: {
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
    }
  });

  grunt.loadNpmTasks('grunt-develop');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-compress');

  grunt.registerTask('default', [
    'browserify:pixi',
    'browserify:socket',
    'browserify:engine',
    'browserify:solar',
    'concat:dev',
    'develop', 'watch:dev'
  ]);

  grunt.registerTask('build', [
    'browserify:production',
    'uglify:app',
    'compress:app'
  ]);
};
