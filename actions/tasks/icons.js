var gulp       = require('gulp');

gulp.task('icons', function() {
	
	var newer 		= require('gulp-newer');
	var changed    	= require('gulp-changed');
	var imagemin   	= require('gulp-imagemin');
	var config     	= require('../config');
	
	var setup 		= config.build;
	var browserSync = require('browser-sync');
	var source 		= config.source;
	var destination = config.destinations[ setup.destination ];
	
	return gulp.src( source.icons )
			.pipe( newer(destination.icons) ) // Ignore unchanged files
			.pipe( changed(destination.icons) ) // Ignore unchanged files
			.pipe( imagemin() ) // Optimize
			.pipe( gulp.dest(destination.icons) )
			.pipe( browserSync.reload({stream:true}) );
});
