#ifndef SENSOR_HANDLER_H
#define SENSOR_HANDLER_H

#include <Arduino.h>
#include <WebServer.h>

void setupSensor();
void handleSensorRead(WebServer& server);

#endif
