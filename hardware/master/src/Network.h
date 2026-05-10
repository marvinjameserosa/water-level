#pragma once
#include <WiFi.h>
#include <WebServer.h>
#include "Battery.h"

class Network {
public:
    Network();
    
    void begin(Battery* battery);
    void handleClient();

private:
    WebServer server;
    Battery* _battery;

    // Internal setup functions
    void setupAP();
    void setupRoutes();
    
    // API Endpoints
    void handleState();   
    void handleOptions(); 
};