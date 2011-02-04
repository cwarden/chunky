#!/usr/bin/env node
require.paths.unshift(__dirname + '/lib');

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
