module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		uglify: {
			build: {
				src: 'dist/built.js',
				dest: 'build/<%= pkg.name %>.min.js'
			}
		},
		concat: {
			options: {
				separator: '/* \n\n\n*/ \n',
			},
			dist: {
				src: ['js/libs/jquery.js','js/libs/underscore.js','js/libs/backbone.js','js/libs/jquery.dataTables.min.js','js/mobile/*.js','js/desktop/*.js'],
				dest: 'dist/built.js',
			},
		},
		jshint: {
			all: ['js/*.js']
		},
		watch: {
			scripts: {
				files: ['index.html','js/**/*.js'],
				tasks: ['default'],
				options: {
					interrupt: true,
					spawn: false
				},
			},
		},
	});

	// Load the plugin that provides the "uglify" task.
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-watch');
	// Default task(s).
	grunt.registerTask('default', ['concat','uglify']);

};