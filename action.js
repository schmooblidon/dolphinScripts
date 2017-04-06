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

/* deprecated
function action(relativeFrame, controls) {
	controls.frame = frameStart + relativeFrame;
	controls.controller = controller
	return controls
}*/

function Input() {
	this.a = false;
	this.b = false;
	this.x = false;
	this.y = false;
	this.z = false;
	this.r = false;
	this.l = false;
	this.dpadUp = false;
	this.dpadRight = false;
	this.dpadDown = false;
	this.dpadLeft = false;
	this.start = false;
	this.stickX = 128;
	this.stickY = 128;
}

function Act(frameStart, length) {
	this.frameStart = frameStart;
	this.inputs = [];

	for (var i=0;i<length;i++) {
		this.inputs[i] = new Input();
	}

	// ---------------------------------------------
	// write any shortcut functions here

	this.FullStickHold = function(start, direction, time) {
		var dirValues = [128, 128];
		if (direction[0] == "U") {
			dirValues[1] = 255;
		}
		else if (direction[0] == "D") {
			dirValues[1] = 0;
		}
		if (direction[0] == "R" || direction[1] == "R") {
			dirValues[0] = 255;
		}
		else if (direction[0] == "L" || direction[1] == "L") {
			dirValues[0] = 0;
		}

		for (var i=0;i<time;i++) {
			this.inputs[start + i].stickX = dirValues[0];
			this.inputs[start + i].stickY = dirValues[1];
		}
	}

	this.ButtonHold = function(start, button, time) {
		for (var i=0;i<time;i++) {
			this.inputs[start + i][button] = true;
		}
	}

	//------------------------------------------------

	this.parseInputs = function(controller) {
		var pInputs = [];
		for (var i=0;i<this.inputs.length;i++) {
			pInputs[i] = {};
			pInputs[i].frame = i + this.frameStart;
			pInputs[i].controller = controller;

			pInputs[i].stickX = this.inputs[i].stickX;
			pInputs[i].stickY = this.inputs[i].stickY;

			pInputs[i].button = (this.inputs[i].a ? a : 0) + (this.inputs[i].b ? b : 0) + (this.inputs[i].x ? x : 0) + (this.inputs[i].y ? y : 0) + (this.inputs[i].z ? z : 0) + (this.inputs[i].l ? l : 0) + (this.inputs[i].r ? r : 0) + (this.inputs[i].dpadUp ? dpadUp : 0) + (this.inputs[i].dpadRight ? dpadRight : 0) + (this.inputs[i].dpadDown ? dpadDown : 0) + (this.inputs[i].dpadLeft ? dpadLeft : 0) + (this.inputs[i].start ? start : 0);
		}
		return pInputs;
	}
}


function createActions(frameStart, controller) {
	// 100 is the length of the input string. this creates 100 blank input slots (0-99), where stick x and y are 128, and every button is false
	var A = new Act(frameStart, 1500);
	// WRITE ACTION HERE

	// multishine example
	A.ButtonHold(0, "y", 5);
	A.FullStickHold(0, "L", 8);

	for (var i=0;i<33;i++) {
		A.inputs[18 + i * 44].stickX = 255;
		A.inputs[40 + i * 44].b = true;
		A.inputs[40 + i * 44].stickY = 255;
		for (var j=0;j<10;j++) {
			A.inputs[41 + i * 44 + j].stickX = 27;
			A.inputs[41 + i * 44 + j].stickY = 127;
		}
	}
	A.inputs[1470].stickX = 255;
	A.inputs[1477].b = true;
	A.inputs[1477].stickY = 255;
	A.FullStickHold(1478, "L", 20);
	


	// ACTION END
	return A.parseInputs(controller);
}

exports.actions = function(writeActions, client, frame, takeScreenshots) {
		// have the inputs start a few frames after the one where dpad was pushed
		// this gives both this script and dolphin time to process.
		// if you are getting dropped inputs, try increasing this number.
		waitFrames = 500;
		screenshotActions = [];
		console.log(frame);

		var amountOfScreenshots = 19;
		
		if (takeScreenshots) {
			for (i = frame + waitFrames; i < frame + waitFrames + amountOfScreenshots; i++) {
				var f = i - waitFrames - frame;
				screenshotActions.push({frame: i, filename: "SMASH_" + (f < 10 ? "0" : "") + (f < 100 ? "0" : "") + (f < 1000 ? "0" : "") + f})
			}
		}
		
		writeActions(client, {PadManipActions: createActions(frame + waitFrames, 0), TakeScreenshotActions: screenshotActions});
}