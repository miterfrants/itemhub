using System;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.EntityFrameworkCore;
using Homo.Core.Constants;
using System.Linq;
using Homo.AuthApi;
using System.Collections.Generic;
using System.Net;
using System.Security.Claims;
using Microsoft.Extensions.Options;

namespace Homo.IotApi
{
    public class FilterRequestAttribute : ActionFilterAttribute
    {
        private string _dbc;
        private string _jwtKey;
        public FilterRequestAttribute(string dbc, string jwtKey)
        {
            _dbc = dbc;
            _jwtKey = jwtKey;
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

            string token = context.HttpContext.Request.Headers["Authorization"];
            token = token.Substring("Bearer ".Length).Trim();
            ClaimsPrincipal payload = JWTHelper.GetPayload(_jwtKey, token);
            bool isVIP = payload.IsInRole("VIP");

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