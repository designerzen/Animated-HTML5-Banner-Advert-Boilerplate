/*

This is a JOB that creates our 

JADE templates files and our

JAVASCRIPT manifest files (if requested)

*/
var gulp = require('gulp');

// Run in parallel
gulp.task( 'scaffold', [ 'manifest', 'templates' ] );