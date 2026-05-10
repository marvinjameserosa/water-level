#ifndef CAMERA_HANDLER_H
#define CAMERA_HANDLER_H

#include <Arduino.h>
#include <WebServer.h>

void setupCamera();
void handleCapture(WebServer& server);

#endif
