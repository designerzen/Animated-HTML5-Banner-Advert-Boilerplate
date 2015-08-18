/* 

Copy the relevant manifest files for each SIZE, each TYPE and each VARIANT into 
the correct destination folder

*/

var gulp = require('gulp');

gulp.task('manifests', function() {
	
	var browserSync 	= require('browser-sync');
	var newer 			= require('gulp-newer');
	var changed    		= require('gulp-changed');
	var tap 			= require('gulp-tap');
	var rename 			= require('gulp-rename');
	var uglify     		= require('gulp-uglify');
	var gulpif 			= require('gulp-if');
	var concat 			= require('gulp-concat');
	var path 			= require('path');
	
	var config     		= require('../config');
	var options 		= require('../utils/options.js');
	var sanitise   	 	= require('../utils/sanitisation.js');
	
	var setup 			= config.build;
	var source 			= config.source;
	var destination 	= config.destinations[ setup.destination ];
	
	var names 			= config.names;
	var structure		= config.structure;
	var setup 			= config.build;
	var source 			= config.source;
	var destination 	= config.destinations[ setup.destination ];
	
	var languages 		= options.languages.length ? options.languages : [''];
	var types 			= options.types;
	var variants		= options.variants;
	
	var destinationsManifests = sanitise.getDestinations( options.brand, types, variants, languages, options.version, '', names.seperator, structure.html, destination.root );	//folderLocation + '/' + structure.styles;

	
	return 	gulp.src( source.manifests+'*.js' )
			.pipe(tap(function (file,t) {
			
				// extrapolate the file name from the glob
				var filename 		= path.basename(file.path);
				var parts 			= filename.split('-');
				
				var type 			= parts[ 0 ];
				var variant 		= options.variants ? options.variants[0] : '';
				var language 		= '';
				
				// ( brand, type, variant, language, prefix, suffix, seperator )
				var folderName = sanitise.getFolder( options.brand, type, variant, language, options.version, '', names.seperator );
				var folderLocation = destination.root + '/'+ folderName;
				var destinationManifests = folderLocation + structure.html;
					
				//console.log( path );
				//console.log( parts );
				console.log( source.manifests );
				console.log( filename );
				//console.log( folderName );
				//console.log( folderLocation );
				//console.log( destinationManifests );
				
				return 	gulp.src(file.path)
					//.pipe( newer(destination.icons) ) // Ignore unchanged files
					//.pipe( changed(destination.icons) ) // Ignore unchanged files
					.pipe( gulpif( setup.compress, uglify() ) )
					
					
					// rename to manifest.js or whatever name you specified in the config
					.pipe( rename( names.manifest ) )
					
					// pipe to newer home
					.pipe( gulp.dest(destinationManifests) )
							
					// force browser refresh!
					.pipe( browserSync.reload({stream:true}) );
			}));				
});