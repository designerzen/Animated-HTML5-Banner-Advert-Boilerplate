var gulp = require('gulp');
	
gulp.task('help', function (cb) {
	
	var fs = require('fs');
	var fileName = './'+"help.txt";
	var packageJson = require("./package.json");	// read in package.json!

	var file = fs.readFileSync(fileName, 'utf-8');
	if (file) console.log( file );
});
