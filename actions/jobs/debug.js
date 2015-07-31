/*

This is a JOB that allows you to work on the campaign during development

*/

var gulp = require('gulp');

gulp.task( 'debug', function(callback) {

	var runSequence = require('run-sequence');
	
	var config 		= require('../config');
	var setup 		= config.build;
	
	setup.sourceMaps 	= true;
	setup.compress 		= false;
	//setup.destination = 'dist';

	//console.log( "Building test to " , setup.destination );
	console.log( "Building test to" );
	console.log( setup.destination );
	
	var destination = config.destinations[ setup.destination ];
	
	console.log( config.destinations );
	console.log( destination );
	
	runSequence( 
					[ 'jade', 'less', 'images', 'fonts','icons','scripts' ],
					'watch',
					callback);
});
