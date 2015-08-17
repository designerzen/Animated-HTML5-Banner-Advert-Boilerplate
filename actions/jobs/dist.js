/*

This is a JOB that compiles and zips up a campaign into individual folders

*/

var gulp = require('gulp');

gulp.task( 'dist', function(callback) {

	var runSequence 	= require('run-sequence');
	var config 			= require('../config');
	
	// Fetch bits and pieces
	var setup 			= config.build;
	
	// overwrite settings here...
	setup.sourceMaps 	= true;
	setup.compress 		= false;
	//setup.destination 	= 'dist';
	
	var destination 	= config.destinations[ setup.destination ];
	
	console.log( "Building Distribution to " , destination.root );

	runSequence( 'clean',
					//[ 'jade', 'less', 'images', 'fonts','icons','scripts' ],
					//'zip',
					callback);
});
