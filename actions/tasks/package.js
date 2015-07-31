var gulp = require('gulp');

gulp.task('package', function(cb) {
	
	// Leaderboard configuration and options file
	var config     		= require('../config.js');
	var options 		= require('../utils/options.js');
	var sanitise    	= require('../utils/sanitisation.js');
	
	// Fetch options and config
	var setup 			= config.build;
	var source 			= config.source;
	var destination 	= config.destinations[ setup.destination ];
	
	
	// Requested types (sizes)
	var types 			= options.types;
	
	// Requested variations in the languages.
	// NB. If this is empty, we do not create those templates
	var languages 	= options.languages.length ? options.languages : [''];
	// default language if there is not one specified in the options
	var language 		= '';
	
	// sizes for the adverts
	var sizes 			= options.sizes;
	var names 			= config.names;
	
	// Requested variations in these campaigns...
	var variants		= options.variants;
	var variant			= '';
	var structure		= config.structure;
	var sourceFolders 	= config.sourceFolders;
	var fileTypes		= config.fileTypes;
	
	
	// This takes each source file and creates the neccessary outut folder
	// And copies the code from build folder... therefore this tasks depends
	// upon the output of other tasks and thus should be run as part of a job
	// var path 			= require('path');
	var fs 				= require('fs');
	var newer 			= require('gulp-newer');
	var changed    		= require('gulp-changed');
	var imagemin   		= require('gulp-imagemin');
	var uglify     		= require('gulp-uglify');
	var less 			= require('gulp-less');
	var gulpif 			= require('gulp-if');				// conditional compiles
	var csscomb 		= require('gulp-csscomb');
	var data 			= require('gulp-data');
	var jade 			= require('gulp-jade');
	var concat 			= require('gulp-concat');
	var rename 			= require('gulp-rename');			// rename files
	var merge 			= require('merge-stream');			// combine multiple streams!
	var browserSync 	= require('browser-sync');
	
	
	// LESS plugins
	var LessPluginCleanCSS 			= require("less-plugin-clean-css"),
		cleancss 					= new LessPluginCleanCSS({advanced: true});
	var LessPluginAutoPrefix 		= require('less-plugin-autoprefix'),
		autoprefix 					= new LessPluginAutoPrefix({browsers: ["last 2 versions"]});
	var plugins 					= [ autoprefix, cleancss ] ;


	// a way of doing multiple gulp streams simultaneously
	var merged 	= merge();
	
	//console.log( config.destinations, setup.destination );
	console.log('PACKAGE > PACKAGING BUILD TO : '+destination.root );
	
	
	// We can override certain behaviours here
	setup.compress = true;
	
	
	// TODO : 
	// create Interim data to speed up compilation...
	for ( var i = 0, z=types.length; i < z; ++i)
	{
		var type = types[t];
		
		// css
		
		// Images
		
		// Icons
		
	}
	
	
	
	
	
	// Loop through variants
	for ( var v=0, a=variants.length; v < a; v++)
	{
		variant = variants[v];
		console.log( 'PACKAGE > Copying for Variant '+(v+1)+' / '+a+' '+variant.toUpperCase() );
		console.log('=======================================================');
		
		// Loop through languages
		for ( var l=0, q=languages.length; l < q; l++)
		{
			language = languages[l];
			console.log( 'PACKAGE > Packaging for Language : '+language.toUpperCase()+'......................' );
			
			// Loop through Types (MPU/Leaderboard/Skyscraper)
			for (var t = 0, e=types.length; t < e; t++)
			{
				// Here we go... now we have access to every single variant!
				var type = types[t];
				var size = sizes[ type ];
				
				// brand, type, variant, language, prefix, suffix, seperator
				var folderName = sanitise.getFolder( options.brand, type, variant, language, options.version, 'suffix', names.seperator );
				var folderLocation = destination.root + '/'+ folderName;

				console.log( 'PACKAGE > '+(t+1)+'/'+types.length+'. Packaging type : '+type   );
				
				
				// Compile JADE FRESHLY! ---------------------------------------------------------
				// Get JADE source file name
				var srcJade = sourceFolders.root + '/' + sourceFolders.html + '/' + sanitise.getTemplate( type, variant, language,'.jade', names.seperator );
				var destinationJade = folderLocation + structure.html;
				var taskJade = gulp.src( srcJade )
								.pipe( data(options) )
								.pipe( jade( { pretty:!setup.compress, debug:false, compileDebug:false } ) )
								.pipe( rename( names.index ) )
								// .pipe( replace(/<title>(.*)<\/title>/i, '<title>'+title+'</title>' ) )
								.pipe( gulp.dest( destinationJade ) );
								
				merged.add( taskJade );
				console.log( 'PACKAGE > Packaging JADE : '+srcJade+' -> '+destinationJade );
				
				
				// Styles ----------------------------------------------------------------
				// As these are shared we can create our style.css and simply copy it...
				// Or Simply copy from the root folder?
				// Get LESS source file name
				var srcLess = source.less;
				var destinationLess = folderLocation + '/' + structure.styles;
				var optionsLess = {
					compress:setup.compress,
					plugins:plugins
				};
				var taskLess = gulp.src( srcLess )
								.pipe( less( optionsLess ) )
								.pipe( gulp.dest( destinationLess ) );
								
				merged.add( taskLess );
				console.log( 'PACKAGE > Packaging LESS : '+srcLess+' -> '+destinationLess );
				
				
				// Scripts ---------------------------------------------------------------
				var srcScripts = source.scripts;
				var destinationScripts = folderLocation + '/' + structure.scripts;
				var taskScripts = gulp.src( srcScripts )
					// Combine all files into one file
					// optimise and squeeze Form filezize
					.pipe( concat( names.scripts ) )    
					.pipe( gulpif( setup.compress, uglify() ) )    
					// save out
					.pipe( gulp.dest( destinationScripts ) );
				
				merged.add( taskScripts );
				console.log( 'PACKAGE > Packaging JS : '+srcScripts+' -> '+destinationScripts );
				
				
				// Manifests -------------------------------------------------------------
				
				// Straight forward copy and rename...
				var srcManifests = sourceFolders.root + '/' + sourceFolders.manifests + '/';
				
				//var srcManifests = source.manifests;
				var srcTemplate = sanitise.getTemplate( type, variant, language,'.manifest.js', names.seperator );
				var srcManifest = srcManifests + srcTemplate;
				var destinationManifest = folderLocation + structure.html;
				var taskManifests = gulp.src( srcManifest )
					// optimise and squeeze Form filezize
					.pipe( gulpif( setup.compress, uglify() ) )  
					// let us take out the comments...
					.pipe( rename( names.manifest ) )
					// save out
					.pipe( gulp.dest( destinationManifest ) );
					
					
				merged.add( taskManifests );
				console.log( 'PACKAGE > Packaging Manifests : '+srcManifest+' -> '+destinationManifest );
				
				
				// Images ----------------------------------------------------------------
				
				var srcImages = sourceFolders.root + '/' + sourceFolders.images;
				// create a GLOB that handles types that are NOT named after the other types
				var imageGlob = [ srcImages +'/**/*.'+fileTypes.images+')' ];
				
				// This creates a GLOB that removes *ANY* image file that has the type in the title
				// Loop through types and create a glob that finds *all* files that do NOT have a type in their title
				// AS WELL as *all* files that have this SPECIFIC type of 
				for (var g = 0, k=types.length; g < k; g++)
				{
					// we only want to copy files that *HAVE* either a unique file name with no type specified
					// or an image that has the specific type specified...
					if ( type === types[g] )
					{
						// Yes we want!
						// imageGlob.push( distribution.images +'/**/*'+ type +'*' );
					}else{
						// No we *dont* want
						imageGlob.push( '!'+ srcImages +'/**/*'+ (types[g]) +'*.('+fileTypes.images+')' );
						imageGlob.push( '!'+ srcImages +'/**/*'+ (types[g]).toLowerCase() +'*.('+fileTypes.images+')' );
					}
				}
			
				var destinationImages = folderLocation + '/' + structure.images;
				// source.images
				var taskImages = gulp.src( imageGlob )
					// only minify if need be...
					.pipe( imagemin() ) // Optimize
					.pipe( gulp.dest( destinationImages ) );
				
				merged.add( taskImages );
				console.log( 'PACKAGE > Packaging Images : '+imageGlob+' -> '+destinationImages );
				
				
				// Icons -----------------------------------------------------------------
				var destinationIcons = folderLocation + '/' + structure.icons;
				var taskIcons = gulp.src( source.icons )
					.pipe( imagemin() ) // Optimize
					.pipe( gulp.dest( destinationIcons ) );
					
				merged.add( taskIcons );
				console.log( 'PACKAGE > Packaging Icons : '+source.icons+' -> '+destinationIcons );
				
				
				// Fonts -----------------------------------------------------------------
				var destinationFonts = folderLocation + '/' + structure.fonts;
				var taskFonts = gulp.src( source.fonts )
					.pipe( gulp.dest( destinationFonts ) );
				
				merged.add( taskFonts );
				console.log( 'PACKAGE > Packaging Fonts : '+source.fonts+' -> '+destinationFonts );
				
				
				console.log('');
			}
			//
		}
		// 
	}
	
	// Handle each task individually...
	return merged;
});
