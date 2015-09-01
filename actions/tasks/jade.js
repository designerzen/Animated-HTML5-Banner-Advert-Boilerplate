var gulp = require('gulp');

gulp.task('jade', function () {

	var config      	= require('../config');
	var options 		= require('../utils/options.js');
	var sanitise    	= require('../utils/sanitisation.js');
	
	var jade 			= require('gulp-jade');
	var data 			= require('gulp-data');
	var sourcemaps 		= require('gulp-sourcemaps');
	var tap 			= require('gulp-tap');
	var rename 			= require('gulp-rename');
	var path 			= require('path');
	var fs   			= require('fs');
	var gulpif 			= require('gulp-if');				// conditional compiles
	
	var setup 			= config.build;
	
	var source 			= config.source;
	var destination 	= config.destinations[ setup.destination ];
	var names 			= config.names;
	var structure		= config.structure;
	var sourceFolders 	= config.sourceFolders;
	var fileTypes		= config.fileTypes;
	
	var variants		= options.variants;
	
	return 	gulp.src( source.jade )
			.pipe(tap(function (file,t) {
				
				// extrapolate the file name from the glob
				// this replace simply removes the file extension
				var filePath 	= path.basename(file.path);
				var fileData 	= sanitise.determineDataFromFilename( filePath, options, names.seperator );
				
				// ( brand, type, variant, language, prefix, suffix, seperator )
				var folderName = sanitise.getFolder( options.brand, fileData.type, fileData.variant, fileData.language, options.version, '', names.seperator );
				var folderLocation = destination.root + '/'+ folderName;
				var destinationJade = folderLocation + structure.html;
				
				
				//console.log( options.brand, fileData.type, fileData.variant, fileData.language, options.version, '', names.seperator );
				console.log( fileData );
				console.log( folderName );
				
				// now we have determined the file name, we can do something
				// special with the destinations...
				// fetch the source file name and determine what their path should be called
				// based on the original name
				return 	gulp.src(file.path)
				
							// feed in the options JSON data file
							.pipe( data(options) )
							
							// save with source maps if debug mode
							.pipe( gulpif( !setup.sourceMaps, sourcemaps.init() ) )
							
							// compile jade to html
							.pipe(
								// Jade API Options
								// http://jade-lang.com/api/
								jade({
									// neatly formatted code
									pretty:!options.compress.html, 
									// debugging!
									debug:false, 
									compileDebug:false,
									// client: true, 
									// rename to index.html or whatever name you specified in the config
									// name: names.index
								})
							)
							// catch errors and prevent Jade from tripping up Watch
							.on('error', function(err) {
								console.error( 'Error with Jade.js', err.message);
							})
							// do we want to save out the source maps
							.pipe( gulpif( !setup.sourceMaps, sourcemaps.write() ) )
							
							// rename to index.html or whatever name you specified in the config
							.pipe( rename( names.index ) )
		
							// pipe out to a specific destination based on the path above
							.pipe(gulp.dest( destinationJade ))
			}));
});
