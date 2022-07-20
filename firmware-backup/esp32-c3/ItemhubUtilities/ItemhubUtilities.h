#include <string>
#include <WiFiClientSecure.h>
#include <ArduinoJson.h>
#include <ArduinoUniqueID.h>

#include "../tiny-json.h"
#define SWITCH "SWITCH"
#define SENSOR "SENSOR"

enum
{
    MAX_FIELDS = 128
};
json_t pool[MAX_FIELDS];

class ItemhubPin
{
public:
    ItemhubPin(byte pin, std::string pinString, std::string mode)
    {
        this->pin = pin;
        this->pinString = pinString;
        this->mode = mode;
        if (this->mode == "SWITCH")
        {
            pinMode(pin, OUTPUT);
        }
        if (this->mode == "SENSOR")
        {
            Serial.println("sensor");
            Serial.println(pinString.c_str());
            pinMode(pin, INPUT);
        }
    }
    byte pin;
    std::string pinString;
    std::string mode;
    std::string value;
};

class AuthResponse
{
public:
    AuthResponse(std::string token, std::string remoteDeviceId)
    {
        this->token = token;
        this->remoteDeviceId = remoteDeviceId;
    }
    std::string token;
    std::string remoteDeviceId;
};

class ItemhubUtilities
{
public:
    static std::string Online(WiFiClientSecure &client, char *ca, std::string &host, std::string &remoteDeviceId, std::string &token)
    {
        std::string deviceOnlineEndpoint = "/api/v1/my/devices/";
        deviceOnlineEndpoint.append(remoteDeviceId);
        deviceOnlineEndpoint.append("/online");
        std::string emptyString = "{}";
        std::string resp = ItemhubUtilities::Send(client, ca, host, "POST", deviceOnlineEndpoint, emptyString, token);
        return resp;
    }

    static AuthResponse Auth(WiFiClientSecure &client, char *ca, std::string &host, std::string &postBody)
    {
        std::string authEndpoint = "/api/v1/oauth/exchange-token-for-device";
        std::string emptyToken = "";
        std::string resp = Send(client, ca, host, "POST", authEndpoint, postBody, emptyToken);
        std::string token = ItemhubUtilities::Extract(resp, "token");
        std::string remoteDeviceId = ItemhubUtilities::Extract(resp, "deviceId");

        return AuthResponse(token, remoteDeviceId);
    }

    static void CheckSwitchState(WiFiClientSecure &client, char *ca, std::string &host, std::string &token, std::string &remoteDeviceId, std::vector<ItemhubPin> &pins)
    {
        Serial.println("Check switch state");
        std::string deviceStateEndpoint = "/api/v1/my/devices/";
        deviceStateEndpoint.append(remoteDeviceId);
        deviceStateEndpoint.append("/switches");
        std::string emptyString = "";
        std::string resp = ItemhubUtilities::Send(client, ca, host, "GET", deviceStateEndpoint, emptyString, token);
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

    static void SendSensor(WiFiClientSecure &client, char *ca, std::string &host, std::string &token, std::string &remoteDeviceId, std::vector<ItemhubPin> &pins)
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
                postBody.append(pins[i].value);
                postBody.append("}");
                std::string resp = ItemhubUtilities::Send(client, ca, host, "POST", endpoint, postBody, token);
                Serial.print("Sensor: ");
                Serial.println(resp.c_str());
            }
        }
    }

    static std::string Send(WiFiClientSecure &client, char *ca, std::string &host, char *method, std::string &path, std::string &postBody, std::string &token)
    {
        unsigned char buff[256];
        bool respFlag = false;
        std::string result = "";

        client.setCACert(ca);

        if (!client.connect(host.c_str(), 443))
        {
            Serial.println("connect failed");
            return "";
        }

        client.print(String(method) + " " + path.c_str() + " HTTP/1.1\r\n" +
                     "Host: " + host.c_str() + "\r\n" +
                     "Content-Type: application/json\r\n" +
                     "Authorization: Bearer " + token.c_str() + "\r\n");

        if (method == "POST")
        {
            client.print("Content-Length: ");
            client.println(postBody.length());
            client.println();
            client.println(postBody.c_str());
        }
        if (method == "GET")
        {
            client.print("Connection: close\r\n\r\n");
        }

        while (client.connected())
        {
            String line = client.readStringUntil('\n');
            if (line == "\r")
            {
                break;
            }
        }

        while (client.available())
        {
            char c = client.read();
            result += c;
        }

        if (method == "POST")
        {
            client.println("Connection: close\r\n\r\n");
        }
        client.stop();
        client.flush();
        return result;
    }

    static int
    GetHttpStatus(std::string &resp)
    {
        size_t startOfHttpMeta = resp.find("HTTP/1.1");
        if (startOfHttpMeta != std::string::npos)
        {
            std::string httpStatus = resp.substr(startOfHttpMeta + 9, 3);
            return std::stoi(httpStatus);
        }
        return 500;
    }

    static std::string Extract(std::string &resp, const char *type)
    {
        std::string prefix = "{";
        int startOfJsonObject = resp.find(prefix);

        std::string failed = "FAILED";
        std::string rawContentLength = resp.substr(0, startOfJsonObject);

        unsigned int contentLength = std::stoul(rawContentLength, nullptr, 16);

        if (startOfJsonObject != -1)
        {
            std::string body = resp.substr(startOfJsonObject, contentLength);
            json_t const *jsonData = json_create((char *)body.c_str(), pool, MAX_FIELDS);
            if (jsonData == NULL)
            {
                return "failed";
            }
            json_t const *jsonField = json_getProperty(jsonData, type);
            const char *value = json_getValue(jsonField);
            return std::string(value);
        }
        return "failed";
    }

    static std::string ExtractBody(std::string &resp, bool isArray)
    {
        std::string prefix = "{";
        if (isArray)
        {
            prefix = "[";
        }
        int startOfJsonObject = resp.find(prefix);

        std::string failed = "FAILED";
        std::string rawContentLength = resp.substr(0, startOfJsonObject);

        unsigned int contentLength = std::stoul(rawContentLength, nullptr, 16);

        if (startOfJsonObject != -1)
        {
            std::string body = resp.substr(startOfJsonObject, contentLength);
            return body;
        }
        return "failed";
    }
};