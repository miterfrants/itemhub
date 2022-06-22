#include <string>
#include <vector>
#include "ItemhubUtilities/ItemhubUtilities.h"
#include "ca-pem.h"

#define SWITCH "SWITCH"
#define SENSOR "SENSOR"

#define ERROR_THEN_RECONNECT(resp)                      \
    if (resp.length() == 0)                             \
    {                                                   \
        client.stop();                                  \
        client.close();                                 \
        client.init(caPem.c_str(), caPem.length() + 1); \
        char *api = (char *)apiEndpoint.c_str();        \
        client.connect(api, 443);                       \
        return;                                         \
    }

TlsTcpClient client;
std::string caPem = CA_PEM;
unsigned long lastSync = millis();

std::string apiEndpoint = "itemhub.io";

std::string emptyString = "";
std::string authApiEndpoint = "/api/v1/oauth/exchange-token-for-device";
std::string authPostBody = "{\"clientId\":\"{CLIENT_ID}\",\"clientSecret\":\"{CLIENT_SECRET}\"}";
std::string remoteDeviceId = "";
std::string token = "";
std::string POST = "POST";
std::string GET = "GET";
std::vector<ItemhubPin> pins;
long noDataCount = 0;

const int intervalSensor = 30 * 1000;
const int intervalSwitch = 2000;
const int intervalDeviceState = 2000;

unsigned long currentSensorTimestamp;
unsigned long previousSensorTimestamp;
unsigned long currentSwitchTimestamp;
unsigned long previousSwitchTimestamp;
unsigned long currentDeviceStateTimestamp;
unsigned long previousDeviceStateTimestamp;

bool respFlag = false;
unsigned char buff[512];

void setup()
{
    delay(5000);
    Serial.begin(9600);
    {PINS};

    // setup Root CA pem.
    client.init(caPem.c_str(), caPem.length() + 1);
    char *api = (char *)apiEndpoint.c_str();
    client.connect(api, 443);
    if (!client.verify())
    {
        Serial.println("Server Certificates is in-valid.");
    }

    // itemhub authorize
    auth();
    Serial.println("authorized");
}

void loop()
{ // itemhub device state
    currentDeviceStateTimestamp = millis();
    if (currentDeviceStateTimestamp - previousDeviceStateTimestamp > intervalDeviceState)
    {
        previousDeviceStateTimestamp = currentDeviceStateTimestamp;
        online();
    }

    // itemhub switch
    currentSwitchTimestamp = millis();
    if (currentSwitchTimestamp - previousSwitchTimestamp > intervalSwitch)
    {
        previousSwitchTimestamp = currentSwitchTimestamp;
        checkSwitchState();
    }

    // itemhub sensor
    currentSensorTimestamp = millis();
    if (currentSensorTimestamp - previousSensorTimestamp > intervalSensor)
    {
        previousSensorTimestamp = currentSensorTimestamp;
        sendSensor();
    }
}

void auth()
{
    std::string resp = ItemhubUtilities::Send(client, apiEndpoint, caPem, POST, authApiEndpoint, authPostBody, emptyString);
    token = ItemhubUtilities::Extract(resp, "token");
    remoteDeviceId = ItemhubUtilities::Extract(resp, "deviceId");
}

void online()
{
    std::string deviceOnlineEndpoint = "/api/v1/my/devices/";
    deviceOnlineEndpoint.append(remoteDeviceId);
    deviceOnlineEndpoint.append("/online");
    std::string resp = ItemhubUtilities::Send(client, apiEndpoint, caPem, POST, deviceOnlineEndpoint, emptyString, token);
    ERROR_THEN_RECONNECT(resp);
    std::string status = ItemhubUtilities::Extract(resp, "status");
}

void checkSwitchState()
{
    Serial.println("Check switch state");
    std::string deviceStateEndpoint = "/api/v1/my/devices/";
    deviceStateEndpoint.append(remoteDeviceId);
    deviceStateEndpoint.append("/switches");

    std::string resp = ItemhubUtilities::Send(client, apiEndpoint, caPem, GET, deviceStateEndpoint, emptyString, token);
    ERROR_THEN_RECONNECT(resp);
    std::string body = ItemhubUtilities::ExtractBody(resp, true);
    body.insert(0, "{\"data\":");
    body.append("}");
    json_t const *jsonData = json_create((char *)body.c_str(), pool, MAX_FIELDS);
    if (jsonData == NULL)
    {
        return;
    }
    json_t const *data = json_getProperty(jsonData, "data");
    json_t const *item;
    for (int i = 0; i < pins.size(); i++)
    {
        if (pins[i].mode == SENSOR)
        {
            continue;
        }

        for (item = json_getChild(data); item != 0; item = json_getSibling(item))
        {
            if (JSON_OBJ != json_getType(item))
            {
                continue;
            }

            char const *pin = json_getPropertyValue(item, "pin");
            char const *value = json_getPropertyValue(item, "value");
            if (!pin)
            {
                continue;
            }

            String stringValue = String(value);
            int intValue = stringValue.toInt();

            if (pins[i].pinString == pin && intValue == 0)
            {
                digitalWrite(pins[i].pin, LOW);
            }
            else if (pins[i].pinString == pin && intValue == 1)
            {
                digitalWrite(pins[i].pin, HIGH);
            }
        }
    }
}

void sendSensor()
{
    std::string devicePinDataEndpoint = "/api/v1/my/devices/";
    devicePinDataEndpoint.append(remoteDeviceId);

    for (int i = 0; i < pins.size(); i++)
    {
        std::string mode = pins[i].mode;
        if (mode == SENSOR)
        {
            std::string endpoint(devicePinDataEndpoint);
            endpoint.append("/sensors/");
            endpoint.append(pins[i].pinString);
            std::string postBody = "{\"value\":";
            int value = digitalRead(pins[i].pin);
            std::string valueString = std::to_string(value);
            postBody.append(valueString.c_str());
            postBody.append("}");

            std::string respOfRegisterPin = ItemhubUtilities::Send(client, apiEndpoint, caPem, POST, endpoint, postBody, token);
            ERROR_THEN_RECONNECT(respOfRegisterPin);
            Serial.print("Sensor: ");
            Serial.println(respOfRegisterPin.c_str());
        }
    }
}