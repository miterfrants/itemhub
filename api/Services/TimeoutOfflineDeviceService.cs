using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;

namespace Homo.IotApi
{
    public static class TimeoutOfflineDeviceService
    {
        private static Dictionary<long, CancellationTokenSource> tokenSourceCollections = new Dictionary<long, CancellationTokenSource>();
        public static void StartAsync(long ownerId, long deviceId, string dbc)
        {
            if (tokenSourceCollections.ContainsKey(deviceId))
            {
                var previousTokenSource = tokenSourceCollections[deviceId];
                previousTokenSource.Cancel();
            }
            var tokenSource = new CancellationTokenSource();
            CancellationToken cancellationToken = tokenSource.Token;
            var task = Task.Run(async () =>
            {
                await Task.Delay(60 * 1000);
                if (cancellationToken.IsCancellationRequested)
                {
                    return;
                }
                DbContextOptionsBuilder<IotDbContext> builder = new DbContextOptionsBuilder<IotDbContext>();
                var serverVersion = new MySqlServerVersion(new Version(8, 0, 25));
                builder.UseMySql(dbc, serverVersion);
                IotDbContext newDbContext = new IotDbContext(builder.Options);

                // 15 秒內 device activity log 沒查到資料就當作下線
                int count = DeviceActivityLogDataservice.GetRowNumThis15Seconds(newDbContext, ownerId, deviceId);
                if (count == 0)
                {
                    DeviceDataservice.Switch(newDbContext, ownerId, deviceId, false);
                }
            }, tokenSource.Token);

            if (tokenSourceCollections.ContainsKey(deviceId))
            {
                tokenSourceCollections[deviceId] = tokenSource;
            }
            else
            {
                tokenSourceCollections.Add(deviceId, tokenSource);
            }
        }
    }
}
