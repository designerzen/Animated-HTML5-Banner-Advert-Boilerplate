/* 

Create Manifest files for each SIZE, each TYPE and each VARIANT

*/

var gulp = require('gulp');

gulp.task('manifest', function() {
	
	var TEMPLATES   = 'templates/';
	var TEMPLATE   	= 'template.js';
	
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
	var template 	= source.manifests + TEMPLATES + TEMPLATE;
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
	
	///////////////////////////////////////////////////////////////////////////////////
	// Task here returned...
	///////////////////////////////////////////////////////////////////////////////////
	var createManifest = function( source, filename, type, size, variant, language )
	{
		var manifestTask = gulp.src( source )
			.pipe( replace(/#{title}/gi, options.brand) )
			.pipe( replace(/#{version}/gi, options.version) )
			.pipe( replace(/#{variant}/gi, variant ) )
			.pipe( replace(/#{type}/gi, type.toLowerCase() ) )
			.pipe( replace(/#{width}/gi, size.w) )
			.pipe( replace(/#{height}/gi, size.h) )
			.pipe( rename( filename ) )
			.pipe( gulp.dest( destination ) );	// <- save back into source!

		return manifestTask;
	};
	
	
	// 1. 
	// Firstly, let us check out templates folder to see if there are any templates in the 
	// Template folder and if so, try and determine what to do next...
	var customManifests 	= fs.readdirSync( source.manifests + TEMPLATES );
	var customFiles 		= [];
	
	// We may have custom manifest files in the template folder so let us filter them...
	if (customManifests)
	{
		customManifests
			// make sure we have all JS and we ignore the default template
			//.filter(function(file) { return file.substr(-5) === '.js' && file !== TEMPLATE; })
			.filter( function(file) { 
				var filtered = false;
				// Set up our cases to filter
				if (file.substr(-3).toLowerCase() !== '.js') filtered = true;
				// ignore our default template if more are listed
				if (file !== TEMPLATE) filtered = true;
				// return true or false, false if to be filtered
				//console.log("Filtering file ext " , file.substr(-3) );
				return filtered;
			})
			.forEach(function(file) {
				
				// determine type from filename...
				customFiles.push(file);
			});
	}
	
	// We ARE using a custom template
	if ( customFiles.length > 0 )
	{
		console.log(customFiles.length + ' Custom Template file(s) discovered ', customFiles );
	
		// Loop through our custom manifests
		customFiles.forEach( function(file){
			
			// loop through the types internally
			for (var t = 0, e=types.length; t < e; t++)
			{
				var type = types[ t ];
				var size = sizes[ type ];
				
				// now we can overwrite the variants by determining the filenames...
				var variantTest = sanitise.determineVariant( file, options.variants );
				variant = variantTest[0];
				
				// ( type, variant, language, suffix, seperator )
				var manifestFilename = sanitise.getTemplate( type, variant, language,'.manifest.js', names.seperator );
				// ( source, filename, type, size, variant )
				var manifest = createManifest( source.manifests + TEMPLATES + file, manifestFilename, type, size, variant, language );
				
				// add to merger
				merged.add( manifest );
				
				//console.log("Reading args ",template, type, variant, language,'.manifest.js', names.seperator);
				console.log( (t+1)+"/"+e+" Reading file ",file);
				console.log("Reading variant ", variant);
				console.log("Reading type ", type);
				//console.log("Reading size ",size);
				console.log("Writing to ", destination, manifestFilename );
				console.log('');
				
			}
			
		});
		//console.log(merged);
		
	}else{
	
		// Using a default template
		console.log('Using default Template file : ', template );
		
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
				console.log( 'MANIFEST > '+(l+1)+' / '+q+' Creating Manifests for Language : '+language.toUpperCase() );
				
				for (var t = 0, e=types.length; t < e; t++)
				{
					// fetch sequential options...
					var type = types[t];
					var size = sizes[ type ];
					
					// For default templates
					// ( type, variant, language, suffix, seperator )
					var file = sanitise.getTemplate( type, variant, language,'.manifest.js', names.seperator );
					// source, filename, type, size, variant, language 
					var manifest = createManifest( template, file, type, size, variant, language );

					console.log('MANIFEST > '+(t+1)+' / '+ e +' Created as '+destination+file );
					merged.add( manifest );
				}
				
			}
			console.log('');
		}
	}

	// Now return this stream
	return merged;
	
});