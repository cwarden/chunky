#!/usr/bin/env node
require.paths.unshift(__dirname + '/lib');
var sys = require('sys');
const VERSION = 0.01;
/*
require.paths.unshift(__dirname + '/lib/operetta');

// Set command-line options with default values
var opts = require('tav').set({
	buffer: {
		note: 'Buffer size:  Output will be written if this many bytes has been read from stdin (default: 4096 bytes)',
		value: 4096
	},
	timeout: {
		note: 'Timeout:  Output will be written after this many seconds if we have buffered any input and haven\'t yet filled the buffer (default: 3 seconds)',
		value: 3
	},
	command: {
		note: 'Command to run:  Run this command and write to its stdin instead of writing to stdout',
		value: null
	}
}, "chunky: buffer input and write it out in chunks\nUsage: chunky [OPTION]... -- [COMMAND] [ARG]...\n");
console.log(opts, opts.args);

var Operetta = require("operetta").Operetta;
operetta = new Operetta();
operetta.parameters(['-b','--buffer'], "Database");
operetta.parameters(['-t','--timeout'], "Timeout");
operetta.start(function(values) {
	console.log(values);
});
*/

var trollopjs = require('trollopjs');
var Parser = trollopjs.Parser;
var parser = new Parser();
parser.opt('timeout', "Timeout", {dflt: 3});
parser.opt('buffer', "Buffer", {dflt: 4096});
parser.opt('help', 'Help');
parser.opt('version');
try {
   opts = parser.parse();
} catch (err) {
	if (err == trollopjs.HelpNeeded) {
		var help = "chunky: read from stdin, buffer the input, and write it out in chunks\n" +
		  "Usage: chunky [OPTION]... -- [COMMAND] [ARG]...\n\n" +
		  "chunky will read from stdin, buffer the input until the buffer is\n" +
		  "full or until no input has been received for the number of seconds\n" +
		  "specified by the timeout.\n\n" +
		  "If a COMMAND is specified, it will be run each time the buffer is\n" +
		  "written and will be passed the input.  Otherwise, stdin will be\n" +
		  "written to stdout.\n"
		sys.puts(help);
		parser.educate();
		process.exit(0);
	} else if (err == trollopjs.VersionNeeded) {
		sys.puts('chunky ' + VERSION);
		process.exit(0);
	} else {
		sys.puts(err);
		process.exit(1);
	}
}
// console.log(parser);
// console.log(parser.leftovers);

/*
var opts = require('trollopjs').options(function() {
  this.opt('timeout', "Timeout", {dflt: 3});
  this.opt('buffer', "Buffer", {dflt: 4096});
});
*/
console.log(opts);
console.log(process.ARGV);

var stdin = process.openStdin();

// stdin.setEncoding('utf8');

var buf = new Buffer(opts.buffer);
var bufLength = 0;

var inputTimeout;

stdin.on('data', function (chunk) {
	console.info('Read data.  Will write it out in ' + opts.timeout + ' seconds if nothing else comes in');
	console.info('Writing ' + chunk.length + ' bytes to ' + bufLength + ' in buffer');
	chunk.copy(buf, bufLength, 0);
	bufLength += chunk.length;
// pause stdin stream if buffer is full
// stdin.pause();
// stdin.resume();
	if (inputTimeout) {
		clearTimeout(inputTimeout);
	}
	inputTimeout = setTimeout(function() {
		if (! opts.command) {
			process.stdout.write('data: ' + buf.slice(0, bufLength));
		} else {
		}
		// reset buffer
		bufLength = 0;
	}, opts.timeout*1000);
});

stdin.on('end', function () {
	// process.stdout.write('end');
});
