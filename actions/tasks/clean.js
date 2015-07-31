var gulp = require('gulp');
	
gulp.task('clean', function (cb) {
	
	var del      	= require('del');
	var config     	= require('../config');
	var setup 		= config.build;
	//var destination = config.destinations;
	var folders 	= [ 
						setup.destination 
					];
	
	del( folders, cb);
	//.on('error', function() { console.error('Could not delete the folder :('); });

});
