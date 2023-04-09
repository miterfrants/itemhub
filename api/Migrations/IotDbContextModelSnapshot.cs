﻿// <auto-generated />
using System;
using Homo.IotApi;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

#nullable disable

namespace IotApi.Migrations
{
    [DbContext(typeof(IotDbContext))]
    partial class IotDbContextModelSnapshot : ModelSnapshot
    {
        protected override void BuildModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "6.0.14")
                .HasAnnotation("Relational:MaxIdentifierLength", 64);

            modelBuilder.Entity("Homo.IotApi.DashboardMonitor", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    b.Property<int>("Column")
                        .HasColumnType("int");

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("datetime(6)");

                    b.Property<DateTime?>("DeletedAt")
                        .HasColumnType("datetime(6)");

                    b.Property<long>("DeviceId")
                        .HasColumnType("bigint");

                    b.Property<DateTime?>("EditedAt")
                        .HasColumnType("datetime(6)");

                    b.Property<int>("Mode")
                        .HasColumnType("int");

                    b.Property<long>("OwnerId")
                        .HasColumnType("bigint");

                    b.Property<string>("Pin")
                        .IsRequired()
                        .HasMaxLength(5)
                        .HasColumnType("varchar(5)");

                    b.Property<int>("Row")
                        .HasColumnType("int");

                    b.Property<int>("Sort")
                        .HasColumnType("int");

                    b.HasKey("Id");

                    b.HasIndex("CreatedAt");

                    b.HasIndex("DeletedAt");

                    b.HasIndex("DeviceId");

                    b.HasIndex("Mode");

                    b.HasIndex("OwnerId");

                    b.HasIndex("Pin");

                    b.HasIndex("Sort");

                    b.ToTable("DashboardMonitor");
                });

            modelBuilder.Entity("Homo.IotApi.Device", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("datetime(6)");

                    b.Property<DateTime?>("DeletedAt")
                        .HasColumnType("datetime(6)");

                    b.Property<DateTime?>("EditedAt")
                        .HasColumnType("datetime(6)");

                    b.Property<string>("Info")
                        .HasColumnType("longtext");

                    b.Property<bool>("IsOfflineNotification")
                        .HasColumnType("tinyint(1)");

                    b.Property<long?>("Microcontroller")
                        .HasColumnType("bigint");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasMaxLength(64)
                        .HasColumnType("varchar(64)");

                    b.Property<string>("OfflineNotificationTarget")
                        .HasColumnType("longtext");

                    b.Property<bool>("Online")
                        .HasMaxLength(128)
                        .HasColumnType("tinyint(128)");

                    b.Property<long>("OwnerId")
                        .HasColumnType("bigint");

                    b.Property<int>("Protocol")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasDefaultValueSql("0");

                    b.Property<long?>("ZoneId")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("CreatedAt");

                    b.HasIndex("DeletedAt");

                    b.HasIndex("Microcontroller");

                    b.HasIndex("Name");

                    b.HasIndex("Online");

                    b.HasIndex("OwnerId");

                    b.HasIndex("ZoneId");

                    b.ToTable("Device");
                });

            modelBuilder.Entity("Homo.IotApi.DeviceActivityLog", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("datetime(6)");

                    b.Property<DateTime?>("DeletedAt")
                        .HasColumnType("datetime(6)");

                    b.Property<long>("DeviceId")
                        .HasColumnType("bigint");

                    b.Property<DateTime?>("EditedAt")
                        .HasColumnType("datetime(6)");

                    b.Property<long>("OwnerId")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("CreatedAt");

                    b.HasIndex("DeletedAt");

                    b.HasIndex("DeviceId");

                    b.HasIndex("OwnerId");

                    b.ToTable("DeviceActivityLog");
                });

            modelBuilder.Entity("Homo.IotApi.DevicePin", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("datetime(6)");

                    b.Property<DateTime?>("DeletedAt")
                        .HasColumnType("datetime(6)");

                    b.Property<long>("DeviceId")
                        .HasColumnType("bigint");

                    b.Property<DateTime?>("EditedAt")
                        .HasColumnType("datetime(6)");

                    b.Property<long?>("EditedBy")
                        .HasColumnType("bigint");

                    b.Property<string>("Name")
                        .HasColumnType("varchar(255)");

                    b.Property<long>("OwnerId")
                        .HasColumnType("bigint");

                    b.Property<string>("Pin")
                        .IsRequired()
                        .HasMaxLength(5)
                        .HasColumnType("varchar(5)");

                    b.Property<string>("PinNumber")
                        .HasMaxLength(5)
                        .HasColumnType("varchar(5)");

                    b.Property<int>("PinType")
                        .HasColumnType("int");

                    b.Property<decimal?>("Value")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("decimal(65,30)")
                        .HasDefaultValueSql("0");

                    b.HasKey("Id");

                    b.HasIndex("CreatedAt");

                    b.HasIndex("DeletedAt");

                    b.HasIndex("DeviceId");

                    b.HasIndex("Name");

                    b.HasIndex("OwnerId");

                    b.HasIndex("PinType");

                    b.HasIndex("Value");

                    b.ToTable("DevicePin");
                });

            modelBuilder.Entity("Homo.IotApi.FirmwareBundleLog", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    b.Property<string>("BundleId")
                        .IsRequired()
                        .HasMaxLength(32)
                        .HasColumnType("varchar(32)");

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("datetime(6)");

                    b.Property<DateTime?>("DeletedAt")
                        .HasColumnType("datetime(6)");

                    b.Property<long>("DeviceId")
                        .HasColumnType("bigint");

                    b.Property<string>("Filename")
                        .HasColumnType("longtext");

                    b.Property<long>("Microcontroller")
                        .HasColumnType("bigint");

                    b.Property<long>("OwnerId")
                        .HasColumnType("bigint");

                    b.Property<int>("Protocol")
                        .HasColumnType("int");

                    b.HasKey("Id");

                    b.HasIndex("BundleId");

                    b.HasIndex("DeviceId");

                    b.HasIndex("OwnerId");

                    b.HasIndex("BundleId", "DeletedAt")
                        .IsUnique();

                    b.ToTable("FirmwareBundleLog");
                });

            modelBuilder.Entity("Homo.IotApi.Log", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("datetime(6)");

                    b.Property<long>("DeviceId")
                        .HasColumnType("bigint");

                    b.Property<string>("Message")
                        .IsRequired()
                        .HasColumnType("longtext");

                    b.HasKey("Id");

                    b.HasIndex("CreatedAt");

                    b.HasIndex("DeviceId");

                    b.ToTable("Log");
                });

            modelBuilder.Entity("Homo.IotApi.Microcontroller", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("datetime(6)");

                    b.Property<long>("CreatedBy")
                        .HasColumnType("bigint");

                    b.Property<DateTime?>("DeletedAt")
                        .HasColumnType("datetime(6)");

                    b.Property<DateTime?>("EditedAt")
                        .HasColumnType("datetime(6)");

                    b.Property<long?>("EditedBy")
                        .HasColumnType("bigint");

                    b.Property<string>("Key")
                        .IsRequired()
                        .HasMaxLength(128)
                        .HasColumnType("varchar(128)");

                    b.Property<string>("Memo")
                        .HasMaxLength(512)
                        .HasColumnType("varchar(512)");

                    b.Property<string>("Pins")
                        .IsRequired()
                        .HasColumnType("longtext");

                    b.Property<string>("SupportedProtocols")
                        .HasMaxLength(1024)
                        .HasColumnType("varchar(1024)");

                    b.HasKey("Id");

                    b.HasIndex("CreatedAt");

                    b.HasIndex("CreatedBy");

                    b.HasIndex("DeletedAt");

                    b.HasIndex("DeletedAt", "Key")
                        .IsUnique();

                    b.ToTable("Microcontroller");
                });

            modelBuilder.Entity("Homo.IotApi.OauthClient", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    b.Property<string>("ClientId")
                        .IsRequired()
                        .HasMaxLength(128)
                        .HasColumnType("varchar(128)");

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("datetime(6)");

                    b.Property<DateTime?>("DeletedAt")
                        .HasColumnType("datetime(6)");

                    b.Property<long?>("DeviceId")
                        .HasColumnType("bigint");

                    b.Property<string>("HashClientSecrets")
                        .IsRequired()
                        .HasMaxLength(4096)
                        .HasColumnType("varchar(4096)");

                    b.Property<long>("OwnerId")
                        .HasColumnType("bigint");

                    b.Property<string>("Salt")
                        .IsRequired()
                        .HasMaxLength(128)
                        .HasColumnType("varchar(128)");

                    b.HasKey("Id");

                    b.HasIndex("ClientId");

                    b.HasIndex("CreatedAt");

                    b.HasIndex("DeviceId");

                    b.HasIndex("OwnerId");

                    b.HasIndex("ClientId", "DeletedAt")
                        .IsUnique();

                    b.HasIndex("OwnerId", "ClientId", "DeletedAt")
                        .IsUnique();

                    b.ToTable("OauthClient");
                });

            modelBuilder.Entity("Homo.IotApi.OauthClientRedirectUri", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("datetime(6)");

                    b.Property<DateTime?>("DeletedAt")
                        .HasColumnType("datetime(6)");

                    b.Property<DateTime?>("EditedAt")
                        .HasColumnType("datetime(6)");

                    b.Property<long>("OauthClientId")
                        .HasColumnType("bigint");

                    b.Property<long>("OwnerId")
                        .HasColumnType("bigint");

                    b.Property<string>("Uri")
                        .IsRequired()
                        .HasMaxLength(512)
                        .HasColumnType("varchar(512)");

                    b.HasKey("Id");

                    b.ToTable("OauthClientRedirectUri");
                });

            modelBuilder.Entity("Homo.IotApi.OauthCode", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    b.Property<string>("ClientId")
                        .IsRequired()
                        .HasMaxLength(128)
                        .HasColumnType("varchar(128)");

                    b.Property<string>("Code")
                        .IsRequired()
                        .HasMaxLength(20)
                        .HasColumnType("varchar(20)");

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("datetime(6)");

                    b.Property<DateTime?>("DeletedAt")
                        .HasColumnType("datetime(6)");

                    b.Property<DateTime?>("EditedAt")
                        .HasColumnType("datetime(6)");

                    b.Property<DateTime>("ExpiredAt")
                        .HasColumnType("datetime(6)");

                    b.HasKey("Id");

                    b.HasIndex("Code");

                    b.ToTable("OauthCode");
                });

            modelBuilder.Entity("Homo.IotApi.Pipeline", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("datetime(6)");

                    b.Property<DateTime?>("DeletedAt")
                        .HasColumnType("datetime(6)");

                    b.Property<DateTime?>("EditedAt")
                        .HasColumnType("datetime(6)");

                    b.Property<long?>("EditedBy")
                        .HasColumnType("bigint");

                    b.Property<int>("FirstPieplineItemType")
                        .HasColumnType("int");

                    b.Property<long?>("FirstPipelineItemDeviceId")
                        .HasColumnType("bigint");

                    b.Property<string>("FirstPipelineItemPin")
                        .HasColumnType("longtext");

                    b.Property<bool>("IsRun")
                        .HasColumnType("tinyint(1)");

                    b.Property<string>("LockBy")
                        .HasColumnType("varchar(255)");

                    b.Property<long>("OwnerId")
                        .HasColumnType("bigint");

                    b.Property<string>("Title")
                        .IsRequired()
                        .HasMaxLength(24)
                        .HasColumnType("varchar(24)");

                    b.HasKey("Id");

                    b.HasIndex("CreatedAt");

                    b.HasIndex("DeletedAt");

                    b.HasIndex("LockBy");

                    b.HasIndex("OwnerId");

                    b.ToTable("Pipeline");
                });

            modelBuilder.Entity("Homo.IotApi.PipelineConnector", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("datetime(6)");

                    b.Property<DateTime?>("DeletedAt")
                        .HasColumnType("datetime(6)");

                    b.Property<long>("DestPipelineItemId")
                        .HasColumnType("bigint");

                    b.Property<DateTime?>("EditedAt")
                        .HasColumnType("datetime(6)");

                    b.Property<long?>("EditedBy")
                        .HasColumnType("bigint");

                    b.Property<long>("OwnerId")
                        .HasColumnType("bigint");

                    b.Property<long>("PipelineId")
                        .HasColumnType("bigint");

                    b.Property<long>("SourcePipelineItemId")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("CreatedAt");

                    b.HasIndex("DeletedAt");

                    b.HasIndex("OwnerId");

                    b.HasIndex("PipelineId");

                    b.ToTable("PipelineConnector");
                });

            modelBuilder.Entity("Homo.IotApi.PipelineExecuteLog", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    b.Property<DateTime>("CreatedAt")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("datetime(6)")
                        .HasDefaultValue(new DateTime(2023, 4, 9, 1, 34, 28, 667, DateTimeKind.Local).AddTicks(4460));

                    b.Property<DateTime?>("DeletedAt")
                        .HasColumnType("datetime(6)");

                    b.Property<DateTime?>("EditedAt")
                        .HasColumnType("datetime(6)");

                    b.Property<bool>("IsEnd")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("tinyint(1)")
                        .HasDefaultValueSql("0");

                    b.Property<bool>("IsHead")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("tinyint(1)")
                        .HasDefaultValueSql("0");

                    b.Property<long>("ItemId")
                        .HasColumnType("bigint");

                    b.Property<string>("Message")
                        .HasColumnType("longtext");

                    b.Property<long>("OwnerId")
                        .HasColumnType("bigint");

                    b.Property<long>("PipelineId")
                        .HasColumnType("bigint");

                    b.Property<string>("Raw")
                        .HasColumnType("longtext");

                    b.HasKey("Id");

                    b.HasIndex("CreatedAt");

                    b.HasIndex("DeletedAt");

                    b.HasIndex("IsEnd");

                    b.HasIndex("IsHead");

                    b.HasIndex("OwnerId");

                    b.HasIndex("PipelineId");

                    b.ToTable("PipelineExecuteLog");
                });

            modelBuilder.Entity("Homo.IotApi.PipelineItem", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("datetime(6)");

                    b.Property<DateTime?>("DeletedAt")
                        .HasColumnType("datetime(6)");

                    b.Property<DateTime?>("EditedAt")
                        .HasColumnType("datetime(6)");

                    b.Property<long?>("EditedBy")
                        .HasColumnType("bigint");

                    b.Property<int>("ItemType")
                        .HasColumnType("int");

                    b.Property<long>("OwnerId")
                        .HasColumnType("bigint");

                    b.Property<long>("PipelineId")
                        .HasColumnType("bigint");

                    b.Property<string>("Point")
                        .IsRequired()
                        .HasColumnType("longtext");

                    b.Property<string>("Title")
                        .HasMaxLength(24)
                        .HasColumnType("varchar(24)");

                    b.Property<string>("Value")
                        .HasColumnType("longtext");

                    b.HasKey("Id");

                    b.HasIndex("CreatedAt");

                    b.HasIndex("DeletedAt");

                    b.HasIndex("OwnerId");

                    b.HasIndex("PipelineId");

                    b.ToTable("PipelineItem");
                });

            modelBuilder.Entity("Homo.IotApi.SensorLog", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("datetime(6)");

                    b.Property<DateTime?>("DeletedAt")
                        .HasColumnType("datetime(6)");

                    b.Property<long>("DeviceId")
                        .HasColumnType("bigint");

                    b.Property<DateTime?>("EditedAt")
                        .HasColumnType("datetime(6)");

                    b.Property<long>("OwnerId")
                        .HasColumnType("bigint");

                    b.Property<string>("Pin")
                        .IsRequired()
                        .HasMaxLength(5)
                        .HasColumnType("varchar(5)");

                    b.Property<decimal?>("Value")
                        .IsRequired()
                        .HasColumnType("decimal(65,30)");

                    b.HasKey("Id");

                    b.HasIndex("CreatedAt");

                    b.HasIndex("DeletedAt");

                    b.HasIndex("DeviceId");

                    b.HasIndex("OwnerId");

                    b.HasIndex("Pin");

                    b.ToTable("SensorLog");
                });

            modelBuilder.Entity("Homo.IotApi.Subscription", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    b.Property<string>("CardKey")
                        .HasMaxLength(64)
                        .HasColumnType("varchar(64)");

                    b.Property<string>("CardToken")
                        .HasMaxLength(67)
                        .HasColumnType("varchar(67)");

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("datetime(6)");

                    b.Property<DateTime?>("DeletedAt")
                        .HasColumnType("datetime(6)");

                    b.Property<DateTime?>("EditedAt")
                        .HasColumnType("datetime(6)");

                    b.Property<DateTime>("EndAt")
                        .HasColumnType("datetime(6)");

                    b.Property<long>("OwnerId")
                        .HasColumnType("bigint");

                    b.Property<int>("PricingPlan")
                        .HasColumnType("int");

                    b.Property<DateTime>("StartAt")
                        .HasColumnType("datetime(6)");

                    b.Property<int>("Status")
                        .HasColumnType("int");

                    b.Property<bool>("StopNextSubscribed")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("tinyint(1)")
                        .HasDefaultValueSql("0");

                    b.Property<long?>("TransactionId")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("CreatedAt");

                    b.HasIndex("DeletedAt");

                    b.HasIndex("EndAt");

                    b.HasIndex("OwnerId");

                    b.HasIndex("PricingPlan");

                    b.HasIndex("StartAt");

                    b.HasIndex("TransactionId");

                    b.ToTable("Subscription");
                });

            modelBuilder.Entity("Homo.IotApi.SystemConfig", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    b.Property<string>("Key")
                        .IsRequired()
                        .HasMaxLength(64)
                        .HasColumnType("varchar(64)");

                    b.Property<string>("Value")
                        .IsRequired()
                        .HasMaxLength(4096)
                        .HasColumnType("varchar(4096)");

                    b.HasKey("Id");

                    b.HasIndex("Key");

                    b.ToTable("SystemConfig");
                });

            modelBuilder.Entity("Homo.IotApi.ThirdPartyPaymentFlow", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("datetime(6)");

                    b.Property<DateTime?>("DeletedAt")
                        .HasColumnType("datetime(6)");

                    b.Property<DateTime?>("EditedAt")
                        .HasColumnType("datetime(6)");

                    b.Property<string>("ExternalTransactionId")
                        .IsRequired()
                        .HasMaxLength(64)
                        .HasColumnType("varchar(64)");

                    b.Property<string>("Raw")
                        .HasColumnType("longtext");

                    b.HasKey("Id");

                    b.HasIndex("CreatedAt");

                    b.HasIndex("DeletedAt");

                    b.HasIndex("ExternalTransactionId");

                    b.ToTable("ThirdPartyPaymentFlow");
                });

            modelBuilder.Entity("Homo.IotApi.Transaction", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    b.Property<decimal>("Amount")
                        .HasColumnType("decimal(65,30)");

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("datetime(6)");

                    b.Property<DateTime?>("DeletedAt")
                        .HasColumnType("datetime(6)");

                    b.Property<DateTime?>("EditedAt")
                        .HasColumnType("datetime(6)");

                    b.Property<string>("ExternalTransactionId")
                        .HasMaxLength(64)
                        .HasColumnType("varchar(64)");

                    b.Property<long>("OwnerId")
                        .HasColumnType("bigint");

                    b.Property<string>("Raw")
                        .HasColumnType("longtext");

                    b.Property<int>("Status")
                        .HasColumnType("int");

                    b.HasKey("Id");

                    b.HasIndex("CreatedAt");

                    b.HasIndex("DeletedAt");

                    b.HasIndex("ExternalTransactionId");

                    b.HasIndex("OwnerId");

                    b.HasIndex("Status");

                    b.ToTable("Transaction");
                });

            modelBuilder.Entity("Homo.IotApi.Zone", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("datetime(6)");

                    b.Property<long>("CreatedBy")
                        .HasColumnType("bigint");

                    b.Property<DateTime?>("DeletedAt")
                        .HasColumnType("datetime(6)");

                    b.Property<DateTime?>("EditedAt")
                        .HasColumnType("datetime(6)");

                    b.Property<long?>("EditedBy")
                        .HasColumnType("bigint");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasMaxLength(64)
                        .HasColumnType("varchar(64)");

                    b.Property<long>("OwnerId")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.ToTable("Zone");
                });

            modelBuilder.Entity("Homo.IotApi.Device", b =>
                {
                    b.HasOne("Homo.IotApi.Zone", "Zone")
                        .WithMany()
                        .HasForeignKey("ZoneId");

                    b.Navigation("Zone");
                });

            modelBuilder.Entity("Homo.IotApi.DevicePin", b =>
                {
                    b.HasOne("Homo.IotApi.Device", "Device")
                        .WithMany()
                        .HasForeignKey("DeviceId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Device");
                });

            modelBuilder.Entity("Homo.IotApi.SensorLog", b =>
                {
                    b.HasOne("Homo.IotApi.Device", "Device")
                        .WithMany()
                        .HasForeignKey("DeviceId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Device");
                });
#pragma warning restore 612, 618
        }
    }
}
