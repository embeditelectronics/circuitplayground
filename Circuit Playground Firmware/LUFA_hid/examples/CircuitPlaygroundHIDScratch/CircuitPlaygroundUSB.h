/*
	Hummingbird Duo main header file, based on the Generic HID USB implementation of
	Dean Camera's LUFA Library.

	Copyright Tom Lauwers, 2014

	*/

/*
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


#ifndef _GENERICHID_H_
#define _GENERICHID_H_

	/* Includes: */
		#include <avr/io.h>
		#include <avr/wdt.h>
		#include <avr/power.h>
		#include <avr/interrupt.h>
		#include <string.h>

		#include "Descriptors.h"
		#include "AppConfig.h"

		#include <LUFA/Drivers/Board/LEDs.h>
		#include <LUFA/Drivers/USB/USB.h>
		#include <LUFA/Platform/Platform.h>

		/*#include <orb.h>
		#include <orb.c>
		#include <analog.h>
		#include <analog.c>
		#include <tinyComm.h>
		#include <tinyComm.c>
		#include <motor.h>
		#include <motor.c>
		#include <servo.h>
		#include <servo.c>
		#include <vbr.h>
		#include <vbr.c>
		#include <serial.h>
		#include <serial.c>*/

	/* Function Prototypes: */
	
		//extern struct HIDReportEcho;
		//extern struct OutGoingReport;

		#ifdef __cplusplus
		extern "C" {
		#endif
		
			//struct sendReportEcho(void);
		
			void SetupHardware(void);

			void EVENT_USB_Device_Connect(void);
			void EVENT_USB_Device_Disconnect(void);
			void EVENT_USB_Device_ConfigurationChanged(void);
			void EVENT_USB_Device_ControlRequest(void);
			void EVENT_USB_Device_StartOfFrame(void);

			bool CALLBACK_HID_Device_CreateHIDReport(USB_ClassInfo_HID_Device_t* const HIDInterfaceInfo,
													 uint8_t* const ReportID,
													 const uint8_t ReportType,
													 void* ReportData,
													 uint16_t* const ReportSize);
			void CALLBACK_HID_Device_ProcessHIDReport(USB_ClassInfo_HID_Device_t* const HIDInterfaceInfo,
													  const uint8_t ReportID,
													  const uint8_t ReportType,
													  const void* ReportData,
													  const uint16_t ReportSize);
	  /* Data Types: */
		extern USB_ClassInfo_HID_Device_t Generic_HID_Interface;
				/** Buffer to hold the previously generated HID report, for comparison purposes inside the HID class driver. */
		//extern static uint8_t PrevHIDReportBuffer[GENERIC_REPORT_SIZE];

		//hidreportecho variables
		extern uint8_t  echoReportID;
		extern uint16_t echoReportSize;
		extern uint8_t  echoReportData[GENERIC_REPORT_SIZE];
		
		//hidreportecho variables
		extern uint8_t  outReportID;
		extern uint16_t outReportSize;
		extern uint8_t  outReportData[GENERIC_REPORT_SIZE];
		
		
		
				//extern USB_ClassInfo_CDC_Device_t VirtualSerial2_CDC_Interface;
		#ifdef __cplusplus
		}
		#endif

#endif

