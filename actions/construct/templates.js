/* 

this task creates the jade files from each size and language

from the templates folder

in the format 

size.variation.language.jade

*/

var gulp = require('gulp');

gulp.task('templates', function () {

	// Project build config
	var config      = require('../config');
	
	// Campaign Options
	var options 	= require('../utils/options.js');
	var sanitise    = require('../utils/sanitisation.js');
	
	// Tools
	var path 		= require('path');
	var fs   		= require('fs');			// access file system
	var replace 	= require('gulp-replace');	// replace content within files
	var rename 		= require('gulp-rename');	// rename files
	var merge 		= require('merge-stream');	// combine multiple streams!

	// Folders & Files
	var variation 	= config.build;
	var source 		= config.source;
	var template 	= config.names.template;
	var destination = template.replace( '/templates/template.jade','');
	
	// Requested types (sizes)
	var types 		= options.types;
	
	// Requested variations in the languages.
	// NB. If this is empty, we do not create those templates
	var languages 	= options.languages.length ? options.languages : [''];
	// default language if there is not one specified in the options
	var language 	= languages[0];
	
	// sizes for the adverts
	var sizes 		= options.sizes;
	var names 		= config.names;
	
	// Requested variations in these campaigns...
	var variants	= options.variants.length ? options.variants : [''];
	var variant		= variants[0];
	
	// a way of doing multiple gulp streams simultaneously
	var merged 		= merge();
	
	// check to see if variants is empty and if so trip error
	if ( variants.length < 1 )
	{
		console.error("Campaign does not feature variance");
		return merged;
	}
	
	
	// Loop through variants
	for ( var v=0, a=variants.length; v < a; v++)
	{
		variant = variants[v];
		console.log( 'TEMPLATE > Creating JADE Template for Variant '+(v+1)+' / '+a+' : '+variant.toUpperCase() );
		console.log('=======================================================');
		
		// Loop through languages
		for ( var l=0, q=languages.length; l < q; l++)
		{
			language = languages[l];
			console.log( 'TEMPLATE > Creating JADE Template for Language : '+language.toUpperCase() );
			
			// Loop through Types (MPU/Leaderboard/Skyscraper)
			for (var t = 0, e=types.length; t < e; t++)
			{
				var type = types[t];
				var size = sizes[ type ];
				var file = sanitise.getTemplate( type, variant, language,'.jade', names.seperator );

				var variation = variant || 'unknown';
				
				//file = file.replace('template.jade', type+'.jade');
				var jade = gulp.src( template )
						.pipe( replace(/#{title}/gi, options.title) )
						.pipe( replace(/#{version}/, options.version) )
						.pipe( replace(/#{type}/gi, type ) )
						.pipe( replace(/#{typeLowercase}/gi, type.toLowerCase() ) )
						
						// we need to make sure that the variant is 
						.pipe( replace(/#{variant}/gi, variation ) )
						
						.pipe( replace(/#{width}/gi, size.w) )
						.pipe( replace(/#{height}/gi, size.h) )
						//.pipe( replace(/base.jade/, type+'.base.jade') )
						.pipe( rename( file ) )
						.pipe( gulp.dest( destination ) );
				
				console.log( 'TEMPLATE > '+(t+1)+' Created in '+destination+' : '+file+' from '+template );
				merged.add( jade );
			}
			console.log( '' );
			// End language loop
		}	
		
	}
	
	return merged;
});
