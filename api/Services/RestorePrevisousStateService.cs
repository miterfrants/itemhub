using System;
using System.Threading;
using Newtonsoft.Json;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using Homo.AuthApi;
using System.Linq;

namespace Homo.IotApi
{
    public static class RestorePrevisousStateService
    {
        private static Dictionary<long, CancellationTokenSource> tokenSourceCollections = new Dictionary<long, CancellationTokenSource>();
        public static void OfflineTooLongNoActivityDevice(string dbc)
        {

            DbContextOptionsBuilder<IotDbContext> builder = new DbContextOptionsBuilder<IotDbContext>();
            var serverVersion = new MySqlServerVersion(new Version(8, 0, 25));
            builder.UseMySql(dbc, serverVersion);
            IotDbContext dbContext = new IotDbContext(builder.Options);

            // Get pagination devices
            List<long> ids = DeviceActivityLogDataservice.GetTooLongWithoutActivityDeviceIds(dbContext, 60);
            DeviceDataservice.OfflineMultiple(dbContext, ids);
        }

        public static void RestartSchedulePipeline(
            string serverId,
            string dbc,
            List<MqttPublisher> localMqttPublishers,
            string mqttUsername,
            string mqttPassword,
            string smsUsername,
            string smsPassword,
            string smsClientUrl,
            string sendGridApiKey,
            string staticPath,
            string systemEmail
            )
        {

            DbContextOptionsBuilder<IotDbContext> iotDbContextBuilder = new DbContextOptionsBuilder<IotDbContext>();
            DbContextOptionsBuilder<DBContext> builder = new DbContextOptionsBuilder<DBContext>();
            var serverVersion = new MySqlServerVersion(new Version(8, 0, 25));
            builder.UseMySql(dbc, serverVersion);
            iotDbContextBuilder.UseMySql(dbc, serverVersion);
            IotDbContext iotDbContext = new IotDbContext(iotDbContextBuilder.Options);
            DBContext dbContext = new DBContext(builder.Options);

            var pipelines = PipelineDataservice.GetAll(iotDbContext, null, PIPELINE_ITEM_TYPE.SCHEDULE, null, null, true);
            pipelines.ForEach(pipeline =>
            {
                List<ViewRelationOfGroupAndUser> permissions = RelationOfGroupAndUserDataservice.GetRelationByUserId(dbContext, pipeline.OwnerId);
                string[] roles = permissions.SelectMany(x => Newtonsoft.Json.JsonConvert.DeserializeObject<string[]>(x.Roles)).ToArray();
                var isVIP = roles.Contains("VIP");
                var pipelineItems = PipelineItemDataservice.GetAll(iotDbContext, pipeline.OwnerId, pipeline.Id, null);
                var pipelineConnectors = PipelineConnectorDataservice.GetAll(iotDbContext, pipeline.OwnerId, pipeline.Id, null);
                PipelineHelper.Execute(serverId, pipeline.Id, pipelineItems, pipelineConnectors, pipeline.OwnerId, isVIP, localMqttPublishers, mqttUsername, mqttPassword, smsUsername, smsPassword, smsClientUrl, sendGridApiKey, staticPath, systemEmail, dbc, false, true);
            });
        }
    }
}
