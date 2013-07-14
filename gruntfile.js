var LIVERELOAD_PORT = 35729;
var lrSnippet = require('connect-livereload')({
	port: LIVERELOAD_PORT
});

var mountFolder = function(connect, dir) {
	var res = require('path').resolve(dir);
	return connect.static(require('path').resolve(dir));
};
module.exports = function(grunt) {

	// Configuration goes here 
	grunt.initConfig({
		watch: {
			livereload: {
				files: 'app/**/*',
				options: {
					livereload: LIVERELOAD_PORT,
				},
			}
		},
		connect: {
			livereload: {
				options: {
					middleware: function(connect) {
						return [
							lrSnippet,
							mountFolder(connect, 'app')
						];
					}
				},
			},
		},
		open: {
			dev: {
				path: 'http://localhost:8000/'
			},
		},
		concat: {
			options: {
				separator: '\n',
			},
			dist: {
				src: [
					'app/js/cssFly.js',
					'app/js/base64.js',
					'app/js/cssParse.js',
					'app/js/underscore-min.js',
					'app/js/miniColors/minicolors.js'
				],
				dest: 'dist/cssFly.js',
			},
		},
		uglify: {
			build: {
				files: {
					'dist/cssFly.js': ['dist/cssFly.js']
				}
			}
		},
		copy: {
			main: {
				files: [{
					src: 'app/js/miniColors/minicolors.css',
					dest: 'dist/cssFly.css',
				}, {
					src: 'app/js/miniColors/jquery.minicolors.png',
					dest: 'dist/jquery.minicolors.png',
				}, ]
			}
		}
	});
	// Load plugins here
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-open');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-copy');

	// Define your tasks here
	grunt.registerTask('default', ['connect', 'open', 'watch']);
	grunt.registerTask('build', ['concat', 'copy', 'uglify']);


};