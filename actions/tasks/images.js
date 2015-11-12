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
	
	var merge 			= require('merge-stream');		// combine multiple streams!
	var imagemin   		= require('gulp-imagemin');		// minification tool
	var using 			= require('gulp-using');		// determine which files the globs match
	var changed    		= require('gulp-changed');		// has a checksum changed
	var newer 			= require('gulp-newer');		// has the file date changed
	var tap 			= require('gulp-tap');			// conditional paths
	var gulpif 			= require('gulp-if');			// conditional compiles
	var browserSync 	= require('browser-sync');		// update browser synch
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
					// work out certain paramaters from the filename such as variant and language
					var imageData = sanitise.determineImageDestination( fileName, options );
					// this is an array of destination folders that the file will be cloned into
					var destinations = [];
					// set later to determine if we copy to one place or many!
					var isSpecific = false;
					
					/*
					
					// Test for Language Matches!
					// Does this image file name contain a type?
					if ( imageData.hasLanguage === true )
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
						
						isSpecific = true;
					}
					*/
					
					// Test for Type (MPU/Billboard/Leaderboard etc)
					if ( imageData.hasType === true )
					{
						// This is an array of types that this file matches
						var matchedTypes = imageData.types;
						var matchedVariants = imageData.variants;
						
						// Here we test to see if we have any variants listed,
						// As if the filename has a type but NOT a variant,
						// THEN we must still copy the file to the destinations
						if ( matchedVariants.length < 1 )
						{
							// as there are no variants specified for this file...
							// let us specify all variants for this size
							matchedVariants = variants;
							//console.log("NO VARIANTS LISTED :( ",matchedVariants);
							
						}else{
							//console.log("VARIANTS SPECIFIED!");
						}
						
						// loop through matched variants and determine the detinations...
						matchedVariants.map(function( matchedVariant ){
							
							//console.log("matchedVariant : "+matchedVariant );
							
							matchedTypes.map(function( matchedType ){
								
								// Yes it does, so let us use a solo destination
								var folderName = sanitise.getFolder( options.brand, matchedType, matchedVariant, imageData.language, options.version, '', names.seperator );
								// If there are multiple languages, we must create thte folder here...
								var dest = path.join( destination.root, folderName, structure.images );  // imageData.extension;
								
								console.log("Type : "+matchedType+ " dest : "+ dest);
								
								destinations.push( dest );
							});
							
						});
						
						
						isSpecific = true;
					}
					
					
					
					
					// We do not have an image with any pertinent info within
					if (!isSpecific) 
					{
						// No it doesn't, so let's pipe it to all image folders.
						destinations = destinationsImages;
						console.log( imageData.toString() + ' to all folders' );
					
					}else{
						
						console.log( imageData.toString() + ' to ' + destinations.join('\n') );
					}
					
					
					
					// console.log("Copying to ");
					// console.log(destinations);
					
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
									//if (destinations.length > 1) console.log('Destinations : ' );
									//console.log(' output : '+output );
									//console.log(' sourceFolders : '+sourceFolder );
									
									return output;
								}
							
							
							))
							//.pipe( using( {prefix:'To '+destinations.join(',')+' from', path:'relative', color:'blue'} ))
							//.pipe( using( {prefix:''+destinations.length+' destinations for', path:'relative', color:'blue'} ))
							//.pipe( using( destinations.length > 1 ? {prefix:''+destinations.length+' destinations for', path:'relative', color:'magenta'} : {prefix:'Single destinations of '+destinations[0] , path:'relative', color:'blue'} ))
							.pipe( browserSync.reload({stream:true}) );
					});

					return merge(tasks);
				}));
});
