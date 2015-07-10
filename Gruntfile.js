'use strict';

module.exports = function(grunt) {
  // Load Grunt tasks declared in the package.json file
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
  grunt.loadNpmTasks('atg-js-styleguide');
  // ============================================================================

  grunt.initConfig({

    // Lint.
    jshint: {
      options: {
        asi: true,
        node: true,
        validthis: true,
        loopfunc: true,
        laxcomma: true
      },
      files: {
        src: ['index.js', '<%= nodeunit.tests %>']
      }
    },
    eslint: {
      options: {
        configFile: 'node_modules/atg-js-styleguide/.eslintrc'
      },
      target: ['Gruntfile.js', 'index.js', 'src/**/*.js', 'test/**/*.js']
    },

    // Before generating any new files, remove previously-created files.
    clean: {
      coverage: ['coverage'],
      dist: ['coverage', 'node_modules']
    },

    // Unit tests.
    nodeunit: {
      tests: ['test/*_test.js']
    },

    // Automate version bumps
    //   grunt release:patch
    //   grunt release:minor
    //   grunt release:major
    release: {
      options: {
        add: false,
        npm: true,
        tagName: 'v<%= version %>',
        commitMessage: 'v<%= version %>',
        tagMessage: 'v<%= version %>'
      }
    }

  });

  // ============================================================================

  grunt.registerTask('test', [
    'clean:coverage',
    'jshint',
    'nodeunit'
  ]);

  grunt.registerTask('default', ['eslint', 'test']);
};
