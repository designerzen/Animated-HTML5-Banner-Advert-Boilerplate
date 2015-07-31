var gulp        = require('gulp');

gulp.task('browserRefresh', function() {
	
	var config      = require('../config');
	var browserSync = require('browser-sync');
	
	browserSync.reload({stream:true});
});
