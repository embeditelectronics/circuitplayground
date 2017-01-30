(function (ext) {
    var embeditAppID = "dbhfnkcnljcbbpocflmbfcobkmagpgpf";
    //port connecting to chrome app
    var hPort;
    //connection status
    var hStatus = 0;
    var isDuo;
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

	
    //gets the connection status fo the circuit playground/scratch connection app
    var getCircuitPlaygroundStatus = function () {
        //console.log("status"); 
        chrome.runtime.sendMessage(embeditAppID, {message: "STATUS"}, function (response) {
            if (response === undefined) { //Chrome app not found
                console.log("Chrome app not found");
                hStatus = 0;
                setTimeout(getCircuitPlaygroundStatus, 100);
            }
            else if (response.status === false) { //Chrome app says not connected
                if (hStatus !== 1) {
                    console.log("Not connected");
                    hPort = chrome.runtime.connect(embeditAppID);
                    hPort.onMessage.addListener(onMsgCircuitPlayground);
                }
                hStatus = 1;
                setTimeout(getCircuitPlaygroundStatus, 100);
            }
            else {// successfully connected
                if (hStatus !==2) {
                    console.log("Connected");
                    isDuo = response.duo;
                    console.log("isDuo: " + isDuo);
                    hPort = chrome.runtime.connect(embeditAppID);
                    hPort.onMessage.addListener(onMsgCircuitPlayground);
                }
                hStatus = 2;
                setTimeout(getCircuitPlaygroundStatus, 100);
            }
        });
    };
	
	//set a neopixel on the circuit playground
	ext.setRingLed = function (lednum, color, callback) {
        var realPort = 1 - 1; //convert from zero-indexed
        var portString = realPort.toString(); //convert to string
        var realRed = 0;
        var realGreen = 0;
        var realBlue = 0;
		lednum = lednum - 1;
		//'Red','Green','Blue','Orange','Yellow','Violet','White', 'Off'
		switch(color) {
			case "Red":
				realRed = 255;
				break;
			case "Green":
				realGreen = 255;
				break;
			case "Blue":
				realBlue = 255;
				break;
			case "Orange":
				realRed = 255;
				realGreen = 153;
				break;
			case "Yellow":
				realRed = 255;
				realGreen = 255;
				break;
			case "Violet":
				realRed = 153;
				realBlue = 153;
				break;
			case "Teal":
				realGreen = 255;
				realBlue = 255;
				break;
			case "White":
				realRed = 255;
				realGreen = 255;
				realBlue = 255;
				break;
			default:
				realRed = 0;
		}
		
        var report = {
            message: "O".charCodeAt(0),
            lednum: lednum,
            red: realRed,
            green: realGreen,
            blue: realBlue
        };
        hPort.postMessage(report);
		
		window.setTimeout(function() {
			callback();
		},10);
    };
	
	//set a row of neopixels on the neomatrix
	ext.setRowLed = function (lednum, color, callback) {
        var realPort = 1 - 1; //convert from zero-indexed
        var portString = realPort.toString(); //convert to string
		lednum = lednum - 1;
        var realRed = 0;
        var realGreen = 0;
        var realBlue = 0;
		//'Red','Green','Blue','Orange','Yellow','Violet','White', 'Off'
		switch(color) {
			case "Red":
				realRed = 255;
				break;
			case "Green":
				realGreen = 255;
				break;
			case "Blue":
				realBlue = 255;
				break;
			case "Orange":
				realRed = 255;
				realGreen = 153;
				break;
			case "Yellow":
				realRed = 255;
				realGreen = 255;
				break;
			case "Violet":
				realRed = 153;
				realBlue = 153;
				break;
			case "Teal":
				realGreen = 255;
				realBlue = 255;
				break;
			case "White":
				realRed = 255;
				realGreen = 255;
				realBlue = 255;
				break;
			default:
				realRed = 0;
		}
		
        var report = {
            message: "R".charCodeAt(0),
            lednum: lednum,
            red: realRed,
            green: realGreen,
            blue: realBlue
        };
        hPort.postMessage(report);
		
		window.setTimeout(function() {
			callback();
		},10);
    };
	
	//set a column of neopixels on the neomatrix
	ext.setColLed = function (lednum, color, callback) {
        var realPort = 1 - 1; //convert from zero-indexed
        var portString = realPort.toString(); //convert to string
		lednum = lednum - 1;
        var realRed = 0;
        var realGreen = 0;
        var realBlue = 0;
		//'Red','Green','Blue','Orange','Yellow','Violet','White', 'Off'
		switch(color) {
			case "Red":
				realRed = 255;
				break;
			case "Green":
				realGreen = 255;
				break;
			case "Blue":
				realBlue = 255;
				break;
			case "Orange":
				realRed = 255;
				realGreen = 153;
				break;
			case "Yellow":
				realRed = 255;
				realGreen = 255;
				break;
			case "Violet":
				realRed = 153;
				realBlue = 153;
				break;
			case "Teal":
				realGreen = 255;
				realBlue = 255;
				break;
			case "White":
				realRed = 255;
				realGreen = 255;
				realBlue = 255;
				break;
			default:
				realRed = 0;
		}
		
        var report = {
            message: "C".charCodeAt(0),
            lednum: lednum,
            red: realRed,
            green: realGreen,
            blue: realBlue
        };
        hPort.postMessage(report);
		
		window.setTimeout(function() {
			callback();
		},10);
    };
	
	//turn on or off all neopixels on the neomatrix
	ext.setFullLed = function (color, callback) {
        var realPort = 1 - 1; //convert from zero-indexed
        var portString = realPort.toString(); //convert to string
		var lednum = 1;
        var realRed = 0;
        var realGreen = 0;
        var realBlue = 0;
		//'Red','Green','Blue','Orange','Yellow','Violet','White', 'Off'
		switch(color) {
			case "Red":
				realRed = 255;
				break;
			case "Green":
				realGreen = 255;
				break;
			case "Blue":
				realBlue = 255;
				break;
			case "Orange":
				realRed = 255;
				realGreen = 153;
				break;
			case "Yellow":
				realRed = 255;
				realGreen = 255;
				break;
			case "Violet":
				realRed = 153;
				realBlue = 153;
				break;
			case "Teal":
				realGreen = 255;
				realBlue = 255;
				break;
			case "White":
				realRed = 255;
				realGreen = 255;
				realBlue = 255;
				break;
			default:
				realRed = 0;
		}
		
        var report = {
            message: "F".charCodeAt(0),
            lednum: lednum,
            red: realRed,
            green: realGreen,
            blue: realBlue
        };
        hPort.postMessage(report);
		
		window.setTimeout(function() {
			callback();
		},10);
    };
	
	//set a neopixel on the neomatrix
	ext.setPixLed = function (lednumx, lednumy, color, callback) {
        var realPort = 1 - 1; //convert from zero-indexed
        var portString = realPort.toString(); //convert to string
        var realRed = 0;
        var realGreen = 0;
        var realBlue = 0;
		lednumx = lednumx - 1;
		lednumy = lednumy - 1;
		//'Red','Green','Blue','Orange','Yellow','Violet','White', 'Off'
		switch(color) {
			case "Red":
				realRed = 255;
				break;
			case "Green":
				realGreen = 255;
				break;
			case "Blue":
				realBlue = 255;
				break;
			case "Orange":
				realRed = 255;
				realGreen = 153;
				break;
			case "Yellow":
				realRed = 255;
				realGreen = 255;
				break;
			case "Violet":
				realRed = 153;
				realBlue = 153;
				break;
			case "Teal":
				realGreen = 255;
				realBlue = 255;
				break;
			case "White":
				realRed = 255;
				realGreen = 255;
				realBlue = 255;
				break;
			default:
				realRed = 0;
		}
		
        var report = {
            message: "P".charCodeAt(0),
            lednumx: lednumx,
			lednumy: lednumy,
            red: realRed,
            green: realGreen,
            blue: realBlue
        };
        hPort.postMessage(report);
		
		window.setTimeout(function() {
			callback();
		},10);
    };
	
	//set red led on the circuit playground
    ext.setLed = function (b_switch, callback) {
        //var realPort = portnum - 1;
        //var portString = realPort.toString();
        //var realIntensity = fitTo255(Math.floor(intensitynum * 2.55));
		//var realPort = 1 - 1; //convert from zero-indexed
        //var portString = realPort.toString(); //convert to string
		var led_set = 0;
		if(b_switch == 'On') {
			led_set = 1;
		}
		else {
			led_set = 0;
		}
        var report = {
            message: "L".charCodeAt(0),
            intensity: led_set
        };
        hPort.postMessage(report);
		
		window.setTimeout(function() {
			callback();
		},10);
    };
	
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
	Acc x3			10,11,12
	*/
    ext.getTemp = function (deg) {
        //returns temperature in Celsius degrees
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
        
        var cap1 = sensorvalue[port];
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
			['b', "Touch sensor %m.cap_s touched?", "getCap", 0],
			['w', "Set Neopixel Ring %m.ten to %m.colors", "setRingLed", '1', 'Red'],
			['w', "Set Neopixel Matrix Row %m.row_s to %m.colors", "setRowLed", 1, 'Red'],
			['w', "Set Neopixel Matrix Column %m.col_s to %m.colors", "setColLed", 1, 'Green'],
			['w', "Set Neopixel Matrix Pixel %m.row_s %m.col_s to %m.colors", "setPixLed", 1, 1, 'Blue'],
			['w', "Set Full Neopixel Matrix to %m.colors", "setFullLed", 'Off'],
            ['w', "Turn LED %m.binary_s", "setLed", 'On'],
			['w', "%m.servo_s Servo %m.push_s", "setupServo", 'Start', 1],
            ['w', "Set Servo %m.push_s angle to %n", "setServo", 1, 90],
			['r', "Get Light Brightness", "getLight"],
            ['r', "Get Board Temperature in %m.temp_s", "getTemp", '°F'],
            ['r', "Get Microphone Loudness", "getSound"],
			['r', "Get Accelerometer %m.acc_s axis", "getAcc", 'x'],
			['b', "Pushbutton %m.push_s pushed?", "getPush", 1],
			['b', "Switch on?", "getSwitch"],
			['r', "Map value: %n to range %n - %n", "mapVal", 127, -180,180]
        ],
        menus: {
            port: ['1', '2', '3', '4'],
			cap_s: [0,1,2,3],
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
        url: 'http://www.embeditelectronics.com/blog/learn/'
    };
    getCircuitPlaygroundStatus();
    ScratchExtensions.register('Circuit Playground', descriptor, ext);
})({});
