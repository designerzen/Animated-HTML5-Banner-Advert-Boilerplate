var gulp        = require('gulp');

gulp.task('browserSync', function() {
	
	var config      = require('../config');
	var browserSync = require('browser-sync');
	browserSync(config.browserSync);
	
});
