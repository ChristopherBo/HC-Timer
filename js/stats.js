const fs = require('fs'); //for file writing later
var statsFilePath = null;
var currentFilename = null;

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

	//find and set statsfilepath
	var home = require("os").homedir();
	statsFilePath = home + '/stats.txt';
	try {
		if (!fs.existsSync(statsFilePath)) {
			fs.open(statsFilePath, 'w', function (err, file) {
				if (err) throw err;
			});
		}
	} catch(err) {}

	//get stats and fill in the table
	getCurrentFilename();
	setTimeout(readTimer, 1000);

	interface.evalScript('getNumberAdjustmentLayers()', function(res) {
		//alert("adj layers: " + res);
		$('adj-layers').innerText = res;
	});

	interface.evalScript('getNumberPrecomps()', function(res) {
		//alert("adj layers: " + res);
		$('precomp-layers').innerText = res;
	});

	interface.evalScript('getNumberLayers()', function(res) {
		//alert("adj layers: " + res);
		$('layers-total').innerText = res;
	});

	interface.evalScript('getNumberEffects()', function(res) {
		//alert("adj layers: " + res);
		$('effects-total').innerText = res;
	});

	interface.evalScript('getNumberKeyframes()', function(res) {
		//alert("adj layers: " + res);
		$('keyframes-total').innerText = res;
	});

	interface.evalScript('getFileTypeTotals()', function(res) {
		//alert("adj layers: " + res);
		res = res.replace(/[|]/, "").split(",");
		$('video-file-total').innerText = res[0];
		$('image-file-total').innerText = res[1];
		$('audio-file-total').innerText = res[2];
	});

	interface.evalScript('getNumberUnusedFiles()', function(res) {
		//alert("adj layers: " + res);
		$('unused-file-total').innerText = res;
	});

	interface.evalScript('getNumberFiles()', function(res) {
		//alert("adj layers: " + res);
		$('file-total').innerText = res;
	});

	interface.evalScript('getPopularEffect()', function(res) {
		//alert("adj layers: " + res);
		$('popular-effect').innerText = res;
	});

	interface.evalScript('getRenderTime()', function(res) {
		//alert("adj layers: " + res);
		$('render-time').innerText = res;
	});

	//get crash total
	interface.evalScript('getAppVersion()', function(res) {
		//alert("adj layers: " + res);
		var crashFilePath = home + '/AppData/Roaming/Adobe/After Effects/' + res + '/logs';
		//alert(crashFilePath);
		fs.readdir(crashFilePath, (err, files) => {
			//alert(files.length);
			$('crash-total').innerText = files.length;
		});
		
	});
}());

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