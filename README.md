## chunky

chunky reads from stdin and writes to stdout in chunks, either when its
buffer gets full or a timeout passes with no new input.  It can also spawn a
new process for each chunk that it outputs and pass the chunk to this process's
stdin.


### Dependencies:
	chunky is written in JavaScript for [node](https://github.com/ry/node).

### Getting Started:
	$ git clone git://github.com/cwarden/chunky.git
	$ cd chunky
	$ git submodule update --init
	$ ./chunky.js -h

### Usage:
	Usage: chunky [OPTION]... -- [COMMAND] [ARG]...

	chunky will read from stdin, buffer the input until the buffer is
	full or until no input has been received for the number of seconds
	specified by the timeout.

	If a COMMAND is specified, it will be run each time the buffer is
	written and will be passed the input.  Otherwise, stdin will be
	written to stdout.

	Options:
	  --timeout, -t <i> Timeout (default: 3)
	  --buffer, -b <i> Buffer Size (default: 4096)
	  --debug, -d
	  --help, -h
	  --version, -v

### Example

	$ (jot 10 1 10; sleep 3; jot 10 10 1) | ./chunky.js --timeout 2 -- sort -n
	1
	2
	3
	4
	5
	6
	7
	8
	9
	10
	1
	2
	3
	4
	5
	6
	7
	8
	9
	10
