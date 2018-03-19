module.exports = function(grunt) {
  // Do grunt-related things in here

  grunt.initConfig({
    sass: {
      options: {
        sourceMap: true,
        outputStyle: "compressed"
      },
      dist: {
        files: [{
          expand: true,
          cwd: "src/",
          src: ['*.scss'],
          dest: "public/css",
          ext: ".css"
        }]
      }
    },
    watch: {
      css: {
        files: "src/*.scss",
        tasks: ['sass']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-sass');
  grunt.registerTask('default', ['sass']);
};
