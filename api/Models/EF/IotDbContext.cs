using System;
using System.Data;
using System.Data.Common;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Homo.AuthApi;

namespace Homo.IotApi
{
    public partial class IotDbContext : DbContext
    {
        public IotDbContext() { }

        public IotDbContext(DbContextOptions<IotDbContext> options) : base(options) { }

        public virtual DbSet<Device> Device { get; set; }

        public virtual DbSet<Zone> Zone { get; set; }
        public virtual DbSet<OauthCode> OauthCode { get; set; }

        public virtual DbSet<OauthClient> OauthClient { get; set; }

        public virtual DbSet<OauthClientRedirectUri> OauthClientRedirectUri { get; set; }

        public virtual DbSet<DevicePinSwitch> DevicePinSwitch { get; set; }
        public virtual DbSet<DevicePinSensor> DevicePinSensor { get; set; }
        public virtual DbSet<Trigger> Trigger { get; set; }
        public virtual DbSet<Subscription> Subscription { get; set; }
        public virtual DbSet<Transaction> Transaction { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.Entity<OauthCode>(entity =>
            {
                entity.HasIndex(p => new { p.Code });
            });

            modelBuilder.Entity<OauthClient>(entity =>
            {
                entity.HasIndex(p => new { p.ClientId }).IsUnique();
                entity.HasIndex(p => new { p.OwnerId });
            });

            modelBuilder.Entity<Device>(entity =>
            {
                entity.HasIndex(p => new { p.Name });
                entity.HasIndex(p => new { p.DeviceId });
                entity.HasIndex(p => new { p.OwnerId });
                entity.HasIndex(p => new { p.Online });
                entity.HasOne(p => p.Zone).WithMany().HasForeignKey(p => p.ZoneId);
            });

            modelBuilder.Entity<DevicePinSwitch>(entity =>
            {
                entity.HasIndex(p => new { p.Pin });
                entity.HasIndex(p => new { p.Mode });
                entity.HasIndex(p => new { p.DeviceId });
                entity.HasIndex(p => new { p.OwnerId });
                entity.HasOne(p => p.Device).WithMany().HasForeignKey(p => p.DeviceId);
            });

            modelBuilder.Entity<DevicePinSensor>(entity =>
            {
                entity.HasIndex(p => new { p.Pin });
                entity.HasIndex(p => new { p.Mode });
                entity.HasIndex(p => new { p.DeviceId });
                entity.HasIndex(p => new { p.OwnerId });
                entity.HasOne(p => p.Device).WithMany().HasForeignKey(p => p.DeviceId);
            });

            modelBuilder.Entity<Trigger>(entity =>
            {
                entity.HasIndex(p => new { p.SourcePin });
                entity.HasIndex(p => new { p.SourceDeviceId });
                entity.HasIndex(p => new { p.DestinationPin });
                entity.HasIndex(p => new { p.DestinationDeviceId });
                entity.HasIndex(p => new { p.OwnerId });
                entity.HasOne(p => p.SourceDevice).WithMany().HasForeignKey(p => p.SourceDeviceId);
                entity.HasOne(p => p.DestinationDevice).WithMany().HasForeignKey(p => p.DestinationDeviceId);
            });

            modelBuilder.Entity<Subscription>(entity =>
            {
                entity.HasIndex(p => new { p.OwnerId });
                entity.HasIndex(p => new { p.PricingPlan });
                entity.HasIndex(p => new { p.StartAt });
                entity.HasIndex(p => new { p.EndAt });
                entity.HasIndex(p => new { p.TransactionId });
                entity.Property(b => b.StopNextSubscribed)
                    .HasDefaultValueSql("1");
            });

            modelBuilder.Entity<Transaction>(entity =>
            {
                entity.HasIndex(p => new { p.OwnerId });
                entity.HasIndex(p => new { p.CreatedAt });
            });

            OnModelCreatingPartial(modelBuilder);
        }

        partial void OnModelCreatingPartial(ModelBuilder modelBuilder);


    }
}