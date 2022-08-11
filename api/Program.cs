using System.Net.Security;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;
using MQTTnet.AspNetCore;
using Microsoft.AspNetCore.Server.Kestrel.Https;
using System.Security.Cryptography.X509Certificates;
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
                webBuilder.UseKestrel(Options =>
                {
                    Options.ListenAnyIP(1883, listenOptions =>
                    {
                        listenOptions.KestrelServerOptions.ConfigureHttpsDefaults(httpsOptions =>
                        {
                            httpsOptions.CheckCertificateRevocation = true;
                            httpsOptions.ServerCertificate = new X509Certificate2("secrets/mqtt-server-cert.pfx");
                            httpsOptions.ClientCertificateMode = ClientCertificateMode.RequireCertificate;
                            httpsOptions.ClientCertificateValidation = (certificate2, validationChain, policyErrors) =>
                                {
                                    if (policyErrors == SslPolicyErrors.RemoteCertificateNotAvailable || policyErrors == SslPolicyErrors.RemoteCertificateNameMismatch)
                                    {
                                        return false;
                                    }
                                    return true;
                                };
                        });
                        listenOptions.UseHttps();
                        listenOptions.UseMqtt();

                    });
                    Options.ListenAnyIP(5000);
                    Options.ListenAnyIP(8080);
                });
                webBuilder.UseStartup<Startup>();
                webBuilder.UseSentry();
            });
    }
}