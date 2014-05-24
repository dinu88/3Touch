var spawn = require('child_process').spawn,
    synclient = spawn('synclient', ['-m', '100']),
    exec = require('child_process').exec,
    child;


//TODO: this is not best solution. find better way to clean empty array values
Array.prototype.clean = function(deleteValue) {
  for (var i = 0; i < this.length; i++) {
    if (this[i] == deleteValue) {         
      this.splice(i, 1);
      i--;
    }
  }
  return this;
};


var changed = null;
var gotSecondData = null;

synclient.stdout.on('data', function (data) {
	data = data.toString().split(/[^0-9\.]/).clean("");
	if (data.length == 0) return
	var fingers = data[4];
	
	if (changed && fingers == 3) {
		gotSecondData = true;
		endX = data[1];
		endY = data[2];
	}
	if (fingers == 3 && !changed) {
		startX = data[1];
		startY = data[2];
		endX = null;
		endY = null;
		changed = true;
	}
	if (fingers !=3 && changed) {
		changed = null;
		if (!gotSecondData) {
			endX = data[1];
			endY = data[2];	
		}
		gotSecondData = null;
		diffX = startX - endX;
		diffY = startY - endY;
		if (Math.abs(diffY) > Math.abs(diffX)) {
			if (Math.abs(diffY) > 100) {
				if (endY < startY) {
					move('Up');
				} else {
					move('Down');
				}
			}
		} else {
			if (Math.abs(diffX) > 100) {
				if (endX < startX) {
					move('Left');
				} else {
					move('Right');
				}				
			}

		}
		startX = startY = endX = endY = diffX = diffY = null;
	}
})

var move = function(direction) {
	console.log(direction);
	exec('xdotool key Control+Alt+' + direction , function (error, stdout, stderr) {
		    if (error !== null) {
		      console.log('exec error: ' + error);
		    }
		});
}

synclient.stderr.on('data', function (data) {
  console.log('stderr: ' + data);
});

synclient.on('close', function (code) {
  console.log('child process exited with code ' + code);
});