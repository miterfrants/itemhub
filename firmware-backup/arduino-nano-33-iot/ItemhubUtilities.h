#include <vector>
#include <numeric>
#include "tiny-json.h"

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
    static std::string Extract(std::string &jsonString, const char *key)
    {
        json_t const *jsonData = json_create((char *)jsonString.c_str(), pool, MAX_FIELDS);
        if (jsonData == NULL)
        {
            return std::string("");
        }
        if (JSON_OBJ != json_getType(jsonData))
        {
            return std::string("");
        }
        if (JSON_NULL == json_getType(jsonData))
        {
            return std::string("");
        }
        if (jsonData == NULL)
        {
            return std::string("");
        }
        json_t const *jsonField = json_getProperty(jsonData, key);
        if (jsonField == NULL)
        {
            return std::string("");
        }
        const char *value = json_getValue(jsonField);
        return std::string(value);
    }
};
