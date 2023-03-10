var timeouts = [];
var dayjs = require('dayjs');
var arraySupport = require("dayjs/plugin/arraySupport");

dayjs.extend(arraySupport);


//nice shortcut functions
function $(id) {
    return document.getElementById(id);
}

function $$(name, number) {
    return document.getElementsByTagName(name)[number];
}

var interface = new CSInterface();
(function () {
	var path, slash;
	path = location.href;
	if(getOS() == "MAC") {
		slash = "/";
		path = path.substring(0, path.length - 11);
	}
	if(getOS() == "WIN") {
		slash = "/";
		path = path.substring(8, path.length - 11);
	}

	//block ae from using ALL keys while this window is active
	//keyRegisterOverride();

	// alert(path.slice(60, path.length));

	//can run a given function in aftereffects.jsx
	// interface.evalScript('testFunction()', function(res) {
	// 	//anon function to do whatever you want with the result from the test function
	// 	alert("anon func");
	// });

	//wait 2000 ms THEN run the stuff inside
	// setTimeout(function() {
	// 	//the stuff inside
	// }, 2000);

}());

//if checkbox not checked gray out/disable keybinds
var nodes;
function toggleBinds(e) {
	if(!$('custombinds-checkbox').checked) {
		// alert("unchecked");
		$('binds').style.color = 'grey';
		nodes = document.querySelectorAll("input[type=text]");
		for (var i=0; i<nodes.length; i++) {
			nodes[i].style.color = 'grey';
			nodes[i].setAttribute("readonly", "true");
		}
	} else {
		// alert("checked");
		$('binds').style.color = 'white';
		nodes = document.querySelectorAll("input[type=text]");
		for (var i=0; i<nodes.length; i++) {
			nodes[i].style.color = 'white';
			nodes[i].removeAttribute("readonly");
		}
	}
}

//check if checkbox checked or unchecked to make sure its being the right color
function toggleCheckbox(e) {
	//alert(e.currentTarget.id + " " + e.currentTarget.checked);
	if(!e.currentTarget.checked) {
		e.currentTarget.parentNode.childNodes[3].style.backgroundColor = $('color-picker').value;
	} else {
		e.currentTarget.parentNode.childNodes[3].style.backgroundColor = "#D7D7D7";
	}
}

function statsClick() {
	//alert("stats click");
	interface.requestOpenExtension("com.ahr.stattracker.stats.panel");
}

function getOS() {
	var userAgent = window.navigator.userAgent,
	platform = window.navigator.platform,
	macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'],
	windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'],
	os = null;

	if(macosPlatforms.indexOf(platform) != -1) {
		os = "MAC";
	} else if(windowsPlatforms.indexOf(platform) != -1) {
		os = "WIN";
	}
	return os;
}


//increment the timer every second
function incrementTimer() {
	//get stuff from html
	var time = $('stopwatch').innerText;
	var tokens = time.split(":");
	var hours = parseInt(tokens[0]);
	var minutes = parseInt(tokens[1]);
	var seconds = parseInt(tokens[2]);

	//increment
	seconds++;
	if(seconds >= 60) {
		seconds -= 60; minutes++;
	}
	if(minutes >= 60) {
		minutes -= 60; hours++;
	}

	//fit to string formatting
	if(seconds < 10) {
		seconds = '0' + seconds.toString();
	}
	if(minutes < 10) {
		minutes = '0' + minutes.toString();
	}
	
	//return
	var res = hours.toString() + ":" + minutes.toString() + ":" + seconds.toString();
	//$('stopwatch').innerText = res;
	saveTimer(res);
	setTimeout(incrementTimer, 1000);
}

//decrement the timer every second
function decrementTimestamp(time) {
	if(time == null) { time = $('stopwatch').innerText; }
	var tokens = time.split(":");
	var hours = parseInt(tokens[0]);
	var minutes = parseInt(tokens[1]);
	var seconds = parseInt(tokens[2]);

	//increment
	seconds--;
	if(seconds <= 0) {
		seconds = 59; minutes--;
	}
	if(minutes <= 0) {
		minutes = 59; hours--;
	}

	//fit to string formatting
	if(seconds < 10) {
		seconds = '0' + seconds.toString();
	}
	if(minutes < 10) {
		minutes = '0' + minutes.toString();
	}
	
	//return
	var res = hours.toString() + ":" + minutes.toString() + ":" + seconds.toString();
	if(res == "0:05:00" || res == "0:04:58") {
		document.body.style.backgroundColor = "red";
	} else {
		document.body.style.backgroundColor = "#232323";
	}
	// alert(res);
	$('stopwatch').innerText = res;
	// return res;
	if(seconds == 0) {
		startClick(); //sync up to the servers every minute
	} else {
		timeouts.push(setTimeout(decrementTimestamp, 1000));
	}
}

function startClick() {
	for (var i = 0; i < timeouts.length; i++) {
		clearTimeout(timeouts[i]);
	}
	timeouts = [];

	const time = $('time-dropdown').value;
	const timetokens = time.trim().split(":");

	//absolute timezone bullshittery
	//getTimezoneOffset gives the offset from UTC in minutes- for me (EST) that's 300 minutes (GMT-5)
	//I then negate the whole offset to make it a timer
	const timezone = $('timezone-dropdown').value;
	const offset = -(new Date().getTimezoneOffset() + (parseInt(timezone)*60));
	var hour; var minute;
	//for the future, if i have timezones like +5.5 that don't divide evenly, this will account for that
	if(offset % 60 != 0) {
		hour = parseInt(timetokens[0]) + Math.floor(offset / 60);
		minute = (offset % 60)*60;
	} else {
		hour = parseInt(timetokens[0]) + (offset / 60);
		minute = 0;
	}

	//helpful debug alert
	//alert("timezone: " + timezone + "\npure offset " + new Date().getTimezoneOffset() + "\noffset: " + offset.toString());

	//initialize times based on current and end times
	var today = dayjs();
	var endArr = [parseInt(today.year()), today.month()+1, today.date()];
	var endTime = dayjs(endArr).hour(hour).minute(minute).second(0).millisecond(0);

	//take difference
	var diffMins = endTime.minute()-today.minute()-1;
	var diffHours = endTime.hour()-today.hour()-1;
	var diffSeconds = 60 - today.second();
	//alert(diffHours + ":" + diffMins + ":" + diffSeconds);

	//if it goes thru the night (ie: 22:15 -> 00:25) invert
	if(diffMins < 0) {
		diffMins = 60 + diffMins;
	}
	if(diffHours < 0) {
		diffHours = 24 + diffHours;
	}

	//fix formatting
	if(diffMins < 10) {
		diffMins = "0" + diffMins.toString();
	}
	if(diffSeconds < 10) {
		diffSeconds = "0" + diffSeconds.toString();
	}
	var diff = "" + (diffHours) + ":" + (diffMins) + ":" + diffSeconds;
	// alert("endarr: " + endArr.toString() + "\n" + endTime.toString() + "\n" + today.toString() + "\n" + diff);

	//parse & subtract
	$('stopwatch').innerText = diff;
	decrementTimestamp();
}

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

// startClick();