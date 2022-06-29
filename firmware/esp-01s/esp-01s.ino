#include <string>
#include <ArduinoUniqueID.h>
#include <ESP8266WiFi.h>
#include <WiFiClientSecure.h>

#include "ItemhubUtilities/ItemhubUtilities.h"
#include "ItemhubUtilities/Certs.h"

#ifndef STASSID
#define STASSID "{SSID}"
#define STAPSK "{WIFI_PASSWORD}"
#endif

#define SWITCH "SWITCH"
#define SENSOR "SENSOR"

const char *ssid = STASSID;
const char *password = STAPSK;
std::string host = "itemhub.io";
std::string remoteDeviceId;
std::string token;
std::string empty = "";
std::string postBody = "{\"clientId\":\"{CLIENT_ID}\",\"clientSecret\":\"{CLIENT_SECRET}\"}";
WiFiClientSecure client;
X509List ca(CA_PEM);
std::vector<ItemhubPin> pins;
const int intervalSensor = 30 * 1000;
const int intervalSwitch = 2000;
const int intervalDeviceState = 2000;

unsigned long currentSensorTimestamp;
unsigned long previousSensorTimestamp;
unsigned long currentSwitchTimestamp;
unsigned long previousSwitchTimestamp;
unsigned long currentDeviceStateTimestamp;
unsigned long previousDeviceStateTimestamp;

void setup()
{
  delay(5000);
  Serial.begin(115200);
  {PINS};

  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED)
  {
    delay(1000);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());

  // Set time via NTP, as required for x.509 validation
  configTime(3 * 60 * 60, 0, "pool.ntp.org", "time.nist.gov");
  Serial.print("Waiting for NTP time sync: ");
  time_t now = time(nullptr);
  while (now < 8 * 3600 * 2)
  {
    delay(500);
    Serial.print(".");
    now = time(nullptr);
  }

  struct tm timeinfo;
  gmtime_r(&now, &timeinfo);
  Serial.print("Current time: ");
  Serial.print(asctime(&timeinfo));

  client.setTimeout(15 * 1000);

  AuthResponse authResponse = ItemhubUtilities::Auth(client, ca, host, postBody);
  token = authResponse.token;
  remoteDeviceId = authResponse.remoteDeviceId;
  Serial.print("token: ");
  Serial.println(token.c_str());
}

void loop()
{
  // itemhub device state
  currentDeviceStateTimestamp = millis();
  if (currentDeviceStateTimestamp - previousDeviceStateTimestamp > intervalDeviceState)
  {
    previousDeviceStateTimestamp = currentDeviceStateTimestamp;
    ItemhubUtilities::Online(client, ca, host, remoteDeviceId, token);
  }

  // // itemhub switch
  currentSwitchTimestamp = millis();
  if (currentSwitchTimestamp - previousSwitchTimestamp > intervalSwitch)
  {
    previousSwitchTimestamp = currentSwitchTimestamp;
    ItemhubUtilities::CheckSwitchState(client, ca, host, token, remoteDeviceId, pins);
  }

  // // itemhub sensor
  currentSensorTimestamp = millis();
  if (currentSensorTimestamp - previousSensorTimestamp > intervalSensor)
  {
    previousSensorTimestamp = currentSensorTimestamp;
    for (int i = 0; i < pins.size(); i++)
    {
      std::string mode = pins[i].mode;
      if (mode == SENSOR)
      {
        int value = digitalRead(pins[i].pin);
        std::string valueString = std::to_string(value);
        pins[i].value = valueString;
      }
    }
    ItemhubUtilities::SendSensor(client, ca, host, token, remoteDeviceId, pins);
  }
}