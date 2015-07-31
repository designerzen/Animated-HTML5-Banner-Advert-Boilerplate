var gulp       = require('gulp');

gulp.task('images', function() {
	
	var imagemin   	= require('gulp-imagemin');
	var config     	= require('../config');
	
	var setup 		= config.build;
	var browserSync = require('browser-sync');
	var newer 		= require('gulp-newer');
	var source 		= config.source;
	var destination = config.destinations[ setup.destination ];
	
	return gulp.src( source.images )
			.pipe( newer(destination.images) ) // Ignore unchanged files
			.pipe( imagemin() ) // Optimize
			.pipe( gulp.dest(destination.images) )
			.pipe( browserSync.reload({stream:true}) );
});
