var gulp     = require('gulp');

gulp.task('watch', ['browserSync'], function(callback) {
	
	var config   	= require('../config');
	var browserSync = require('browser-sync');
	var watch   	= config.watch;
	
	gulp.watch( watch.less,   	['less']);
	gulp.watch( watch.images, 	['images', browserSync.reload]);
	gulp.watch( watch.jade,   	['jade', browserSync.reload]);
	gulp.watch( watch.fonts, 	['fonts', browserSync.reload]);
	gulp.watch( watch.scripts, 	['scripts', browserSync.reload]);
	
});
