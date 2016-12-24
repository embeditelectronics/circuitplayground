/*
	Hummingbird Duo's main program, based on the Generic HID USB implementation of
	Dean Camera's LUFA Library.

	This file initializes Hummingbird Duo, communicates with the USB host, and
	specifies the USB protocol as well as what Hummingbird does in case of
	host power-down.

	Copyright Tom Lauwers, 2014

	*/
/*
  LUFA Library Copyright statement:
  Copyright 2013  Dean Camera (dean [at] fourwalledcubicle [dot] com)

  Permission to use, copy, modify, distribute, and sell this
  software and its documentation for any purpose is hereby granted
  without fee, provided that the above copyright notice appear in
  all copies and that both that the copyright notice and this
  permission notice and warranty disclaimer appear in supporting
  documentation, and that the name of the author not be used in
  advertising or publicity pertaining to distribution of the
  software without specific, written prior permission.

  The author disclaims all warranties with regard to this
  software, including all implied warranties of merchantability
  and fitness.  In no event shall the author be liable for any
  special, indirect or consequential damages or any damages
  whatsoever resulting from loss of use, data or profits, whether
  in an action of contract, negligence or other tortious action,
  arising out of or in connection with the use or performance of
  this software.
*/

#include "CircuitPlaygroundUSB.h"

/** Buffer to hold the previously generated HID report, for comparison purposes inside the HID class driver. */
static uint8_t PrevHIDReportBuffer[GENERIC_REPORT_SIZE];

//extern replacements for echo report struct
uint8_t  echoReportID;
uint16_t echoReportSize;
uint8_t  echoReportData[GENERIC_REPORT_SIZE];

/** Structure to contain reports from the host, so that they can be echoed back upon request */
struct
{
	uint8_t  ReportID;
	uint16_t ReportSize;
	uint8_t  ReportData[GENERIC_REPORT_SIZE];
} HIDReportEcho;

//extern replacements for outgoing report struct
uint8_t  outReportID;
uint16_t outReportSize;
uint8_t  outReportData[GENERIC_REPORT_SIZE];

/** Structure to contain outgoing reports from the device */
struct
{
	uint8_t  ReportID;
	uint16_t ReportSize;
	uint8_t  ReportData[GENERIC_REPORT_SIZE];
} OutGoingReport;



/** LUFA HID Class driver interface configuration and state information. This structure is
 *  passed to all HID Class driver functions, so that multiple instances of the same class
 *  within a device can be differentiated from one another.
 */
USB_ClassInfo_HID_Device_t Generic_HID_Interface =
	{
		.Config =
			{
				.InterfaceNumber              = 0,
				.ReportINEndpoint             =
					{
						.Address              = GENERIC_IN_EPADDR,
						.Size                 = GENERIC_EPSIZE,
						.Banks                = 1,
					},
				.PrevReportINBuffer           = PrevHIDReportBuffer,
				.PrevReportINBufferSize       = sizeof(PrevHIDReportBuffer),
			},
	};

#define MAJOR_FIRMWARE_VERSION 0x02
#define MINOR_FIRMWARE_VERSION 0x01
#define MINOR_FIRMWARE_VERSION2 'h'

/** Main program entry point. This routine contains the overall program flow, including initial
 *  setup of all components and the main program loop.
 */
/*int main(void)
{
	int count = 0; // Counter variable
	char serial_data[8]; // Buffer to hold serial commands send over TTL serial port

	// Counter to set a time-out after which Hummingbird reverts to idle state (indicated by status LED fading on and off)
	unsigned long int exit_count = 0;
	unsigned long int max_count = 500000;
	uint8_t timeout = 0;
	char usb_data; // Flag that marks if usb_data is received

	SetupHardware();

	GlobalInterruptEnable();

	for (;;)
	{
		// Necessary LUFA library calls that need be run periodically to check USB for data
		HID_Device_USBTask(&Generic_HID_Interface);
		USB_USBTask();

		// If we reach an idle timer count of 500,000 (in USB mode) or 5 million (in serial mode), ~5 (or 50) seconds has elapsed and we turn everything off and go back to idle mode
		if(exit_count == max_count && exit_count <= max_count+5) {
			turn_off_motors();
			turn_off_leds();
			disable_servos();
			disable_vibration_motors();
			activity_state = 0; // Idle mode flag
			exit_count++;
		}
		// Otherwise count up!
		else if(exit_count < max_count) {
			exit_count++;
		}

		// Check if we've received data over serial, this is experimental
		if(received_data_available()!=0)
		{
			max_count = 5000000; // Set the time out to 5,000,000, so now we time out in 50 seconds instead of 5
			serial_data[0] = receive_char();
			switch(serial_data[0]) {
				// If O, set an RGB LED using 4 bytes of serial data
				case 'O':
				activity_state=1;
				for(int t = 1; t < 5; t++)
				{
					timeout = 0;
					// Wait up to 500ms for the next byte
					while(!received_data_available() && timeout < 250) {
						_delay_ms(2);
						timeout++;
					}
					if(timeout >= 250)
						break;
					serial_data[t] = receive_char();
				}
				if(timeout < 250) {
					set_orb(serial_data[1], serial_data[2], serial_data[3], serial_data[4]);
					exit_count = 0;  // Reset time-out counter
				}
				break;
				// If 'L', set an LED's intensity with 2 bytes of serial data
				case 'L':
				activity_state=1;
				for(int t = 1; t < 3; t++)
				{
					timeout = 0;
					while(!received_data_available() && timeout < 250) {
						_delay_ms(2);
						timeout++;
					}
					if(timeout >= 250)
					break;
					serial_data[t] = receive_char();
				}
				if(timeout < 250) {
					set_led(serial_data[1], serial_data[2]);
					exit_count = 0;  // Reset time-out counter
				}
				break;
				// If 'M', use bytes 1-3 to set motor speed and direction
				case 'M':
				activity_state=1;
				for(int t = 1; t < 4; t++)
				{
					timeout = 0;
					while(!received_data_available() && timeout < 250) {
						_delay_ms(2);
						timeout++;
					}
					if(timeout >= 250)
					break;
					serial_data[t] = receive_char();
				}
				if(timeout < 250) {
					set_motor(serial_data[1]-48, serial_data[2]-48, serial_data[3]);
					exit_count = 0;  // Reset time-out counter
				}
				break;
				// If 'V', use bytes 1-2 to set vibration motor intensity
				case 'V':
				activity_state=1;
				for(int t = 1; t < 3; t++)
				{
					timeout = 0;
					while(!received_data_available() && timeout < 250) {
						_delay_ms(2);
						timeout++;
					}
					if(timeout >= 250)
					break;
					serial_data[t] = receive_char();
				}
				if(timeout < 250) {
					set_vibration_motor(serial_data[1], serial_data[2]);
					exit_count = 0;
				}
				break;
				// If 'S', use bytes 1-2 to set servo position
				case 'S':
				activity_state=1;
				for(int t = 1; t < 3; t++)
				{
					timeout = 0;
					while(!received_data_available() && timeout < 250) {
						_delay_ms(2);
						timeout++;
					}
					if(timeout >= 250)
					break;
					serial_data[t] = receive_char();
				}
				if(timeout < 250) {
					set_servo(serial_data[1]-48, serial_data[2]);
					exit_count = 0;
				}
				break;
				// If 's', return sensor values of the selected sensor port
				case 's':
				activity_state=1;
				while(!received_data_available() && timeout < 250) {
					_delay_ms(2);
					timeout++;
				}
				if(timeout < 250)
				{
					serial_data[1] = receive_char();
					if(serial_data[1]=='0')
					{
						send_char(read_sensor(SENSOR1));
					}
					else if(serial_data[1]=='1')
					{
						send_char(read_sensor(SENSOR2));
					}
					else if(serial_data[1]=='2')
					{
						send_char(read_sensor(SENSOR3));
					}
					else if(serial_data[1]=='3')
					{
						send_char(read_sensor(SENSOR4));
					}
					else if(serial_data[1]=='4')
					{
						send_char(read_sensor(EXT_PWR));
					}
					exit_count = 0;
				}
				break;
				// Fast way to turn everything off
				case 'X':
				activity_state=1;
				turn_off_motors();
				turn_off_leds();
				disable_servos();
				disable_vibration_motors();
				exit_count = 0;
				break;
				// Fast way to turn everything off AND go to idle state
				case 'R':
				activity_state=0; // idle mode flag
				turn_off_motors();
				turn_off_leds();
				disable_servos();
				disable_vibration_motors();
				exit_count = 0;
				break;
				case 'G':
				activity_state=1;
				while(!received_data_available() && timeout < 250) {
					_delay_ms(2);
					timeout++;
				}
				// If you didn't timeout, provide the requested data
				if(timeout < 250)
				{
					serial_data[1] = receive_char();
					if(serial_data[1] == '0') {
						for(int i = 0; i < 7; i++) {
							send_char(led_values_temp[i]);
						}
					}
					else if(serial_data[1] == '1') {
						for(int i = 7; i < 10; i++) {
							send_char(led_values_temp[i]);
						}
						for(int i = 0; i < 4; i++) {
							send_char(servo_values_temp[i]);
						}
					}
					else if(serial_data[1] == '2') {
						for(int i = 0; i < 4; i++) {
							send_char(motor_vals[i]);
						}
						send_char(vbr_values_temp[0]);
						send_char(vbr_values_temp[1]);
					}
					else if(serial_data[1] == '3') {
						send_char(read_sensor(SENSOR1));
						send_char(read_sensor(SENSOR2));
						send_char(read_sensor(SENSOR3));
						send_char(read_sensor(SENSOR4));
						send_char(read_sensor(EXT_PWR));

					}
					// Returns hardware/firmware version
					else if(serial_data[1] == '4') {
						// hardware version
						send_char(0x03);
						send_char(0x00);
						// firmware version
						send_char(MAJOR_FIRMWARE_VERSION);
						send_char(MINOR_FIRMWARE_VERSION);
						send_char(MINOR_FIRMWARE_VERSION2);
						}
						exit_count = 0;
				}
				break;
				// Returns an incrementing counter - used to measure cycle time and as a keep-alive.
				case 'z':
					activity_state=1;
					send_char(count);
					count++;
					if(count > 255) {
						count = 0;
					}
					exit_count = 0;
				break;

				default:
				break;
			}
		}
		else
		{
			usb_data = 1;
		// HID Reports are 8 bytes long. The first byte specifies the function of that report (set motors, get light sensor values, etc).
			switch(HIDReportEcho.ReportData[0]) {
				// If O, set an RGB LED using bytes 1-4 of the HID report
				case 'O':
					set_orb(HIDReportEcho.ReportData[1], HIDReportEcho.ReportData[2], HIDReportEcho.ReportData[3], HIDReportEcho.ReportData[4]);
					break;
				// If 'L', set an LED's intensity with bytes 1-2 of the HID report
				case 'L':
					set_led(HIDReportEcho.ReportData[1], HIDReportEcho.ReportData[2]);
					break;
				// If 'M', use bytes 1-3 to set motor speed and direction
				case 'M':
					set_motor(HIDReportEcho.ReportData[1]-48, HIDReportEcho.ReportData[2]-48, HIDReportEcho.ReportData[3]);
					break;
				// If 'V', use bytes 1-2 to set vibration motor intensity
				case 'V':
					set_vibration_motor(HIDReportEcho.ReportData[1], HIDReportEcho.ReportData[2]);
					break;
				// If 'S', use bytes 1-2 to set servo position
				case 'S':
					set_servo(HIDReportEcho.ReportData[1]-48, HIDReportEcho.ReportData[2]);
					break;
				// If 's', return sensor values of the selected sensor port
				case 's':
					if(HIDReportEcho.ReportData[1]=='0')
					{
						OutGoingReport.ReportData[0] = read_sensor(SENSOR1);
					}
					else if(HIDReportEcho.ReportData[1]=='1')
					{
						OutGoingReport.ReportData[0] = read_sensor(SENSOR2);
					}
					else if(HIDReportEcho.ReportData[1]=='2')
					{
						OutGoingReport.ReportData[0] = read_sensor(SENSOR3);
					}
					else if(HIDReportEcho.ReportData[1]=='3')
					{
						OutGoingReport.ReportData[0] = read_sensor(SENSOR4);
					}
					else if(HIDReportEcho.ReportData[1]=='4')
					{
						OutGoingReport.ReportData[0] = read_sensor(EXT_PWR);
					}

					break;
				// Fast way to turn everything off
				case 'X':
					turn_off_motors();
					turn_off_leds();
					disable_servos();
					disable_vibration_motors();
					break;
				// Fast way to turn everything off AND go to idle state
				case 'R':
					turn_off_motors();
					turn_off_leds();
					disable_servos();
					disable_vibration_motors();
					// Turn off everything
					break;
				case 'G':
					if(HIDReportEcho.ReportData[1] == '0') {
						for(int i = 0; i < 7; i++) {
							OutGoingReport.ReportData[i] = led_values_temp[i];
						}
					}
					else if(HIDReportEcho.ReportData[1] == '1') {
						for(int i = 7; i < 10; i++) {
							OutGoingReport.ReportData[i-7] = led_values_temp[i];
						}
						for(int i = 0; i < 4; i++) {
							OutGoingReport.ReportData[i+3] = servo_values_temp[i];
						}
					}
					else if(HIDReportEcho.ReportData[1] == '2') {
						for(int i = 0; i < 4; i++) {
							OutGoingReport.ReportData[i] = motor_vals[i];
						}
						OutGoingReport.ReportData[4] = vbr_values_temp[0];
						OutGoingReport.ReportData[5] = vbr_values_temp[1];
					}
					else if(HIDReportEcho.ReportData[1] == '3') {
						OutGoingReport.ReportData[0] = read_sensor(SENSOR1);
						OutGoingReport.ReportData[1] = read_sensor(SENSOR2);
						OutGoingReport.ReportData[2] = read_sensor(SENSOR3);
						OutGoingReport.ReportData[3] = read_sensor(SENSOR4);
						OutGoingReport.ReportData[4] = read_sensor(EXT_PWR);

					}
					// Returns hardware/firmware version
					else if(HIDReportEcho.ReportData[1] == '4') {
						// hardware version
						OutGoingReport.ReportData[0] = 3;
						OutGoingReport.ReportData[1] = 0;
						// firmware version
						OutGoingReport.ReportData[2] = MAJOR_FIRMWARE_VERSION;
						OutGoingReport.ReportData[3] = MINOR_FIRMWARE_VERSION;
						OutGoingReport.ReportData[4] = MINOR_FIRMWARE_VERSION2;

					}
					break;
				// Returns an incrementing counter - used to measure cycle time and as a keep-alive.
				case 'z':
					OutGoingReport.ReportData[0] = count;
					count++;
					if(count > 255) {
						count = 0;
					}
					break;
				default:
					usb_data = 0;
					break;
			}
			// Only if there was valid data, set the last byte of the outgoing report, and reset the exit_count, max_count things
			if(usb_data == 1) {
				// Reset idle mode
				if(HIDReportEcho.ReportData[0] == 'R')
				{
					activity_state = 0;
					exit_count = max_count+5;
				}
				else
					activity_state = 1;
				HIDReportEcho.ReportData[0] = 0x00;
				// Sets last byte of outgoing report to last byte of incoming report so an outgoing report can be matched to its incoming request
				OutGoingReport.ReportData[7]= HIDReportEcho.ReportData[7];
				exit_count = 0;
				max_count = 500000;
			}

		}
	}
}*/

/** Configures the board hardware and chip peripherals for the demo's functionality. */
void SetupHardware(void)
{
	/* Disable watchdog if enabled by bootloader/fuses */
	MCUSR &= ~(1 << WDRF);
	wdt_disable();

	/* Disable clock division */
	clock_prescale_set(clock_div_1);

	/* Hardware Initialization */
	/*LEDs_Init();
	init_analog();
	init_orb();
	init_vbr();
	init_tiny_comm();
	
	serial_init();*/
	USB_Init();
}

/** Event handler for the library USB Connection event. */
void EVENT_USB_Device_Connect(void)
{

}

/** Event handler for the library USB Disconnection event. */
void EVENT_USB_Device_Disconnect(void)
{
	//activity_state=0;
	/*turn_off_motors();
	turn_off_leds();
	disable_servos();
	disable_vibration_motors();*/
}

/** Event handler for the library USB Configuration Changed event. */
void EVENT_USB_Device_ConfigurationChanged(void)
{
	bool ConfigSuccess = true;

	ConfigSuccess &= HID_Device_ConfigureEndpoints(&Generic_HID_Interface);

	USB_Device_EnableSOFEvents();

}

/** Event handler for the library USB Control Request reception event. */
void EVENT_USB_Device_ControlRequest(void)
{
	HID_Device_ProcessControlRequest(&Generic_HID_Interface);
}

/** Event handler for the USB device Start Of Frame event. */
void EVENT_USB_Device_StartOfFrame(void)
{
	HID_Device_MillisecondElapsed(&Generic_HID_Interface);
}

/** HID class driver callback function for the creation of HID reports to the host.
 *
 *  \param[in]     HIDInterfaceInfo  Pointer to the HID class interface configuration structure being referenced
 *  \param[in,out] ReportID    Report ID requested by the host if non-zero, otherwise callback should set to the generated report ID
 *  \param[in]     ReportType  Type of the report to create, either HID_REPORT_ITEM_In or HID_REPORT_ITEM_Feature
 *  \param[out]    ReportData  Pointer to a buffer where the created report should be stored
 *  \param[out]    ReportSize  Number of bytes written in the report (or zero if no report is to be sent)
 *
 *  \return Boolean \c true to force the sending of the report, \c false to let the library determine if it needs to be sent
 */
bool CALLBACK_HID_Device_CreateHIDReport(USB_ClassInfo_HID_Device_t* const HIDInterfaceInfo,
                                         uint8_t* const ReportID,
                                         const uint8_t ReportType,
                                         void* ReportData,
                                         uint16_t* const ReportSize)
{
	if (OutGoingReport.ReportID)
	  *ReportID = OutGoingReport.ReportID;

	//memcpy(ReportData, OutGoingReport.ReportData, OutGoingReport.ReportSize);
	memcpy(ReportData, outReportData, OutGoingReport.ReportSize);
	

	*ReportSize = OutGoingReport.ReportSize;
	return false;
}

/** HID class driver callback function for the processing of HID reports from the host.
 *
 *  \param[in] HIDInterfaceInfo  Pointer to the HID class interface configuration structure being referenced
 *  \param[in] ReportID    Report ID of the received report from the host
 *  \param[in] ReportType  The type of report that the host has sent, either HID_REPORT_ITEM_Out or HID_REPORT_ITEM_Feature
 *  \param[in] ReportData  Pointer to a buffer where the received report has been stored
 *  \param[in] ReportSize  Size in bytes of the received HID report
 */
void CALLBACK_HID_Device_ProcessHIDReport(USB_ClassInfo_HID_Device_t* const HIDInterfaceInfo,
                                          const uint8_t ReportID,
                                          const uint8_t ReportType,
                                          const void* ReportData,
                                          const uint16_t ReportSize)
{
	HIDReportEcho.ReportID   = ReportID;
	OutGoingReport.ReportID   = ReportID;
	
	outReportID = ReportID;
	outReportSize = ReportSize;

	HIDReportEcho.ReportSize = ReportSize;
	OutGoingReport.ReportSize = ReportSize;
	memcpy(HIDReportEcho.ReportData, ReportData, ReportSize);
	
	echoReportID = ReportID;
	echoReportSize = ReportSize;
	memcpy(echoReportData, ReportData, ReportSize);
	 
}

