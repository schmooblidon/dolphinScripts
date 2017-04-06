/*****
 * You can ignore pretty much everything from here
 * until the function called create actions.
 * this code up her will read incoming controller
 * messages from dolphin and then call onFrame with
 * each controller and each controller's last frame
 * every time a new frame occurs.
 *
 * You can just include all of this junk each time
 * you start working on something new, I'll try and
 * clean it up and put it in a library at some point.
 */

var net = require('net');

var dpadLeft = 1;
var dpadRight = 2;
var dpadDown = 4;
var dpadUp = 8;
var z = 16;
var r = 32;
var l = 64;
var a = 256;
var b = 512;
var x = 1024;
var y = 2048;
var start = 4096;

var takeScreenshots = false;
if (process.argv.length > 2) {
	if (process.argv[2] === "-s") {
		takeScreenshots = true;
	}
}

function isPushed(buttonVal, button) {
	return (buttonVal & button) != 0;
}

function writeActions(client, actions) {
	client.write("@");
	client.write(JSON.stringify(actions))
	client.write("@");
}

var client = new net.Socket();
client.connect(3490, '127.0.0.1', function() {
	console.log('Connected');
});

currs = [null, null, null, null]
prevs = [null, null, null, null]

inJson = false
jsonString = ""

client.on('data', function(data) {
	dataString = "" + data

	while(true) {
		if (inJson) {
			closedBrack = dataString.indexOf("}");
			if (closedBrack == -1) {
				jsonString += dataString;
				break;
			} else {
				jsonString += dataString.slice(0, closedBrack + 1)
				dataString = dataString.slice(closedBrack + 1)
				inJson = false;

				curr = JSON.parse(jsonString);
				prevs[curr.controller] = currs[curr.controller]
				currs[curr.controller] = curr
				if (prevs[curr.controller] == null) {
					prevs[curr.controller] = currs[curr.controller]
				}

				if (currs.reduce(function(agg, c) {
						if (agg.allTheSame) {
							if (c == null) {
								return agg;
							}
							if (agg.frame == -1 || agg.frame == c.frame) {
								return {frame: c.frame, allTheSame: true}
							}
							return {allTheSame: false}
						}
						return agg
					}, {frame: -1, allTheSame: true}).allTheSame) {
					onFrame(currs[0], currs[1], currs[2], currs[3], prevs[0], prevs[1], prevs[2], prevs[3])
				}
				jsonString = ""
			}
		} else {
			openBrack = dataString.indexOf("{");
			if (openBrack == -1) {
				break;
			} else {
				dataString = dataString.slice(openBrack);
				inJson = true;
			}
		}
	}
});

client.on('close', function() {
	console.log('Connection closed');
});


/*****
 * END LIBRARY STUFF
 */

var myAction = require('./action.js');

function onFrame(c1, c2, c3, c4, c1prev, c2prev, c3prev, c4prev) {
	// check is dpaddown was just pressed on controller 1
	if (c1 != null && (c1.button & dpadDown) != 0 && (c1prev.button & dpadDown) == 0) {
		myAction.actions(writeActions, client, c1.frame, takeScreenshots);
		console.log("Done");
	}
	if (c1 != null && (c1.button & dpadLeft) != 0 && (c1prev.button & dpadLeft) == 0) {
		delete require.cache[require.resolve('./action.js')]
		myAction = require('./action.js');
	}
}