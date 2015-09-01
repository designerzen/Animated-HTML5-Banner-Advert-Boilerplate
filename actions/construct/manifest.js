/* 

Create Manifest files for each SIZE, each TYPE and each VARIANT

*/

var gulp = require('gulp');

gulp.task('manifest', function() {
	
	// Load our configs
	var config  	= require('../config');
	var options 	= require('../utils/options.js');
	var sanitise    = require('../utils/sanitisation.js');
	
	// Tools
	var path 		= require('path');
	var fs   		= require('fs');			// access file system
	var replace 	= require('gulp-replace');	// replace content within files
	var rename 		= require('gulp-rename');	// rename files
	var merge 		= require('merge-stream');	// combine multiple streams!

	// Folders & Files
	var setup 		= config.build;
	var source 		= config.source;
	var template 	= source.manifests + 'templates/template.js';
	var destination = source.manifests;
	var types 		= options.types;
	var sizes 		= options.sizes;
	var names 		= config.names;
	
	// Requested variations in these languages...
	// NB. If this is empty, we do not create those templates
	var languages 	= options.languages.length ? options.languages : [''];
	var language 	= '';
	
	// Requested variations in these campaigns...
	var variants	= options.variants.length ? options.variants : [''];
	var variant		= variants[0];
	
	// combine streams
	var merged 		= merge();
	
	// Loop through variants
	for ( var v=0, a=variants.length; v < a; v++)
	{
		variant = variants[v];
		console.log( 'MANIFEST > Creating Manifests for Variant '+(v+1)+' / '+a+' : '+variant.toUpperCase() );
		console.log( '======================================================' );
		
		// Loop through languages
		for ( var l=0, q=languages.length; l < q; l++)
		{
			// fetch language file
			language = languages[l];
			console.log( 'MANIFEST > '+(l+1)+' Creating Manifests for Language : '+language.toUpperCase() );
			
			for (var t = 0, e=types.length; t < e; t++)
			{
				var type = types[t];
				var size = sizes[ type ];
				
				// Start with type : eg. MPU
				var file = sanitise.getTemplate( type, variant, language,'.manifest.js', names.seperator );

				var manifest = gulp.src( template )
					.pipe( replace(/#{title}/gi, options.brand) )
					.pipe( replace(/#{version}/gi, options.version) )
					.pipe( replace(/#{variant}/gi, type) )
					.pipe( replace(/#{type}/gi, type.toLowerCase() ) )
					.pipe( replace(/#{width}/gi, size.w) )
					.pipe( replace(/#{height}/gi, size.h) )
					.pipe( rename( file ) )
					.pipe( gulp.dest( destination ) );	// <- save back into source!

				console.log('MANIFEST > '+(t+1)+' Created as '+destination+file );
				merged.add( manifest );
			}
			
			console.log('');
		}
		
	}
	return merged;
});