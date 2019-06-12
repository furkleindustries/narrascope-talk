const loadGruntTasks = require('load-grunt-tasks');
const sass = require('node-sass');

module.exports = (grunt) => {
	loadGruntTasks(grunt);

	const port = grunt.option('port') || 8000;
	let root = grunt.option('root') || '.';

	if (!Array.isArray(root)) {
    root = [ root ];
  }

	// Project configuration
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
    qunit: {
			files: [ 'test/*.html' ],
		},

		uglify: {
			options: {
				ie8: true,
			},
			build: {
				src: 'js/reveal.js',
				dest: 'js/reveal.min.js',
			},
		},

		/**
		 * Sass is a language which builds on top of CSS in a similar way that Twine
		 * does for HTML, allowing variables, functions, inclusion, etc.
		 */
		sass: {
			core: {
				src: 'css/reveal.scss',
				dest: 'css/reveal.css',
			},

			options: {
				implementation: sass,
				sourceMap: false,
			},

			themes: {
				expand: true,
				cwd: 'css/theme/source',
				src: [
					'*.sass',
					'*.scss',
				],

				dest: 'css/theme',
				ext: '.css',
			},
		},

		autoprefixer: {
			core: { src: 'css/reveal.css' },
		},

		cssmin: {
			options: {
				compatibility: 'ie9'
			},
			compress: {
				src: 'css/reveal.css',
				dest: 'css/reveal.min.css'
			}
		},

		jshint: {
			options: {
				curly: false,
				eqeqeq: true,
				immed: true,
				esnext: true,
				latedef: 'nofunc',
				newcap: true,
				noarg: true,
				sub: true,
				undef: true,
				eqnull: true,
				browser: true,
				expr: true,
				loopfunc: true,
				globals: {
					head: false,
					module: false,
					console: false,
					unescape: false,
					define: false,
					exports: false,
					require: false
				},
			},
			files: [ 'gruntfile.js', 'js/reveal.js' ]
		},

		connect: {
			server: {
				options: {
					port: port,
					base: root,
					livereload: true,
					open: true,
					useAvailablePort: true
				},
			},
		},

		zip: {
			bundle: {
				src: [
					'index.html',
					'css/**',
					'js/**',
					'lib/**',
					'images/**',
					'plugin/**',
					'**.md',
				],
				dest: 'reveal-js-presentation.zip',
			}
		},

		watch: {
			js: {
				files: [ 'gruntfile.js', 'js/reveal.js' ],
				tasks: 'js',
			},

			css: {
				files: [ 'css/reveal.scss' ],
				tasks: 'css-core',
			},

			theme: {
				files: [
					'css/theme/source/*.sass',
					'css/theme/source/*.scss',
				  'css/theme/template/*.sass',
					'css/theme/template/*.scss'
				],

				tasks: 'css-themes'
			},

			html: { files: root.map((path) => path + '/*.html') },
			markdown: { files: root.map((path) => path + '/*.md') },
			options: { livereload: true },
		},

		test: {
			files: [ 'test/*.html' ],
			tasks: 'test'
		},
	});

	// Default task
	grunt.registerTask('default', [ 'css', 'js' ]);

	// JS task
	grunt.registerTask('js', [ 'jshint', 'uglify', ]);

	// Theme CSS
	grunt.registerTask('css-themes', [ 'sass:themes' ]);

	// Core framework CSS
	grunt.registerTask('css-core', [ 'sass:core', 'autoprefixer', 'cssmin', ]);

	// All CSS
	grunt.registerTask('css', [ 'sass', 'autoprefixer', 'cssmin', ]);

	// Package presentation to archive
	grunt.registerTask('package', [ 'default', 'zip' ]);

	// Serve presentation locally
	grunt.registerTask('serve', [ 'connect', 'watch' ]);

	// Run tests
	grunt.registerTask('test', [ 'jshint', /*'qunit'*/ ]);
};
