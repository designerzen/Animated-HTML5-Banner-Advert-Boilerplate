var gulp       = require('gulp');

gulp.task('scripts', function() {
	
	var config     	= require('../config');
	var newer    	= require('gulp-newer');
	var uglify     	= require('gulp-uglify');
	var gulpif 		= require('gulp-if');
	var concat 		= require('gulp-concat');
	var names 		= config.names;
	
	var setup 		= config.build;
	var source 		= config.source;
	var destination = config.destinations[ setup.destination ];
	
	return gulp.src( source.scripts )
			// Ignore unchanged files
			.pipe(newer( destination.scripts + '/' + names.scripts))
			
			//.pipe( changed(destination.scripts) ) 
			// Combine all files into one file
			// optimise and squeeze Form filezize
			.pipe( concat( names.scripts ) )    
			.pipe( gulpif( setup.compress, uglify() ) )    
			// save out
			.pipe( gulp.dest(destination.scripts) );
});
