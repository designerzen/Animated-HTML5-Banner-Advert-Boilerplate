/*

This is a JOB that creates a sub folder containing all of the 
compiled source code

*/

var gulp = require('gulp');

gulp.task( 'build', function(callback) {

	var tasks = ['images','less','jade','icons','fonts','scripts','manifests'];
	
	var runSequence = require('run-sequence');
	var config 		= require('../config');
	var setup 		= config.build;
	var destination = config.destinations[ setup.destination ];
	
	setup.sourceMaps 	= false;
	//setup.compress 		= false;
	
	console.log( "TASK > Build : to " , destination.root );

	runSequence( 'clean', tasks, callback );
});
