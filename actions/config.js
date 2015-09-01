/* 

=============================================================

Settings! You can modify anything here safely.

The default settings will work fine for most projects

=============================================================

*/

// FOLDERS --------------------------------------------------------------------

var 
	// Source files folder relative to the root
	SOURCE_FOLDER 			= './src',
	// Where the initial build occurs (debugable)
	// can be either "./debug" "./build" "./distribution"
	BUILD_FOLDER 			= './debug',
	// Once debugging is complete, copy to server ready files here
	DISTRIBUTION_FOLDER 	= './dist';		

	
// OPTIONS --------------------------------------------------------------------

// Do You want the source files to be compressed when in DEBUG mode?
// this applies to the HTML, CSS and also JavaScript, 
var 
	SQUISH		= false,
	// Source maps for less and js?
	SOURCE_MAPS	= true;
	
	
// FILE NAMES --------------------------------------------------------------------

var 
	// What should the concatted js file be called?
	JAVASCRIPT_FILE_NAME		= 'main.js',
	// What should the concatted js file be called?
	JAVASCRIPT_LIBS_FILE_NAME	= 'libs.js' ;

// FILE TYPES : these defaults should be fine for the majority of projects
var fileTypes = {
	images:'png|jpg|jpeg|gif|webp|svg|cur',
	icons:'ico|png|jpg|jpeg|gif|webp|svg|json|xml',
	fonts:'svg|eot|woff|woff2|ttf|otf'
};

var sourceFolders = {
	root		: SOURCE_FOLDER,
	scripts 	: 'scripts',
	manifests	: 'manifests',
	json		: 'json',
	styles 		: 'styles',
	html 		: 'jade',
	images		: 'images',
	icons		: 'icons',
	fonts		: 'fonts'
};

// Where shall we compile them to?
var structure = {
	scripts : 'js',
	styles 	: 'css',
	html 	: '',
	images	: 'img',
	icons	: '',
	fonts	: 'fonts'
};

// Set up in config!
var tweenEngine = 'tweenlite'.toLowerCase();

// Where shall we compile them to?
var getDestinations = function( dir, assetSubFolder ) {
	var divider = !!assetSubFolder ? '/' + assetSubFolder + '/' : '/';
	return {
		root 	: dir,
		html 	: dir + '/' + structure.html,
		scripts : dir + divider + structure.scripts,
		styles 	: dir + divider + structure.styles,
		images	: dir + divider + structure.images,
		icons	: dir + divider + structure.icons,
		fonts	: dir + divider + structure.fonts,
		maps	: './maps'
	};
};


module.exports =
{
	fileTypes:fileTypes,
	structure : structure,
	sourceFolders : sourceFolders,
	source :{
		root: SOURCE_FOLDER,
		less:		[SOURCE_FOLDER+'/'+sourceFolders.styles+'/style.less'],
		jade: [ 
			SOURCE_FOLDER+'/'+sourceFolders.html+'/*.jade', 
			'!'+SOURCE_FOLDER+'/'+sourceFolders.html+'/*.base.jade',  
			'!'+SOURCE_FOLDER+'/'+sourceFolders.html+'/partials/**' 
		],
		
		manifests:	SOURCE_FOLDER+'/manifests/',
		images:		SOURCE_FOLDER+'/'+sourceFolders.images+'/**/*.+('+fileTypes.images+')',
		icons:		SOURCE_FOLDER+'/'+sourceFolders.icons+'/**/*.+('+fileTypes.icons+')',
		fonts:		SOURCE_FOLDER+'/'+sourceFolders.fonts+'/**/*.+('+fileTypes.fonts+')',
		scripts:	[
			SOURCE_FOLDER+'/'+sourceFolders.scripts+'/vendor/'+tweenEngine+'/**/*.js', 
			//SOURCE_FOLDER+'/'+sourceFolders.scripts+'/vendor/trmix*.js', 
			//SOURCE_FOLDER+'/'+sourceFolders.scripts+'/vendor/fontscaler.js', 
			SOURCE_FOLDER+'/'+sourceFolders.scripts+'/utils.js', 
			SOURCE_FOLDER+'/'+sourceFolders.scripts+'/user/**/*.js', 
			SOURCE_FOLDER+'/'+sourceFolders.scripts+'/aninmation.js', 
			SOURCE_FOLDER+'/'+sourceFolders.scripts+'/!(*flashtrack)*.js', 
			SOURCE_FOLDER+'/'+sourceFolders.scripts+'/flashtrack.js', 
			SOURCE_FOLDER+'/'+sourceFolders.scripts+'/run.js' 
		],
		json:		SOURCE_FOLDER+'/'+sourceFolders.json+'/'
	},

	watch :{
		less:		SOURCE_FOLDER+'/'+sourceFolders.styles+'/*.less',
		jade:		SOURCE_FOLDER+'/'+sourceFolders.html+'/**/*.jade',
		images:		SOURCE_FOLDER+'/'+sourceFolders.images+'/**/*.+('+fileTypes.images+')',
		icons:		SOURCE_FOLDER+'/'+sourceFolders.icons+'/**/*.+('+fileTypes.icons+')',
		fonts:		SOURCE_FOLDER+'/'+sourceFolders.fonts+'/**/*.+('+fileTypes.fonts+')',
		scripts:	SOURCE_FOLDER+'/'+sourceFolders.scripts+'/**/*.js',
		json:		SOURCE_FOLDER+'/'+sourceFolders.json+'/*.json'
	},

	destinations:{
		// Where shall we create the building / debug versions
		debug : 		getDestinations( BUILD_FOLDER ),
		build : 		getDestinations( BUILD_FOLDER ),
		// Where shall we create the final output
		distribution : 	getDestinations( DISTRIBUTION_FOLDER )
	},

	names:{
		index:"index.html",
		manifest:"manifest.js",
		scripts:JAVASCRIPT_FILE_NAME,
		template:SOURCE_FOLDER+'/'+sourceFolders.html+'/templates/template.jade',
		demo:SOURCE_FOLDER+'/'+sourceFolders.html+'/templates/demo.jade',
		seperator:'_'
	},

	browserSync: {
		// Browsersync includes a user-interface that is accessed via a separate port.
		// The UI allows to controls all devices, push sync updates and much more.
		ui: {
			port: 8080
		},
		// Serve files from the app directory with directory listing
		server: {
			// Serve up our build folder
			// You cancelBubble have Mulitpiles like [ here , here , here ]
			baseDir: BUILD_FOLDER,
			directory: true
		},
		// Use a specific port (instead of the one auto-detected by Browsersync)
		port: 303,

		// Clicks, Scrolls & Form inputs on any device will be mirrored to all others.
		ghostMode: {
			clicks: true,
			forms: true,
			scroll: true
		},
		// Or switch them all off in one go
		// ghostMode: false

		// this should change depending on the task!
		logLevel: "debug",
		logPrefix:"Log"
	},

	// -- Do not change, these are set by the command line --
	build:{
		destination:BUILD_FOLDER.replace('./',''),
		sourceMaps:SOURCE_MAPS,
		compress:SQUISH
	}
};
