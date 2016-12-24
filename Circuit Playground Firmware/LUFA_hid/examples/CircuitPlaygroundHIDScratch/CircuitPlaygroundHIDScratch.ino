/**
 * You should have a LUFAConfig.h for this to work.
 */
#include "LUFAConfig.h"

/**
 * Include LUFA.h after LUFAConfig.h
 */
#include <LUFA.h>

/**
 * Finally include the LUFA device setup header
 */
//#include "DualVirtualSerial.h"

//#include "ArduinoSerial.h"

#include "CircuitPlaygroundUSB.h"

#include <Adafruit_CircuitPlayground.h>
#include <Adafruit_GFX.h>
#include <Adafruit_NeoMatrix.h>
#include <Adafruit_NeoPixel.h>
#include <Servo.h>


#define PIN 6
// we light one pixel at a time, this is our counter
uint8_t pixeln = 0;
uint8_t usb_data = 1;

//setup the neopixel shield. 8x5 array on pin 6
Adafruit_NeoMatrix matrix = Adafruit_NeoMatrix(5, 8, PIN,
  NEO_MATRIX_TOP     + NEO_MATRIX_RIGHT +
  NEO_MATRIX_COLUMNS + NEO_MATRIX_PROGRESSIVE,
  NEO_GRB            + NEO_KHZ800);

//extern "C" {struct HIDReportEcho;}
//extern "C" {struct OutGoingReport;}

//HIDReportEcho;
//		extern struct OutGoingReport;

Servo myservo1;  // create servo object to control a servo
Servo myservo2;  // create servo object to control a servo

void setup()
{
	SetupHardware(); // ask LUFA to setup the hardware

	GlobalInterruptEnable(); // enable global interrupts
	
	CircuitPlayground.begin();
	matrix.begin();
	matrix.setTextWrap(false);
	matrix.setBrightness(30);
	matrix.fillScreen(0);
	CircuitPlayground.setPixelColor(0,0,0,0);
	//myservo1.attach(9);  // attaches the servo on pin 9 to the servo object
	//myservo2.attach(10);  // attaches the servo on pin 10 to the servo object
}

//attach/detach servos on ports 9 and 10
void setupServo(uint8_t servo_num, uint8_t servo_setup)
{
	if(servo_num == 1)
	{
		if(servo_setup == 1)
		{
			myservo1.attach(9);
		}
		else
		{
			myservo1.detach();
		}
	}
	else
	{
		if(servo_setup == 1)
		{
			myservo2.attach(10);
		}
		else
		{
			myservo2.detach();
		}
	}
	
}

//set servo angle
void setServo(uint8_t servo_num, uint8_t servo_ang)
{	
	//myservo1.write(90);
	if(servo_num == 1)
	{
		myservo1.write(servo_ang);
	}
	else
	{
		myservo2.write(servo_ang);
	}
}

//draw rows or columns on the neopixel matrix
void drawNeoStrip(uint8_t strip, uint8_t pixel, uint16_t color)
{
	//draw row
	if(strip == 0)
	{
		for(int x = 0; x < 8; x++)
		{
			matrix.drawPixel(pixel,x,color);
		}
	}
	else //draw column
	{
		for(int x = 0; x < 5; x++)
		{
			matrix.drawPixel(x,pixel,color);
		}
	}
	matrix.show();
}


void loop()
{
	/*// test Red #13 LED
	CircuitPlayground.redLED(HIGH);
	delay(100);
	CircuitPlayground.redLED(LOW);
	delay(100);
	
	// TEST 10 NEOPIXELS
	CircuitPlayground.setPixelColor(pixeln++, CircuitPlayground.colorWheel(25 * pixeln));
	if (pixeln == 11) {
		pixeln = 0;
		CircuitPlayground.clearPixels();
	}*/
	// Necessary LUFA library calls that need be run periodically to check USB for data
	HID_Device_USBTask(&Generic_HID_Interface);
	USB_USBTask();
	usb_data = 1;
		// HID Reports are 8 bytes long. The first byte specifies the function of that report (set motors, get light sensor values, etc).
			switch(echoReportData[0]) {
				// If O, set an circuitplayground RGB LED using bytes 1-4 of the HID report
				case 'O':
					//CircuitPlayground.redLED(HIGH);
					//set_orb(HIDReportEcho.ReportData[1], HIDReportEcho.ReportData[2], HIDReportEcho.ReportData[3], HIDReportEcho.ReportData[4]);
					CircuitPlayground.setPixelColor(echoReportData[1],echoReportData[2],echoReportData[3],echoReportData[4]);
					break;
				// If 'P', draw a pixel on the neopixel matrix
				case 'P':
					matrix.drawPixel(echoReportData[2], echoReportData[1], matrix.Color(echoReportData[3],echoReportData[4],echoReportData[5]));
					matrix.show();
					//set_led(HIDReportEcho.ReportData[1], HIDReportEcho.ReportData[2]);
					break;
				// If 'R', draw a row on the neopixel matrix
				case 'R':
					drawNeoStrip(1, echoReportData[1], matrix.Color(echoReportData[2], echoReportData[3], echoReportData[4]));
					//set_motor(HIDReportEcho.ReportData[1]-48, HIDReportEcho.ReportData[2]-48, HIDReportEcho.ReportData[3]);
					break;
				// If 'C', draw a column on the neopixel matrix
				case 'C':
					drawNeoStrip(0, echoReportData[1], matrix.Color(echoReportData[2], echoReportData[3], echoReportData[4]));
					break;
				// If 'F', fill the neopixel matrix
				case 'F':
					matrix.fillScreen(matrix.Color(echoReportData[2], echoReportData[3], echoReportData[4]));
					matrix.show();
					//matrix.show();
					break;
				// If 'B', sound the buzzer
				case 'B':
					//outReportData[0] = CircuitPlayground.temperature();
					break;
				// If 'L', turn the circuitplayground led on/off
				case 'L':
					if(echoReportData[1] == 1)
						CircuitPlayground.redLED(HIGH);
					else
						CircuitPlayground.redLED(LOW);
					break;
				// If 'S', use bytes 1-2 to set servo position
				case 'S':
					//set_servo(HIDReportEcho.ReportData[1]-48, HIDReportEcho.ReportData[2]);
					setServo(echoReportData[1],echoReportData[2]);					
					break;
				// If 's', use bytes 1-2 to attach/detach servos
				case 's':
					setupServo(echoReportData[1],echoReportData[2]);
					break;
					
				case 'G':
					//request for sensor readings
					if(echoReportData[1] == '3') {
						/*Capsense x4	0-3
						Light			4
						Microphone		5
						Temperature		6
						Pushbutton x2	7,8
						Switch			9
						Acc x3			10,11,12
						*/
						outReportData[0] = CircuitPlayground.readCap(0);
						outReportData[1] = CircuitPlayground.readCap(1);
						outReportData[2] = CircuitPlayground.readCap(2);
						outReportData[3] = CircuitPlayground.readCap(3);
						outReportData[4] = map(CircuitPlayground.lightSensor(), 0, 1023, 0, 255);
						outReportData[5] = map(CircuitPlayground.soundSensor(), 0, 1023, 0, 255);
						outReportData[6] = CircuitPlayground.temperatureF();
						outReportData[7] = CircuitPlayground.leftButton();
						outReportData[8] = CircuitPlayground.rightButton();
						outReportData[9] = CircuitPlayground.slideSwitch();
						outReportData[10] = map(constrain(CircuitPlayground.motionX(),-9.8,9.8), -9.8,9.8, 0, 255);
						outReportData[11] = map(constrain(CircuitPlayground.motionY(),-9.8,9.8), -9.8,9.8, 0, 255);
						outReportData[12] = map(constrain(CircuitPlayground.motionZ(),-20.0,20.0), -20.0, 20.0, 0, 255);
						
						outReportData[18] = 0x03;
						//outReportData[19] = 0x01;
					}
					//request for board type
					if(echoReportData[1] == '4') {
						outReportData[0] = 0x03;
						outReportData[1] = 0x00;
					}
					
					break;
					
				// Returns an incrementing counter - used to measure cycle time and as a keep-alive.
				case 'z':
					/*OutGoingReport.ReportData[0] = count;
					count++;
					if(count > 255) {
						count = 0;
					}
					break;*/
				default:
					usb_data = 0;
					break;
			}
			// Only if there was valid data, set the last byte of the outgoing report, and reset the exit_count, max_count things
			if(usb_data == 1) {/*
				// Reset idle mode
				if(HIDReportEcho.ReportData[0] == 'R')
				{
					//activity_state = 0;
					exit_count = max_count+5;
				}
				else
					//activity_state = 1;
				*/
				echoReportData[0] = 0x00;
				// Sets last byte of outgoing report to last byte of incoming report so an outgoing report can be matched to its incoming request
				//outReportData[13] = echoReportData[13];
				outReportData[19]= echoReportData[19];
				//exit_count = 0;
				//max_count = 500000;
			}
}
