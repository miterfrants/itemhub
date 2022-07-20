#include "../tiny-json/tiny-json.h"
#include "../TlsTcpClient/TlsTcpClient.h"
#include <vector>
#include <numeric>
#include <sstream>

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
};
class ItemhubUtilities
{
public:
    static std::string Send(TlsTcpClient &client, std::string &apiEndpoint, std::string &caPem, std::string &method, std::string &path, std::string &postBody, std::string &token)
    {
        std::string resp;
        unsigned char buff[512];
        bool respFlag = false;

        int postBodyLength = postBody.length();
        // Send request to HTTPS web server.
        int len = sprintf((char *)buff, "%s %s HTTP/1.1\r\nHost: %s\r\nContent-Type: application/json\r\nAuthorization: Bearer %s\r\nContent-Length: %d\r\n\r\n%s", method.c_str(), path.c_str(), apiEndpoint.c_str(), token.c_str(), postBodyLength, postBody.c_str());
        client.write(buff, len);
        // GET HTTPS response.
        memset(buff, 0, sizeof(buff));
        while (1)
        {
            memset(buff, 0, sizeof(buff));
            int ret = client.read(buff, sizeof(buff) - 1);
            if (ret == MBEDTLS_ERR_SSL_WANT_READ)
            {
                if (respFlag == true)
                {
                    respFlag = false;
                    break;
                }
                delay(100);
                continue;
            }
            else if (ret <= 0)
            {
                break;
            }
            else if (ret > 0)
            {
                respFlag = true;
                char tempReuslt[sizeof(buff)];
                memcpy(tempReuslt, buff, sizeof(buff));
                resp.append(tempReuslt);
            }
        }
        Serial.println("send end");
        return resp;
    }

    static int GetHttpStatus(std::string &resp)
    {
        size_t startOfHttpMeta = resp.find("HTTP/1.1");
        if (startOfHttpMeta != std::string::npos)
        {
            std::string httpStatus = resp.substr(startOfHttpMeta + 9, 3);
            return std::stoi(httpStatus);
        }
        return 500;
    }

    static std::string ExtractBody(std::string &resp, bool isArray)
    {
        int startOfHead = resp.find("HTTP");
        int endOfHeader = resp.find("\r\n\r\n", startOfHead + 1);
        int startOfContentLength = resp.find("\r\n", endOfHeader + 1);
        std::string prefix = "{";
        if (isArray)
        {
            prefix = "[";
        }
        int startOfJsonObject = resp.find(prefix, endOfHeader);
        Serial.print("endOfHeader: ");
        Serial.println(endOfHeader);

        Serial.print("startOfContentLength: ");
        Serial.println(startOfContentLength);

        Serial.print("startOfJsonObject: ");
        Serial.println(startOfJsonObject);

        std::string failed = "FAILED";
        std::string rawContentLength = resp.substr(startOfContentLength, startOfJsonObject - startOfContentLength - 1);

        unsigned int contentLength = std::stoul(rawContentLength, nullptr, 16);

        if (startOfJsonObject != -1)
        {
            std::string header = resp.substr(0, endOfHeader);
            std::string body = resp.substr(startOfJsonObject, contentLength);
            return body;
        }
        return "failed";
    }

    static std::string Extract(std::string &resp, const char *type)
    {
        int startOfHead = resp.find("HTTP");
        int endOfHeader = resp.find("\r\n\r\n", startOfHead + 1);
        int startOfContentLength = resp.find("\r\n", endOfHeader + 1);
        int startOfJsonObject = resp.find("{", endOfHeader);
        Serial.print("endOfHeader: ");
        Serial.println(endOfHeader);

        Serial.print("startOfContentLength: ");
        Serial.println(startOfContentLength);

        Serial.print("startOfJsonObject: ");
        Serial.println(startOfJsonObject);

        std::string failed = "FAILED";
        std::string rawContentLength = resp.substr(startOfContentLength, startOfJsonObject - startOfContentLength - 1);

        unsigned int contentLength = std::stoul(rawContentLength, nullptr, 16);

        if (startOfJsonObject != -1)
        {
            std::string header = resp.substr(0, endOfHeader);
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
};
