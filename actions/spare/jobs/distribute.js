var gulp = require('gulp');
var runSequence = require('run-sequence');

gulp.task('distribute',function(callback) {

	var config 	= require('../config');
	var options = config.build;

	options.destination 	= 'distribution';
	options.sourceMaps 		= false;
	options.compress 		= true;

	console.log( "Building to " + options.destination );

	runSequence( 'clean',
					[ 'jade', 'less', 'images', 'fonts','icons','scripts' ],
					'haxe',
					// 'upload'
					callback);
});
