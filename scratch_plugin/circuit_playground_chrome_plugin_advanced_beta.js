(function (ext) {
    var embeditAppID = "dbhfnkcnljcbbpocflmbfcobkmagpgpf";
    //port connecting to chrome app
    var hPort;
    //connection status
    var hStatus = 0;
    var isDuo;
	var ledStatus = 0;
    //sensor info
    var sensorvalue = new Array(32);
	
    //when a new message is recieved, save all the info
    var onMsgCircuitPlayground = function (msg) {
        sensorvalue = msg;
    };
    function fitTo255(num) {
        return Math.max(Math.min(num,255.0),0.0);
    }
	
	//convert scratch hex color to rgb for neopixels
	function hexToRgb(hex) {
		// Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
		var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
		hex = hex.replace(shorthandRegex, function(m, r, g, b) {
			return r + r + g + g + b + b;
		});

		var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result ? {
			r: parseInt(result[1], 16),
			g: parseInt(result[2], 16),
			b: parseInt(result[3], 16)
		} : null;
	}
	
	function hexToR(h) {return parseInt((cutHex(h)).substring(0,2),16)}
	function hexToG(h) {return parseInt((cutHex(h)).substring(2,4),16)}
	function hexToB(h) {return parseInt((cutHex(h)).substring(4,6),16)}
	function cutHex(h) {return (h.charAt(0)=="#") ? h.substring(1,7):h}

    //gets the connection status for the circuit playground/scratch connection app
    var getCircuitPlaygroundStatus = function () {
        //console.log("status"); 
        chrome.runtime.sendMessage(embeditAppID, {message: "STATUS"}, function (response) {
            if (response === undefined) { //Chrome app not found
                //console.log("Chrome app not found");
                hStatus = 0;
                setTimeout(getCircuitPlaygroundStatus, 100);
            }
            else if (response.status === false) { //Chrome app says not connected
                if (hStatus !== 1) {
                    //console.log("Not connected");
                    hPort = chrome.runtime.connect(embeditAppID);
                    hPort.onMessage.addListener(onMsgCircuitPlayground);
                }
                hStatus = 1;
                setTimeout(getCircuitPlaygroundStatus, 100);
            }
            else {// successfully connected
                if (hStatus !==2) {
                    //console.log("Connected");
                    isDuo = response.duo;
                    //console.log("isDuo: " + isDuo);
                    hPort = chrome.runtime.connect(embeditAppID);
                    hPort.onMessage.addListener(onMsgCircuitPlayground);
                }
                hStatus = 2;
                setTimeout(getCircuitPlaygroundStatus, 100);
            }
        });
    };
	
	//set a neopixel on the circuit playground
	ext.setRingLed = function (lednum, redC, greenC, blueC, callback) {
        lednum--;
		if(lednum < 0) lednum = 0;//make sure our neopixel number is in bounds
		if(lednum > 9) lednum = 9;
		
		redC = fitTo255(redC); //fit our input to 0-255 range
		greenC = fitTo255(greenC);
		blueC = fitTo255(blueC);
		
		console.log("neo ring:" + lednum + " R:" + redC + " G:" + greenC + " B:" + blueC);//output result to console
		
		//our hid report to send to the circuit playground. Letter "O" tells it this is the neopixel ring command
        var report = {
            message: "O".charCodeAt(0),
            lednum: lednum,
            red: redC,
            green: greenC,
            blue: blueC
        };
        hPort.postMessage(report);
		
		window.setTimeout(function() {
			callback();
		},10);
    };
	
	//set all neopixels on the circuit playground
	ext.setRingLedAll = function (redC, greenC, blueC, callback) {
        
		
		redC = fitTo255(redC); //fit our input to 0-255 range
		greenC = fitTo255(greenC);
		blueC = fitTo255(blueC);
		
		console.log("neo ring all: R:" + redC + " G:" + greenC + " B:" + blueC);//output result to console
		
		//our hid report to send to the circuit playground. Letter "o" tells it this is the neopixel ring command
        var report = {
            message: "o".charCodeAt(0),
            lednum_f: 0,
			lednum_l: 9,
            red: redC,
            green: greenC,
            blue: blueC
        };
        hPort.postMessage(report);
		
		window.setTimeout(function() {
			callback();
		},10);
    };
	
	//set a row of neopixels on the neomatrix
	ext.setRowLed = function (lednum, redC, greenC, blueC, callback) {
        var realPort = 1 - 1; //convert from zero-indexed
        var portString = realPort.toString(); //convert to string
        lednum--;
		
		if(lednum < 0) lednum = 0;
		//if(lednum > 7) lednum = 7;
		
		redC = fitTo255(redC);
		greenC = fitTo255(greenC);
		blueC = fitTo255(blueC);
		
		console.log("neo row:" + lednum + " R:" + redC + " G:" + greenC + " B:" + blueC);
		
        var report = {
            message: "R".charCodeAt(0),
            lednum: lednum,
            red: redC,
            green: greenC,
            blue: blueC
        };
        hPort.postMessage(report);
		
		window.setTimeout(function() {
			callback();
		},10);
    };
	
	//set a column of neopixels on the neomatrix
	ext.setColLed = function (lednum, redC, greenC, blueC, callback) {
        var realPort = 1 - 1; //convert from zero-indexed
        var portString = realPort.toString(); //convert to string
        lednum--;
		
		if(lednum < 0) lednum = 0;
		//if(lednum > 4) lednum = 4;
		
		redC = fitTo255(redC);
		greenC = fitTo255(greenC);
		blueC = fitTo255(blueC);
		
		console.log("neo col:" + lednum + " R:" + redC + " G:" + greenC + " B:" + blueC);
		
        var report = {
            message: "C".charCodeAt(0),
            lednum: lednum,
            red: redC,
            green: greenC,
            blue: blueC
        };
        hPort.postMessage(report);
		
		window.setTimeout(function() {
			callback();
		},10);
    };
	
	//setup neomatrix tiling. Works with up to 4 matrices in any layout, 1x2, 2x1, 2x2, etc.
	ext.setMatrixConfig = function (tileX, tileY, callback) {
		
		console.log("neo matrix setup:" + tileX + " by:" + tileY);
		
        var report = {
            message: "D".charCodeAt(0),
            tile1: tileX,
            tile2: tileY
        };
        hPort.postMessage(report);
		
		window.setTimeout(function() {
			callback();
		},100);
    };
	
	//turn on or off all neopixels on the neomatrix
	ext.setFullLed = function (redC, greenC, blueC, callback) {
        var realPort = 1 - 1; //convert from zero-indexed
        var portString = realPort.toString(); //convert to string
		var lednum = 0;
        
		redC = fitTo255(redC);
		greenC = fitTo255(greenC);
		blueC = fitTo255(blueC);
		
		console.log("neo full matrix R:" + redC + " G:" + greenC + " B:" + blueC);
		
        var report = {
            message: "F".charCodeAt(0),
            lednum: lednum,
            red: redC,
            green: greenC,
            blue: blueC
        };
        hPort.postMessage(report);
		
		window.setTimeout(function() {
			callback();
		},10);
    };
	
	//set a neopixel on the neomatrix
	ext.setPixLed = function (lednumx, lednumy, redC, greenC, blueC, callback) {
        var realPort = 1 - 1; //convert from zero-indexed
        var portString = realPort.toString(); //convert to string
		var lednum = 0;
        lednumx--;
		lednumy--;
		
		if(lednumx < 0) lednumx = 0;
		//if(lednumx > 7) lednumx = 7;
		if(lednumy < 0) lednumy = 0;
		//if(lednumy > 4) lednumy = 4;
		
		redC = fitTo255(redC);
		greenC = fitTo255(greenC);
		blueC = fitTo255(blueC);
		
		console.log("neo pix:" + lednumx + "," + lednumy + " R:" + redC + " G:" + greenC + " B:" + blueC);
		
        var report = {
            message: "P".charCodeAt(0),
            lednumx: lednumx,
			lednumy: lednumy,
            red: redC,
            green: greenC,
            blue: blueC
        };
        hPort.postMessage(report);
		
		window.setTimeout(function() {
			callback();
		},10);
    };
	
	//print a 7 letter string to the neomatrix. need to use in conjunction with setMatrixCursor to scroll the text.
	ext.printMatrixString = function (word, callback) {
   	
		console.log("word: " + word);
		
        var report = {
            message: "p".charCodeAt(0),
            letter0: word.charCodeAt(0),
			letter1: word.charCodeAt(1),
			letter2: word.charCodeAt(2),
			letter3: word.charCodeAt(3),
			letter4: word.charCodeAt(4),
			letter5: word.charCodeAt(5),
			letter6: word.charCodeAt(6),
			letter7: word.charCodeAt(7),
			letter8: word.charCodeAt(8),
			letter9: word.charCodeAt(9),
			letter10: word.charCodeAt(10),
			letter11: word.charCodeAt(11),
			letter12: word.charCodeAt(12),
			letter13: word.charCodeAt(13),
			letter14: word.charCodeAt(14),
			letter15: word.charCodeAt(15),
        };
        hPort.postMessage(report);
		
		window.setTimeout(function() {
			callback();
		},10);
    };
	
	//set neomatrix print string text color
	ext.setMatrixTextColor = function (redC, greenC, blueC, callback) {
   	
		console.log("text color: " +  "R:" + redC + " G:" + greenC + " B:" + blueC );
		redC = fitTo255(redC);
		greenC = fitTo255(greenC);
		blueC = fitTo255(blueC);
		
        var report = {
            message: "T".charCodeAt(0),
			red: redC,
            green: greenC,
            blue: blueC
        };
        hPort.postMessage(report);
		
		window.setTimeout(function() {
			callback();
		},10);
    };
	
	//set neomatrix print string cursor. Use to scroll text across the screen
	ext.setMatrixCursor = function (cursorX, cursorY, callback) {

		var signX = 0;
		var signY = 0;
		
		if(cursorX < 0)
		{
			signX = 1;
			cursorX *= -1;
		}
		if(cursorY < 0)
		{
			signY = 1;
			cursorY *= -1;
		}

		console.log("cursor: " + cursorX + "," + cursorY + " signs: " + signX + "," + signY );

        var report = {
            message: "c".charCodeAt(0),
            cursorX: cursorX,
			cursorY: cursorY,
			signX: signX,
			signY: signY
        };
        hPort.postMessage(report);
		
		window.setTimeout(function() {
			callback();
		},10);
    };
	
	//set red led on the circuit playground
    ext.setLed = function (callback) {
      
		ledStatus ^= true;
		
        var report = {
            message: "L".charCodeAt(0),
            intensity: ledStatus
        };
        hPort.postMessage(report);
		
		window.setTimeout(function() {
			callback();
		},10);
    };
	
	//sound the buzzer on the circuit playground
	/*ext.setTone = function (tone) {
        //var realPort = portnum - 1;
        //var portString = realPort.toString();
        //var realIntensity = fitTo255(Math.floor(intensitynum * 2.55));
		var realPort = 1 - 1; //convert from zero-indexed
        var portString = realPort.toString(); //convert to string
		var led_set = 0;
		
        var report = {
            message: "P".charCodeAt(0),
			port: portString.charCodeAt(0),
            intensity: tone
        };
        hPort.postMessage(report);
    };*/
	
	//attaches/detaches servos. use before setting a servo angle. ports 9 & 10 on the circuit playground.
	ext.setupServo = function (serv, servo_num, callback) {
        //var realPort = portnum - 1; //convert to zero-indexed number
        //var portString = realPort.toString(); //convert to string
        var servo_setup = 1;
		//setup servos
		if(serv == 'Start')
		{
			servo_setup = 1;
		}
		else
		{
			servo_setup = 0;
		}
		console.log("Setup Servo: " + servo_setup + "  " + servo_num);
        var report = {
            message: "s".charCodeAt(0),
			servo_num: servo_num,
            servo_setup: servo_setup
        };
        hPort.postMessage(report);
		
		window.setTimeout(function() {
			callback();
		},100);
    };

	//sets the angle of a servo.
    ext.setServo = function (servo_num, ang, callback) {
        //var realPort = portnum - 1; //convert to zero-indexed number
        //var portString = realPort.toString(); //convert to string
		
		//set servo bounds
		if(ang < 5)
		{
			ang = 5;
		}
		if(ang > 175)
		{
			ang = 175;
		}
		console.log("Set Servo: " + servo_num + "  " + ang);
        var report = {
            message: "S".charCodeAt(0),
            servo_num: servo_num,
            angle: ang
        };
        hPort.postMessage(report);
		
		window.setTimeout(function() {
			callback();
		},10);
    };

    //getters for sensor information. port numbers as follows:
	/*Capsense x4	0-3
	Light			4
	Microphone		5
	Temperature		6
	Pushbutton x2	7,8
	Switch			9
	Acc x,y,z		10,11,12
	*/
    ext.getTemp = function (deg) {
        //returns board temperature 
		if(deg == '°F')
		{
			return sensorvalue[6];
		}
		else
		{
			return Math.round((sensorvalue[6]-32)*0.555);
		}
        
    };
	
	ext.getSound = function (port) {
        //returns microphone value
        return sensorvalue[5];
    };
	
	ext.getLight = function (port) {
        //returns light sensor value
		
		console.log("light: " + sensorvalue[4]);
        return sensorvalue[4];
    };
	
	ext.getPush = function (port) {
        //returns push button status
		if(port == 1)
		{
			return sensorvalue[7];
		}
		if(port == 2)
		{
			return sensorvalue[8];
		}
        
    };
	
	ext.getSwitch = function (port) {
        //returns switch status
        return sensorvalue[9];
    };
	
	ext.getAcc = function (axis) {
        //returns accelerometer values
		if(axis == 'x')
			return sensorvalue[10];
		else if(axis == 'y')
			return sensorvalue[11];
		else
			return sensorvalue[12];
    };

    ext.getRaw = function (port) {
        //gets raw sensor value for debugging
        return sensorvalue[port];
    };
	
	//get capsense reading. TODO: adjustable capsense threshold
	ext.getCap = function (port) {
        
		var cap1;
		if(port >= 0 && port <= 3)
		{
			cap1 = sensorvalue[port];
		}
		else
		{
			cap1 = 0;
		}
		 
        
		console.log("cap " + port + ": " + cap1);
		if(cap1 > 80)//capsense threshold. can be adjusted depending on environment.
		{
			return 1;
		}
		else
		{
			return 0;
		}
    };
	
	//get an analog reading on pins 9,10, or 12
	ext.getAnalog = function (port, a_type) {
		
		var analog_value;
		//check value on the port
		switch (port) {
			case 9:
				analog_value = sensorvalue[13];
				break;
			case 10:
				analog_value = sensorvalue[14];
				break;
			case 12:
				analog_value = sensorvalue[15];
				break;
			default:
				analog_value = 0;
		}
		
		if(a_type == 'volts')
		{
			analog_value *= 0.01294;//convert to 0 to 3.3v value
			analog_value = +analog_value.toFixed(2);
		}
		console.log("analog pin " + port + " val: " + analog_value);
		return analog_value;	
	};
	
	//map a 0-255 sensor value to a new range
	ext.mapVal = function(val, bMin, bMax) {
		var aMin = 0;
		var aMax = 255;

		var output = (((bMax - bMin) * (val - aMin)) / (aMax - aMin)) + bMin;
		return Math.round(output);
	};

    ext.hSpeak = function (phrase) {
        //uses Chrome text to speech API to speak the phrase
        var report = {message: "SPEAK", val: phrase};
        hPort.postMessage(report);
    };

    ext._shutdown = function () {
        //sends disconnect
        var report = {message: "R".charCodeAt(0)};
        hPort.postMessage(report);
    };

    ext.resetAll = function () {
        //sends reset to Circuit Playground. Not currently functional
        var report = {message: "X".charCodeAt(0)};
        hPort.postMessage(report);
    };

	//get circuit playground/scratch connection app status
    ext._getStatus = function () {
        var currStatus = hStatus;
        if (currStatus === 2)
            return {status: 2, msg: 'Connected'};
        else if (currStatus === 1)
            return {status: 1, msg: 'Circuit Playground Not Connected'};
        else
            return {status: 1, msg: 'Chrome App Not Connected'};
    };

	/*Capsense x4	0-3
	Light			4
	Microphone		5
	Temperature		6
	Pushbutton x2	7,8
	Switch			9 
	Acc x3			10,11,12
	*/
    var descriptor = {
        blocks: [
			['b', "Touch sensor %n touched?", "getCap", 0],
			['w', "Set Neopixel Ring %n to R:%n G:%n B:%n", "setRingLed", 1, 255, 0, 0],
			['w', "Set Full Neopixel Ring to R:%n G:%n B:%n", "setRingLedAll", 0, 0, 0],
			['w', "Set Neopixel Matrix Row %n to R:%n G:%n B:%n", "setRowLed", 1, 255, 0, 0],
			['w', "Set Neopixel Matrix Column %n to R:%n G:%n B:%n", "setColLed", 1, 0, 255, 0],
			['w', "Set Neopixel Matrix Pixel %n , %n to R:%n G:%n B:%n", "setPixLed", 1, 1, 0, 0, 255],
			['w', "Set Full Neopixel Matrix to R:%n G:%n B:%n", "setFullLed", 0, 0, 0],
			['w', "Print String on Neopixel Matrix: %s", "printMatrixString", "Embedit"],
			['w', "Set Neopixel Matrix Text Color: R:%n G:%n B:%n", "setMatrixTextColor", 255,0,0],
			['w', "Set Neopixel Matrix Cursor to %n, %n", "setMatrixCursor", 0,0],
			['w', "Setup Neopixel Matrix Tiling to %n by %n", "setMatrixConfig", 1, 1],
            ['w', "Toggle LED", "setLed"],
			['w', "%m.servo_s Servo %m.push_s", "setupServo", 'Start', 1],
            ['w', "Set Servo %m.push_s angle to %n", "setServo", 1, 90],
			['r', "Get Light Brightness", "getLight"],
            ['r', "Get Board Temperature in %m.temp_s", "getTemp", '°F'],
            ['r', "Get Microphone Loudness", "getSound"],
			['r', "Get Accelerometer %m.acc_s axis", "getAcc", 'x'],
			['r', "Read Analog pin %n in %m.analog_m", "getAnalog", 12, 'counts'],
			['b', "Pushbutton %m.push_s pushed?", "getPush", 1],
			['b', "Switch on?", "getSwitch"],
			['r', "Map value: %n to range %n - %n", "mapVal", 127, -180,180],
            ['r', "Debug value on port %n", "getRaw", 1]
        ],
        menus: {
            port: ['1', '2', '3', '4'],
			cap_s: [0,1,2,3],
			analog_s: [9,10,12],
			analog_m: ['counts', 'volts'],
			acc_s: ['x','y','z'],
			push_s: [1,2],
			debug_s: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,18,19,20,21,22,29,30,31,32],
            two: ['1', '2'],
			ten: [1,2,3,4,5,6,7,8,9,10],
			row_s: [1,2,3,4,5,6,7,8],
			col_s: [1,2,3,4,5],
			colors: ['Red','Green','Blue','Orange','Yellow','Violet', 'Teal','White', 'Off '],
			servo_s: ['Start','Stop'],
			coor_s: ['x','y'],
			temp_s: ['°F', '°C'],
			binary_s: ['On','Off']
        },
        url: 'https://www.embeditelectronics.com/blog/project/circuit-playground-scratch-blocks/#Advanced_Blocks'
    };
    getCircuitPlaygroundStatus();
    ScratchExtensions.register('Circuit Playground Adv', descriptor, ext);
})({});
