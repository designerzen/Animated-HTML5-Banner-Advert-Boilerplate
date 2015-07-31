/*

	gulpfile.js
	===========
	Rather than manage one giant configuration file responsible
	for creating multiple tasks, each task has been broken out into
	its own file in gulp/tasks.

	Any files in that directory get	automatically required below.

	To add a new task, simply add a new task file that directory.

	To create a series of tasks, add a new file to gulp/jobs

	gulp/jobs/default.js specifies the default set of tasks to run
	when you run `gulp`.

	Tasks ========================================================

*/

var TASKS 		= 'tasks',
	JOBS 		= 'jobs',
	COMMANDS 	= './actions/';

var requireDir 	= require('require-dir');

// shared options
var config     	= require( COMMANDS + 'config');

// Require all tasks in gulp/tasks, including subfolders
requireDir( COMMANDS + JOBS, { recurse: false } );
requireDir( COMMANDS + TASKS, { recurse: false } );