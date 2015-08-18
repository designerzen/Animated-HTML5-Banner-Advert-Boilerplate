/*

This is a JOB that creates a sub folder containing all of the 
compiled source code

*/

var gulp = require('gulp');

gulp.task( 'build', function(callback) {

	var runSequence = require('run-sequence');
	var tasks = ['images','less','jade','icons','fonts','scripts','manifests'];
	
	console.log( "TASK > Build : to " , destination.root );

	runSequence( tasks, callback );
});
