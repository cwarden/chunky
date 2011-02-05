#!/usr/bin/env node
require.paths.unshift(__dirname + '/lib');
var sys = require('sys');
const VERSION = 0.01;

var trollopjs = require('trollopjs');
var Parser = trollopjs.Parser;
var parser = new Parser();
parser.opt('timeout', " Timeout", {dflt: 3});
parser.opt('buffer', " Buffer Size", {dflt: 4096});
parser.opt('debug');
parser.opt('help');
parser.opt('version');
try {
   opts = parser.parse();
	// trollopjs leaves nodejs interpreter, the name of this script, and everything
	// after -- on the command line in parser.leftovers
	args = parser.leftovers.slice(2);
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

if (opts.debug) {
	console.log('OPTIONS:');
	console.log(opts);
	console.log('COMMAND:');
	console.log(args);
}

var command, commandArgs, child;
if (command = args[0]) {
	commandArgs = args.slice(1);
	var spawn = require('child_process').spawn;
}

var stdin = process.openStdin();

// stdin.setEncoding('utf8');

var buf = new Buffer(opts.buffer);
var bufLength = 0;

var inputTimeout;

var flushBuffer = function() {
	if (command) {
		child = spawn(command, commandArgs);
		child.stdin.write(buf.slice(0, bufLength));
		child.stdout.on('data', function(data) {
			sys.print(data);
		});
		child.stdin.end();
	} else {
		process.stdout.write('data: ' + buf.slice(0, bufLength));
	}
	// reset buffer
	bufLength = 0;
};

// TODO:  handle case where chunk > opts.buffer
stdin.on('data', function (chunk) {
	opts.debug && sys.debug('Read data.  Will write it out in ' + opts.timeout + ' seconds if nothing else comes in');
	opts.debug && sys.debug('Writing ' + chunk.length + ' bytes to ' + bufLength + ' in buffer');
	// Flush the buffer if the chunk would cause an overflow
	if (bufLength + chunk.length > opts.buffer) {
		flushBuffer();
	}
	chunk.copy(buf, bufLength, 0);
	bufLength += chunk.length;

	// (re)set the timer to flush the buffer
	if (inputTimeout) {
		clearTimeout(inputTimeout);
	}
	inputTimeout = setTimeout(flushBuffer, opts.timeout*1000);
});

stdin.on('end', function () {
	// process.stdout.write('end');
});
