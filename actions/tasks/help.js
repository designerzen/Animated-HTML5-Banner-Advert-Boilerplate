var gulp = require('gulp');
	
gulp.task('help', function (cb) {
	
	var fs = require('fs');
	var fileName = './'+"help.txt";

	var file = fs.readFileSync(fileName, 'utf-8');
	if (file) console.log( file );
	else console.error( "The file help.txt was *NOT* found in your root folder" );
});
