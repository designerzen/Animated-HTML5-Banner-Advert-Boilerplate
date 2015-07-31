var gulp = require('gulp');

gulp.task('jade', function () {

	var config      = require('../config');
	var options 	= require('../utils/options.js');
	
	var jade 		= require('gulp-jade');
	var data 		= require('gulp-data');
	var sourcemaps 	= require('gulp-sourcemaps');
	var path 		= require('path');
	var fs   		= require('fs');
	var gulpif 		= require('gulp-if');				// conditional compiles

	var setup 		= config.build;
	var source 		= config.source;
	var destination = config.destinations[ setup.destination ];

	return gulp.src( source.jade )

			// load our data file set in config
			.pipe(data(options))
			
			// save with source maps if debug mode
			.pipe( gulpif( !setup.sourceMaps, sourcemaps.init() ) )
			
			// neatly formatted code
			.pipe( jade( { pretty:!setup.compress, debug:false, compileDebug:false } ) )

			.on('error', function(err) {
                console.error( 'Error with Jade.js', err.message);
            })

			.pipe( gulpif( !setup.sourceMaps, sourcemaps.write() ) )
			.pipe( gulp.dest( destination.html ) );
});
