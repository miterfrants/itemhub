using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using System.Drawing;
using System.Collections.Generic;

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

        public virtual DbSet<DevicePin> DevicePin { get; set; }
        public virtual DbSet<Subscription> Subscription { get; set; }
        public virtual DbSet<Transaction> Transaction { get; set; }
        public virtual DbSet<ThirdPartyPaymentFlow> ThirdPartyPaymentFlow { get; set; }
        public virtual DbSet<DeviceActivityLog> DeviceActivityLog { get; set; }
        public virtual DbSet<SystemConfig> SystemConfig { get; set; }
        public virtual DbSet<SensorLog> SensorLog { get; set; }
        public virtual DbSet<FirmwareBundleLog> FirmwareBundleLog { get; set; }
        public virtual DbSet<Microcontroller> Microcontroller { get; set; }
        public virtual DbSet<DashboardMonitor> DashboardMonitor { get; set; }
        public virtual DbSet<Log> Log { get; set; }
        public virtual DbSet<Pipeline> Pipeline { get; set; }
        public virtual DbSet<PipelineItem> PipelineItem { get; set; }
        public virtual DbSet<PipelineConnector> PipelineConnector { get; set; }
        public virtual DbSet<PipelineExecuteLog> PipelineExecuteLog { get; set; }
        public virtual DbSet<DeviceUploadedImage> DeviceUploadedImage { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.Entity<OauthCode>(entity =>
            {
                entity.HasIndex(p => new { p.Code });
            });

            modelBuilder.Entity<OauthClient>(entity =>
            {
                entity.HasIndex(p => new { p.ClientId });
                entity.HasIndex(p => new { p.OwnerId });
                entity.HasIndex(p => new { p.OwnerId, p.ClientId, p.DeletedAt }).IsUnique();
                entity.HasIndex(p => new { p.ClientId, p.DeletedAt }).IsUnique();
                entity.HasIndex(p => new { p.DeviceId });
                entity.HasIndex(p => new { p.CreatedAt });
            });

            modelBuilder.Entity<Device>(entity =>
            {
                entity.HasIndex(p => new { p.Name });
                entity.HasIndex(p => new { p.OwnerId });
                entity.HasIndex(p => new { p.Online });
                entity.HasIndex(p => new { p.Microcontroller });
                entity.HasOne(p => p.Zone).WithMany().HasForeignKey(p => p.ZoneId);
                entity.HasIndex(p => new { p.CreatedAt });
                entity.HasIndex(p => new { p.DeletedAt });
                entity.Property(p => p.Protocol).HasDefaultValueSql(((int)FIRMWARE_PROTOCOL.HTTP).ToString());
            });

            modelBuilder.Entity<Subscription>(entity =>
            {
                entity.HasIndex(p => new { p.OwnerId });
                entity.HasIndex(p => new { p.PricingPlan });
                entity.HasIndex(p => new { p.StartAt });
                entity.HasIndex(p => new { p.EndAt });
                entity.HasIndex(p => new { p.TransactionId });
                entity.Property(b => b.StopNextSubscribed)
                    .HasDefaultValueSql("0");
                entity.HasIndex(p => new { p.CreatedAt });
                entity.HasIndex(p => new { p.DeletedAt });
            });

            modelBuilder.Entity<Transaction>(entity =>
            {
                entity.HasIndex(p => new { p.OwnerId });
                entity.HasIndex(p => new { p.CreatedAt });
                entity.HasIndex(p => new { p.ExternalTransactionId });
                entity.HasIndex(p => new { p.Status });
                entity.HasIndex(p => new { p.DeletedAt });
            });

            modelBuilder.Entity<ThirdPartyPaymentFlow>(entity =>
            {
                entity.HasIndex(p => new { p.CreatedAt });
                entity.HasIndex(p => new { p.ExternalTransactionId });
                entity.HasIndex(p => new { p.DeletedAt });
            });

            modelBuilder.Entity<DeviceActivityLog>(entity =>
            {
                entity.HasIndex(p => new { p.CreatedAt });
                entity.HasIndex(p => new { p.OwnerId });
                entity.HasIndex(p => new { p.DeviceId });
                entity.HasIndex(p => new { p.DeletedAt });
            });

            modelBuilder.Entity<SystemConfig>(entity =>
            {
                entity.HasIndex(p => new { p.Key });
            });

            modelBuilder.Entity<DevicePin>(entity =>
            {
                entity.HasIndex(p => new { p.Name });
                entity.HasIndex(p => new { p.Value });
                entity.HasIndex(p => new { p.DeviceId });
                entity.HasIndex(p => new { p.OwnerId });
                entity.HasIndex(p => new { p.PinType });
                entity.HasIndex(p => new { p.CreatedAt });
                entity.HasIndex(p => new { p.DeletedAt });
                entity.Property(p => p.Value).HasDefaultValueSql("0");
                entity.Property(p => p.PinType).HasDefaultValueSql("0");
                entity.HasOne(p => p.Device).WithMany().HasForeignKey(p => p.DeviceId);
            });

            modelBuilder.Entity<SensorLog>(entity =>
            {
                entity.HasIndex(p => new { p.Pin });
                entity.HasIndex(p => new { p.DeviceId });
                entity.HasIndex(p => new { p.OwnerId });
                entity.HasIndex(p => new { p.CreatedAt });
                entity.HasIndex(p => new { p.DeletedAt });
                entity.HasOne(p => p.Device).WithMany().HasForeignKey(p => p.DeviceId);
            });

            modelBuilder.Entity<FirmwareBundleLog>(entity =>
            {
                entity.HasIndex(p => new { p.DeviceId });
                entity.HasIndex(p => new { p.OwnerId });
                entity.HasIndex(p => new { p.BundleId });
                entity.HasIndex(p => new { p.BundleId, p.DeletedAt }).IsUnique();
            });

            modelBuilder.Entity<Microcontroller>(entity =>
            {
                entity.HasIndex(p => new { p.CreatedBy });
                entity.HasIndex(p => new { p.CreatedAt });
                entity.HasIndex(p => new { p.DeletedAt });
                entity.HasIndex(p => new { p.DeletedAt, p.Key }).IsUnique();
            });

            modelBuilder.Entity<DashboardMonitor>(entity =>
            {
                entity.HasIndex(p => new { p.CreatedAt });
                entity.HasIndex(p => new { p.DeletedAt });
                entity.HasIndex(p => new { p.DeviceId });
                entity.HasIndex(p => new { p.Pin });
                entity.HasIndex(p => new { p.Mode });
                entity.HasIndex(p => new { p.OwnerId });
                entity.HasIndex(p => new { p.Sort });
            });

            modelBuilder.Entity<Log>(entity =>
            {
                entity.HasIndex(p => new { p.CreatedAt });
                entity.HasIndex(p => new { p.DeviceId });
                entity.HasIndex(p => new { p.Pin });
            });

            modelBuilder.Entity<Pipeline>(entity =>
            {
                entity.HasIndex(p => new { p.CreatedAt });
                entity.HasIndex(p => new { p.DeletedAt });
                entity.HasIndex(p => new { p.OwnerId });
                entity.HasIndex(p => new { p.LockBy });
            });

            modelBuilder.Entity<PipelineItem>(entity =>
            {
                entity.HasIndex(p => new { p.CreatedAt });
                entity.HasIndex(p => new { p.DeletedAt });
                entity.HasIndex(p => new { p.OwnerId });
                entity.HasIndex(p => new { p.PipelineId });
                entity.Property(p => p.Point).HasConversion(
                    data => JsonConvert.SerializeObject(data),
                    raw => JsonConvert.DeserializeObject<Point>(raw)
                );
            });

            modelBuilder.Entity<PipelineConnector>(entity =>
            {
                entity.HasIndex(p => new { p.CreatedAt });
                entity.HasIndex(p => new { p.DeletedAt });
                entity.HasIndex(p => new { p.OwnerId });
                entity.HasIndex(p => new { p.PipelineId });
            });

            modelBuilder.Entity<PipelineExecuteLog>(entity =>
            {
                entity.HasIndex(p => new { p.CreatedAt });
                entity.HasIndex(p => new { p.DeletedAt });
                entity.HasIndex(p => new { p.PipelineId });
                entity.HasIndex(p => new { p.OwnerId });
                entity.HasIndex(p => new { p.IsHead });
                entity.HasIndex(p => new { p.IsEnd });
                entity.Property(p => p.IsHead).HasDefaultValueSql("0");
                entity.Property(p => p.IsEnd).HasDefaultValueSql("0");
                entity.Property(p => p.CreatedAt)
                    .HasDefaultValue(System.DateTime.Now);
            });

            modelBuilder.Entity<DeviceUploadedImage>(entity =>
            {
                entity.HasIndex(p => new { p.CreatedAt });
                entity.HasIndex(p => new { p.DeletedAt });
                entity.HasIndex(p => new { p.OwnerId });
                entity.HasIndex(p => new { p.DeviceId });
                entity.HasIndex(p => new { p.Filename });
                entity.Property(p => p.CreatedAt)
                    .HasDefaultValue(System.DateTime.Now);
            });

            OnModelCreatingPartial(modelBuilder);
        }

        partial void OnModelCreatingPartial(ModelBuilder modelBuilder);

    }
}