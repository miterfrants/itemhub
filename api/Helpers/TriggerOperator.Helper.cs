using System.Linq;
using System.Collections.Generic;

namespace Homo.IotApi
{
    public static class TriggerOperatorHelper
    {
        public static string GetSymbol(string operatorKey)
        {
            Dictionary<string, string> symbolMapping = new Dictionary<string, string>() { { "B", ">" }, { "BE", ">=" }, { "E", "=" }, { "LE", "<=" }, { "L", "<" } };
            return symbolMapping.GetValueOrDefault(operatorKey);
        }

    }
}
