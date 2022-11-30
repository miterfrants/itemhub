using System;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.EntityFrameworkCore;
using Homo.Core.Constants;
using System.Linq;
using Homo.AuthApi;
using System.Collections.Generic;

namespace Homo.IotApi
{
    public class FilterRequestAttribute : ActionFilterAttribute
    {
        private string _dbc;
        public FilterRequestAttribute(string dbc)
        {
            _dbc = dbc;
        }
        public override void OnActionExecuting(ActionExecutingContext context)
        {
            long deviceId = 0;
            try
            {
                long.TryParse(context.RouteData.Values["id"].ToString(), out deviceId);
            }
            catch (System.Exception)
            {
                throw new CustomException(ERROR_CODE.TOO_MANY_REQUEST, System.Net.HttpStatusCode.Forbidden);
            }

            DbContextOptionsBuilder<IotDbContext> iotBuilder = new DbContextOptionsBuilder<IotDbContext>();
            DbContextOptionsBuilder<DBContext> dbContextBuilder = new DbContextOptionsBuilder<DBContext>();
            var serverVersion = new MySqlServerVersion(new Version(8, 0, 25));
            iotBuilder.UseMySql(_dbc, serverVersion);
            IotDbContext _iotDbContext = new IotDbContext(iotBuilder.Options);
            DBContext dbContext = new DBContext(dbContextBuilder.Options);

            var checkData = _iotDbContext.DevicePin
                .Where(x => x.DeletedAt == null && x.DeviceId == deviceId)
                .OrderByDescending(x => x.CreatedAt)
                .Take(1)
                .GroupJoin(_iotDbContext.Subscription, x => x.OwnerId, y => y.OwnerId, (x, y) => new
                {
                    DevicePinSensor = x,
                    Subscription = y
                }).SelectMany(gj => gj.Subscription.DefaultIfEmpty(), (x, y) => new
                {
                    x.DevicePinSensor,
                    Subscription = y
                })
                .Where(x => x.Subscription.DeletedAt == null)
                .OrderByDescending(x => x.Subscription.CreatedAt)
                .Take(1)
                .FirstOrDefault();

            PRICING_PLAN? pricingPlan = null;
            if (checkData != null && checkData.Subscription != null)
            {
                pricingPlan = (PRICING_PLAN)checkData.Subscription.PricingPlan;
            }

            List<ViewRelationOfGroupAndUser> permissions = RelationOfGroupAndUserDataservice.GetRelationByUserId(dbContext, checkData.DevicePinSensor.OwnerId);
            string[] roles = permissions.SelectMany(x => Newtonsoft.Json.JsonConvert.DeserializeObject<string[]>(x.Roles)).ToArray();
            bool isVIP = roles.Any(x => x == "VIP");

            int requestFrequency = (int)SubscriptionHelper.GetFrequency(pricingPlan);
            if ((checkData != null && checkData.DevicePinSensor != null && checkData.DevicePinSensor.CreatedAt.AddSeconds(requestFrequency) >= DateTime.Now) && !isVIP)
            {
                dbContext.User.Where(x => x.Id == checkData.DevicePinSensor.OwnerId).UpdateFromQuery(x => new User()
                {
                    IsOverSubscriptionPlan = true
                });
                throw new CustomException(ERROR_CODE.TOO_MANY_REQUEST, System.Net.HttpStatusCode.Forbidden);
            }
        }
    }
}