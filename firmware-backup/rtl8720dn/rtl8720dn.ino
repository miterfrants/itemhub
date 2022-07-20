#include <WiFi.h>
#undef max
#undef min

#include <vector>
#include <string>

#include "ItemhubUtilities/ItemhubUtilities.h"
#include "ItemhubUtilities/Certs.h"

const int intervalSensor = 30 * 1000;
const int intervalSwitch = 2000;
const int intervalDeviceState = 2000;

char *ca(CA_PEM);
std::vector<ItemhubPin> pins;
char ssid[] = "{SSID}";
char password[] = "{WIFI_PASSWORD}";
std::string host = "itemhub.io";
std::string remoteDeviceId;
std::string token;
std::string postBody = "{\"clientId\":\"{CLIENT_ID}\",\"clientSecret\":\"{CLIENT_SECRET}\"}";

unsigned long currentSensorTimestamp;
unsigned long previousSensorTimestamp;
unsigned long currentSwitchTimestamp;
unsigned long previousSwitchTimestamp;
unsigned long currentDeviceStateTimestamp;
unsigned long previousDeviceStateTimestamp;
WiFiSSLClient client;
int status = WL_IDLE_STATUS;

void setup()
{
  Serial.begin(115200);
  delay(5000);

  while (status != WL_CONNECTED)
  {
    Serial.print("\r\n Attempting to connect to SSID: ");
    Serial.println(ssid);
    status = WiFi.begin(ssid, password);
    delay(5000);
  }

  {PINS};
  AuthResponse authResponse = ItemhubUtilities::Auth(client, ca, host, postBody);
  token = authResponse.token;
  remoteDeviceId = authResponse.remoteDeviceId;
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

  // itemhub switch
  currentSwitchTimestamp = millis();
  if (currentSwitchTimestamp - previousSwitchTimestamp > intervalSwitch)
  {
    previousSwitchTimestamp = currentSwitchTimestamp;
    ItemhubUtilities::CheckSwitchState(client, ca, host, token, remoteDeviceId, pins);
  }

  // itemhub sensor
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
