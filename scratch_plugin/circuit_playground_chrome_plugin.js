(function (ext) {
    var hummingbirdAppID = "lfloofocohhfeeoohpokmljiinfmpenj"; //unique app ID for Hummingbird Scratch App #todo: change to embedit circuit playground app
    //port connecting to chrome app
    var hPort;
    //connection status
    var hStatus = 0;
    //whether or not this is a dup
    var isDuo;
    //sensor info
    var sensorvalue = new Array(4);
    //when a new message is recieved, save all the info
    var onMsgCircuitPlayground = function (msg) {
        sensorvalue = msg;
    };
    function fitTo255(num) {
        return Math.max(Math.min(num,255.0),0.0);
    }
    //gets the connection status fo the circuit playground
    var getCircuitPlaygroundStatus = function () {
        console.log("status");
        chrome.runtime.sendMessage(hummingbirdAppID, {message: "STATUS"}, function (response) {
            if (response === undefined) { //Chrome app not found
                console.log("Chrome app not found");
                hStatus = 0;
                setTimeout(getCircuitPlaygroundStatus, 1000);
            }
            else if (response.status === false) { //Chrome app says not connected
                if (hStatus !== 1) {
                    console.log("Not connected");
                    hPort = chrome.runtime.connect(hummingbirdAppID);
                    hPort.onMessage.addListener(onMsgCircuitPlayground);
                }
                hStatus = 1;
                setTimeout(getCircuitPlaygroundStatus, 1000);
            }
            else {// successfully connected
                if (hStatus !==2) {
                    console.log("Connected");
                    isDuo = response.duo;
                    console.log("isDuo: " + isDuo);
                    hPort = chrome.runtime.connect(hummingbirdAppID);
                    hPort.onMessage.addListener(onMsgCircuitPlayground);
                }
                hStatus = 2;
                setTimeout(getCircuitPlaygroundStatus, 1000);
            }
        });
    };
    //all the below functions take in a portnum, it is assumed that the port
    //has the appropriate device connected to it. i.e. getDistance(1) assumes
    //a distance sensor is actually connected in port 1. If a different device
    //is connected the information received will not be useful.

    //setters for motors, LEDs, servos, and vibration
    ext.setHummingbirdMotor = function (portnum, velocity) {
        var realPort = portnum - 1; //convert from zero-indexed
        var portString = realPort.toString(); //convert to string
        var direction;
        if (velocity < 0) {
            direction = "1".charCodeAt(0);
            velocity = fitTo255(Math.floor(velocity * -2.55));
        }
        else {
            direction = "0".charCodeAt(0);
            velocity = fitTo255(Math.floor(velocity * 2.55));
        }
        var report = {
            message: "M".charCodeAt(0),
            port: portString.charCodeAt(0),
            dir: direction, //direction
            vel: velocity //speed
        };
        hPort.postMessage(report);
    };

    ext.setTriLed = function (portnum, rednum, greennum, bluenum) {
        var realPort = portnum - 1; //convert from zero-indexed
        //var portString = realPort.toString(); //convert to string
        var realRed = rednum;
        var realGreen = greennum;
        var realBlue = bluenum;
        var report = {
            message: "O".charCodeAt(0),
            port: realPort,
            red: realRed,
            green: realGreen,
            blue: realBlue
        };
        hPort.postMessage(report);
    };

    ext.setLed = function (b_switch) {
        //var realPort = portnum - 1;
        //var portString = realPort.toString();
        //var realIntensity = fitTo255(Math.floor(intensitynum * 2.55));
		var led_set = 0;
		if(b_switch == 'On') {
			led_set = 1;
		}
		else {
			led_set = 0;
		}
        var report = {
            message: "L".charCodeAt(0),
            led_s: led_set
        };
        hPort.postMessage(report);
    };

    ext.setServo = function (portnum, ang) {
        var realPort = portnum - 1; //convert to zero-indexed number
        var portString = realPort.toString(); //convert to string
        var realAngle = Math.max(Math.min((ang * 1.25), 225.0), 0.0);
        var report = {
            message: "S".charCodeAt(0),
            port: portString.charCodeAt(0),
            angle: realAngle
        };
        hPort.postMessage(report);
    };

    ext.setVibration = function (portnum, intensitynum) {
        var realPort = portnum - 1; //convert to zero-indexed number
        var portString = realPort.toString(); //convert to string
        var realIntensity = fitTo255(Math.floor(intensitynum * 2.55));
        var report = {
            message: "V".charCodeAt(0),
            port: portString.charCodeAt(0),
            intensity: realIntensity
        };
        hPort.postMessage(report);
    };

    //getters for sensor information

    ext.getTemp = function (port) {
        //returns temperature in Celsius degrees
        return Math.floor(((sensorvalue[port - 1] - 127) / 2.4 + 25) * 100 / 100);
    };

    ext.getDistance = function (port) {
      var reading, sensor_val_square,distance;
      if (isDuo){
          reading = sensorvalue[port - 1] * 4;
          if (reading < 130) {
              return 100;
          }
          else { //formula based on mathematical regression
              reading = reading - 120;
              if (reading > 680)
                  distance = 5.0;
              else {
                  sensor_val_square = reading * reading;
                  distance = sensor_val_square * sensor_val_square * reading * -0.000000000004789
                      + sensor_val_square * sensor_val_square * 0.000000010057143
                      - sensor_val_square * reading * 0.000008279033021
                      + sensor_val_square * 0.003416264518201
                      - reading * 0.756893112198934
                      + 90.707167605683000;
              }
              return parseInt(distance);
          }
      }
      else{
          reading = sensorvalue[port-1];
          if(reading < 23){
            return 80;
          }
          else { //formula based on mathematical regression
            sensor_val_square = reading * reading;
            distance =
                      206.76903754529479-9.3402257299483011*reading
                    + 0.19133513242939543*sensor_val_square
                    - 0.0019720997497951645*sensor_val_square * reading
                    + 9.9382154479167215*Math.pow(10, -6)*sensor_val_square*sensor_val_square
                    - 1.9442731496914311*Math.pow(10, -8)*sensor_val_square*sensor_val_square*reading;
            return parseInt(distance);
        }
      }
    };

    ext.getVolt = function (port) {
        //returns voltage 0-5V
        return Math.floor(100 * sensorvalue[port - 1] / 51.0) / 100;
    };

    ext.getSound = function (port) {
        //sound is already approximately on a 0-100 scale, so it does not need to be scaled
        return sensorvalue[port - 1];
    };

    ext.getRaw = function (port) {
        //converts to 0 to 100 scale
        return Math.floor(sensorvalue[port - 1] / 2.55);
    };

    ext.hSpeak = function (phrase) {
        //uses Chrome text to speech API to speak the phrase
        var report = {message: "SPEAK", val: phrase};
        hPort.postMessage(report);
    };

    ext._shutdown = function () {
        //sends disconnect to Hummingbird
        var report = {message: "R".charCodeAt(0)};
        hPort.postMessage(report);
    };

    ext.resetAll = function () {
        //sends reset to Hummingbird
        var report = {message: "X".charCodeAt(0)};
        hPort.postMessage(report);
    };

    ext._getStatus = function () {
        var currStatus = hStatus;
        if (currStatus === 2)
            return {status: 2, msg: 'Connected'};
        else if (currStatus === 1)
            return {status: 1, msg: 'Hummingbird Not Connected'};
        else
            return {status: 0, msg: 'Chrome App Not Connected'};
    };

    var descriptor = {
        blocks: [
            [' ', "Set LED %m.binary_s", "setLed", 'On'],
            [' ', "Set Servo %m.port , angle %n", "setServo", 1, 90],
            ['r', "Temperature on port %m.port", "getTemp", 1],
            ['r', "Sound on port %m.port", "getSound", 1],
            ['r', "Light sensor on port %m.port", "getRaw", 1],
			[' ', "Set Neopixel Ring %m.ten , R: %n G: %n B: %n", "setTriLed", 1, 0, 100, 0],
            ['r', "Voltage on port %m.port", "getVolt", 1]
        ],
        menus: {
            port: ['1', '2', '3', '4'],
            two: ['1', '2'],
			ten: [1,2,3,4,5,6,7,8,9,10],
			binary_s: ['On','Off']
        },
        url: 'http://www.embeditelectronics.com/blog/learn/'
    };
    getCircuitPlaygroundStatus();
    ScratchExtensions.register('Circuit Playground', descriptor, ext);
})({});