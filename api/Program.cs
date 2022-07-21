using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;
using MQTTnet.AspNetCore;

namespace Homo.IotApi
{
    public class Program
    {
        public static void Main(string[] args)
        {
            CreateHostBuilder(args).Build().Run();
        }

        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
            .ConfigureWebHostDefaults(webBuilder =>
            {
                webBuilder.UseKestrel(option =>
                {
                    option.ListenAnyIP(1883, listenOption => listenOption.UseMqtt());
                });
                webBuilder.UseStartup<Startup>();
                webBuilder.UseSentry();
            });
    }
}