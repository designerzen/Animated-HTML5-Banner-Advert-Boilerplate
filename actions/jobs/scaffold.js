var gulp = require('gulp');

gulp.task( 'scaffold', function(callback) {
	
	var runSequence = require('run-sequence');
	
	runSequence([ 'manifest', 'templates' ], callback);
});
