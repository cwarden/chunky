#!/usr/bin/env node
require.paths.unshift(__dirname + '/lib');
var sys = require('sys');
const VERSION = 0.01;

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
