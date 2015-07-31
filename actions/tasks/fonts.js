var gulp       = require('gulp');

gulp.task('fonts', function() {
	var changed    	= require('gulp-changed');
	var newer 		= require('gulp-newer');
	var config     	= require('../config');
	
	var setup 		= config.build;
	var source 		= config.source;
	var destination = config.destinations[ setup.destination ];
	
	return gulp.src( source.fonts )
		.pipe( newer(destination.fonts) ) // Ignore unchanged files
		.pipe( changed(destination.fonts) ) // Ignore unchanged files
		.pipe( gulp.dest(destination.fonts) );
});
