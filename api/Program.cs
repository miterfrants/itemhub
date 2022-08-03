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
                    option.ListenAnyIP(5000);
                    option.ListenAnyIP(8080);
                    option.Listen(System.Net.IPAddress.Loopback, 5001, listenOptions =>
                    {
                        listenOptions.UseHttps();
                    });
                });
                webBuilder.UseStartup<Startup>();
                webBuilder.UseSentry();
            });
    }
}