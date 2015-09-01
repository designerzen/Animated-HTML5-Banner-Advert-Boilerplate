/* 

this task copies and compresses the images.

Rules :

	- Get file name of the src matched Image
	- Check to see if the Image hasAttribute a type specified...
	- If so copy it into the specific folder
	- If not, duplicate it into every img folder...

*/

var gulp = require('gulp');


// Take all and strip some out
// './src/images/**/*.+(png|jpg|jpeg|gif|webp|svg|cur)'
// '!./src/images/**/*+(_|.|-){mpu,banner,noneExpandableBanner,halfMobileBanner}+(_|.|-){location}*.+(png|jpg|jpeg|gif|webp|svg|cur)'
// https://www.npmjs.com/package/glob
var createImageGlob = function( srcImages, filePart, variant, fileTypes, negate, toLowerCase )
{
	//if (toLowerCase === true ) filePart = filePart.toLowerCase();
	//if (toLowerCase === true ) variant = variant.toLowerCase();
	// root
	var seperator = '?(_|.|-)';
	var glob = srcImages +'/**/';
	// first match everything UNTIL ...
	//glob += '*'+seperator;
	//glob += 'f1*';
	//glob += seperator + filePart;
	//glob += '+'+ seperator + filePart + '?'+seperator;
	glob += '*_+' + filePart + '_*';
	// if you want the variant to be picked up in the images too...
	//glob += '*('+variant +')';
	//glob += variant;
	// file extension...
	glob += '.+('+fileTypes+')';
	return negate ? '!'+ glob : glob;
};
	
	
gulp.task('images', function() {
	
	var merge 			= require('merge-stream');			// combine multiple streams!
	var imagemin   		= require('gulp-imagemin');
	var browserSync 	= require('browser-sync');
	var changed    		= require('gulp-changed');
	var newer 			= require('gulp-newer');
	var tap 			= require('gulp-tap');
	var gulpif 			= require('gulp-if');				// conditional compiles
	var path 			= require('path');
	
	var config      	= require('../config');
	var options 		= require('../utils/options.js');
	var sanitise    	= require('../utils/sanitisation.js');
	
	var setup 			= config.build;
	var source 			= config.source;
	var destination 	= config.destinations[ setup.destination ];
	var names 			= config.names;
	var structure		= config.structure;
	var sourceFolders 	= config.sourceFolders;
	var fileTypes		= config.fileTypes;
	
	var languages 		= options.languages.length ? options.languages : [''];
	var types 			= options.types.length ? options.types : [''];
	var variants		= options.variants.length ? options.variants : [''];
	
	var destinationsImages = sanitise.getDestinationPaths( options.brand, types, variants, languages, options.version, '', names.seperator, structure.images, destination.root );	//folderLocation + '/' + structure.styles;
	
	//console.log( source.images );
	//console.log( destinationsImages );
	
	// Simple task that does nothing clever to the checked images
	return gulp.src( source.images, {base : '.'} )
				//.pipe( newer(destination.images) ) 						// Ignore unchanged files
				.pipe( tap(function (file,t) {
					
					// first of all fetch just the file name of the image
					var fileName = path.basename(file.path);
					var imageData = sanitise.determineImageDestination( fileName, options );
					//console.log( file.path );
					//console.log( file );
					console.log( imageData );
					//console.log( t );
					
					var destinations = [];
					
					// Does this image file name contain a type?
					if ( imageData.match === true )
					{
						var matchedLanguages;
						
						// Loop through each language and create the relevant outputs if a language is NOT specified...
						if ( imageData.language.length > 0 )
						{
							// we have a language specified in the image, so let us use only this one...
							matchedLanguages = [ imageData.language ];
						}else{
							// we do not have a single language specified for THIS image, so let us assume this is multi-language image
							matchedLanguages = languages;
						}
						
						// loop through matched Languages and determine the detinations...
						matchedLanguages.map(function( language ){
							
							// Yes it does, so let us use a solo destination
							var folderName = sanitise.getFolder( options.brand, imageData.type, imageData.variant, language, options.version, '', names.seperator );
							// If there are multiple languages, we must create thte folder here...
							var dest = path.join( destination.root, folderName, structure.images );  // imageData.extension;
							destinations.push( dest );
						});
						
						
					}else{
						
						// No it doesn't, so let's pipe it to all image folders.
						destinations = destinationsImages;
					}
					
					//console.log(destinationsImages);
					
					var tasks = destinations.map(function(element){
						return gulp.src(file.path)
							.pipe( gulpif( !options.compress.images, imagemin() ) )	// optimise
							.pipe( gulp.dest(
								function( file ) { 
									// source path
									var sourcePath = path.dirname(file.path); 
									var sourceFolders = sourcePath.split(path.sep);
									var sourceFolder = sourceFolders[ sourceFolders.length-1 ];
									var output = path.join( element, sourceFolder ); 
									
									//console.log("Image cloning to type folder : "+element );
									//console.log(' dir : '+dir );
									//console.log(' ext : '+path.extname(file.path) );
									//console.log(' element : '+element );
									//console.log(' output : '+output );
									//console.log(' sourceFolders : '+sourceFolder );
									
									return output;
								}
							
							
							) )
							.pipe( browserSync.reload({stream:true}) );
					});

					return merge(tasks);
				}));
});

	/*
	return gulp.src( source.images )
	
			.pipe( tap(function (file,t) {
				// extrapolate the file name from the glob
				var filename 		= path.basename(file.path);
				
				console.log('filename : '+filename );
				//console.log('destinationsImages : '+destinationsImages );
				
				// Check to see if we have any Image sources matching our globs...
				
				
				return 	gulp.src(file.path)
							//.pipe( imagemin() ) // Optimize
							//.pipe( newer(destination.images) ) // Ignore unchanged files
							// copy to *ALL*
							//.pipe( multistream.apply(undefined, destinationsImages) )
							.pipe( gulp.dest(destination.images) )
							.pipe( browserSync.reload({stream:true}) );
			}));	
				
			
		*/


//
//var gulp = require('gulp');
//
//gulp.task('package', function(cb) {
	//
	//// Leaderboard configuration and options file
	//var config     		= require('../config.js');
	//var options 		= require('../utils/options.js');
	//var sanitise    	= require('../utils/sanitisation.js');
	//
	//// Fetch options and config
	//var setup 			= config.build;
	//var source 			= config.source;
	//var destination 	= config.destinations[ setup.destination ];
	//
	//
	//// Requested types (sizes)
	//var types 			= options.types;
	//
	//// Requested variations in the languages.
	//// NB. If this is empty, we do not create those templates
	//var languages 		= options.languages.length ? options.languages : [''];
	//// default language if there is not one specified in the options
	//var language 		= '';
	//
	//// sizes for the adverts
	//var sizes 			= options.sizes;
	//var names 			= config.names;
	//
	//// Requested variations in these campaigns...
	//var variants		= options.variants;
	//var variant			= '';
	//var structure		= config.structure;
	//var sourceFolders 	= config.sourceFolders;
	//var fileTypes		= config.fileTypes;
	//
	//
	//// This takes each source file and creates the neccessary outut folder
	//// And copies the code from build folder... therefore this tasks depends
	//// upon the output of other tasks and thus should be run as part of a job
	//// var path 			= require('path');
	//var fs 				= require('fs');
	//var newer 			= require('gulp-newer');
	//var changed    		= require('gulp-changed');
	//var imagemin   		= require('gulp-imagemin');
	////var uglify     		= require('gulp-uglify');
	////var less 			= require('gulp-less');
	//var gulpif 			= require('gulp-if');				// conditional compiles
	////var csscomb 		= require('gulp-csscomb');
	////var data 			= require('gulp-data');
	////var jade 			= require('gulp-jade');
	////var concat 			= require('gulp-concat');
	//var rename 			= require('gulp-rename');			// rename files
	//var merge 			= require('merge-stream');			// combine multiple streams!
	//var browserSync 	= require('browser-sync');
	//
	//// a way of doing multiple gulp streams simultaneously
	//var merged 	= merge();
	//
	////console.log( config.destinations, setup.destination );
	//console.log('PACKAGE > Creating in : "'+destination.root+'"' );
	//
	//// TODO : 
	//// create Interim data to speed up compilation...
	//for ( var i = 0, z=types.length; i < z; ++i)
	//{
		//var type = types[t];
		//
		//// css
		//
		//// Images
		//
		//// Icons
		//
	//}
	//
	//
	//
	//// Loop through variants
	//for ( var v=0, a=variants.length; v < a; v++)
	//{
		//variant = variants[v];
		//console.log( 'PACKAGE > Copying Variant '+(v+1)+' / '+a+' : '+variant.toUpperCase() );
		//console.log('=======================================================');
		//
		//// Loop through languages (only if languages are not empty!)
		//for ( var l=0, q=languages.length; l < q; l++)
		//{
			//language = languages[l];
			//console.log( 'PACKAGE > Packaging for Language : '+language.toUpperCase()+'......................' );
			//console.log('');
			//
			//// Loop through Types (MPU/Leaderboard/Skyscraper)
			//for (var t = 0, e=types.length; t < e; t++)
			//{
				//// Here we go... now we have access to every single variant!
				//var type = types[t];
				//var size = sizes[ type ];
				//
				//// brand, type, variant, language, prefix, suffix, seperator
				//var folderName = sanitise.getFolder( options.brand, type, variant, language, options.version, '', names.seperator );
				//var folderLocation = destination.root + '/'+ folderName;
//
				//console.log( 'PACKAGE > '+(t+1)+'/'+types.length+'. Packaging type : '+type+' into '+folderName );
			//
				//// Images ----------------------------------------------------------------
				//
				//// Basically the images are slightly more complex than need be...
				//// Firstly, we look at ALL the image files available
				//// Then we REMOVE all images that are not using this variant or type
				////
				//var srcImages = sourceFolders.root + '/' + sourceFolders.images;
				//// create a GLOB that handles types that are NOT named after the other types
				////var imageGlob = [ srcImages +'/**/ *.+('+fileTypes.images+')' ];
				//
				//
				//// holder of the other names to disregard
				//var unwantedTypes = [];
				//var unwantedVariants = [];
					//
				//for ( var b=0, z=variants.length; b < z; b++)
				//{
					//var currentVariant = variants[b];
					//if (variant === currentVariant)
					//{
						//
					//}else{
						//unwantedVariants.push( currentVariant );
					//}
					//
					//// This creates a GLOB that removes *ANY* image file that has the type in the title
					//// Loop through types and create a glob that finds *all* files that do NOT have a type in their title
					//// AS WELL as *all* files that have this SPECIFIC type of 
					//for (var g = 0, k=types.length; g < k; g++)
					//{
						//if (variant === currentVariant)
						//{
							//
							//// we are trying to restrict the OTHER files and not this one...
							//
						//}else{
							//
							//// we only want to copy files that *HAVE* either a unique file name with no type specified
							//// or an image that has the specific type specified...
							//if ( type === types[g] )
							//{
								//// Yes we want!
								//// imageGlob.push( distribution.images +'/**/*'+ type +'*' );
							//}else{
								//// No we *dont* want
								//// Custom seperator - here using underscore _
								//var unwantedType = types[g];
								//unwantedTypes.push( unwantedType );
								//
								///*
								//// we are using an option in the glob that disregards cases which should
								//// simplify things for the globbing patterns which are currently super complicated
								//
								//// in case the user has not used the correct case to write the file name
								//if ( unwantedType !== unwantedType.toLowerCase() ) 
								//{
									//glob = createImageGlob ( srcImages, unwantedType, currentVariant, fileTypes.images, true, true );
									//imageGlob.push( glob );
								//}
								//*/
							//}
						//}
//
					//}
					//
					//
				//}
				//
				//
				//// Now we have 2 arrays that we can play with :)
				//var seperator = '+(_|.|-)';
				//var variantsGlob = '+('+unwantedVariants.join('|')+')';
				//var typesGlob = '+('+unwantedTypes.join('|') +')';
				//var typesGlobCased = '+('+unwantedTypes.join('|') +')'.toLowerCase();
				//
				//var imageGlob = [];
				////var glob = createImageGlob ( srcImages, typesGlob, variantsGlob, fileTypes.images, true, false );
				////var glob = './src/images/**/*+'+typesGlob+'_*.+(png|jpg|jpeg|gif|webp|svg|cur)';
				////var glob = '!./src/images/**/*+'+typesGlob+'+'+variantsGlob+'.+('+fileTypes.images+')';
				//var globA = '!./src/images/**/*'+seperator+typesGlob+'*'; // .+('+fileTypes.images+')
				//var globB = '!./src/images/**/*'+seperator+typesGlobCased+'*'; // .+('+fileTypes.images+')
				//
				//// restrict to ALL images...
				//imageGlob.push( srcImages +'/**/*.+('+fileTypes.images+')' );
				//
				////imageGlob.push( globA );
				////imageGlob.push( globB );
				//
				//
				//// 
			//
				//
				////, 
				//var globOptions = {  debug: false }; // nocase:true ,
				//
				//var destinationImages = folderLocation + '/' + structure.images;
				//// source.images
				//var taskImages = gulp.src( imageGlob, globOptions  )
					//// only minify if need be...
					////.pipe( imagemin() ) // Optimize
					//.pipe( gulp.dest( destinationImages ) );
				//
				//merged.add( taskImages ); 
	//
				//console.log( 'PACKAGE > Packaging Images :-> '+destinationImages );
				////console.log( variantsGlob );
				////console.log( typesGlob );
				//console.log( imageGlob );
				//
				//
				//console.log('');
			//}
			////
		//}
		//// 
	//}
	//
	//// Handle each task individually...
	//return merged;
//});
