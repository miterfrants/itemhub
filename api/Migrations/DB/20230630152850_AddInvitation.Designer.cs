﻿// <auto-generated />
using System;
using Homo.AuthApi;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

#nullable disable

namespace IotApi.Migrations.DB
{
    [DbContext(typeof(DBContext))]
    [Migration("20230630152850_AddInvitation")]
    partial class AddInvitation
    {
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "6.0.14")
                .HasAnnotation("Relational:MaxIdentifierLength", 64);

            modelBuilder.Entity("Homo.AuthApi.Group", b =>
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
                        .HasMaxLength(128)
                        .HasColumnType("varchar(128)");

                    b.Property<string>("Roles")
                        .IsRequired()
                        .HasMaxLength(512)
                        .HasColumnType("varchar(512)");

                    b.HasKey("Id");

                    b.ToTable("Group");
                });

            modelBuilder.Entity("Homo.AuthApi.Invitation", b =>
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

                    b.Property<string>("Email")
                        .IsRequired()
                        .HasMaxLength(128)
                        .HasColumnType("varchar(128)");

                    b.Property<long>("GroupId")
                        .HasColumnType("bigint");

                    b.Property<int>("Status")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasDefaultValue(0);

                    b.Property<string>("Token")
                        .HasColumnType("longtext");

                    b.HasKey("Id");

                    b.HasIndex("CreatedBy");

                    b.HasIndex("DeletedAt");

                    b.HasIndex("Email");

                    b.HasIndex("Status");

                    b.ToTable("Invitation");
                });

            modelBuilder.Entity("Homo.AuthApi.RelationOfGroupAndUser", b =>
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

                    b.Property<long>("GroupId")
                        .HasColumnType("bigint");

                    b.Property<long>("UserId")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.ToTable("RelationOfGroupAndUser");
                });

            modelBuilder.Entity("Homo.AuthApi.User", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    b.Property<DateTime?>("Birthday")
                        .HasColumnType("datetime(6)");

                    b.Property<string>("City")
                        .HasMaxLength(64)
                        .HasColumnType("varchar(64)");

                    b.Property<string>("County")
                        .HasMaxLength(64)
                        .HasColumnType("varchar(64)");

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("datetime(6)");

                    b.Property<long?>("CreatedBy")
                        .HasColumnType("bigint");

                    b.Property<DateTime?>("DeletedAt")
                        .HasColumnType("datetime(6)");

                    b.Property<DateTime?>("EditedAt")
                        .HasColumnType("datetime(6)");

                    b.Property<long?>("EditedBy")
                        .HasColumnType("bigint");

                    b.Property<string>("Email")
                        .IsRequired()
                        .HasMaxLength(64)
                        .HasColumnType("varchar(64)");

                    b.Property<string>("EncryptAddress")
                        .HasColumnType("longtext");

                    b.Property<string>("EncryptPhone")
                        .HasColumnType("longtext");

                    b.Property<string>("FacebookSub")
                        .HasMaxLength(128)
                        .HasColumnType("varchar(128)");

                    b.Property<string>("FbSubDeletionConfirmCode")
                        .HasMaxLength(32)
                        .HasColumnType("varchar(32)");

                    b.Property<string>("FirstName")
                        .HasMaxLength(64)
                        .HasColumnType("varchar(64)");

                    b.Property<DateTime?>("ForgotPasswordAt")
                        .HasColumnType("datetime(6)");

                    b.Property<byte?>("Gender")
                        .HasMaxLength(1)
                        .HasColumnType("tinyint unsigned");

                    b.Property<string>("GoogleSub")
                        .HasMaxLength(128)
                        .HasColumnType("varchar(128)");

                    b.Property<string>("Hash")
                        .HasMaxLength(512)
                        .HasColumnType("varchar(512)");

                    b.Property<string>("HashPhone")
                        .HasColumnType("varchar(255)");

                    b.Property<bool>("IsEarlyBird")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("tinyint(1)")
                        .HasDefaultValueSql("0");

                    b.Property<bool?>("IsManager")
                        .HasColumnType("tinyint(1)");

                    b.Property<bool?>("IsOverSubscriptionPlan")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("tinyint(1)")
                        .HasDefaultValueSql("0");

                    b.Property<string>("LastName")
                        .HasMaxLength(64)
                        .HasColumnType("varchar(64)");

                    b.Property<string>("LineSub")
                        .HasMaxLength(128)
                        .HasColumnType("varchar(128)");

                    b.Property<string>("Profile")
                        .HasMaxLength(512)
                        .HasColumnType("varchar(512)");

                    b.Property<string>("PseudonymousAddress")
                        .HasColumnType("longtext");

                    b.Property<string>("PseudonymousPhone")
                        .HasMaxLength(20)
                        .HasColumnType("varchar(20)");

                    b.Property<string>("Salt")
                        .HasMaxLength(512)
                        .HasColumnType("varchar(512)");

                    b.Property<DateTime?>("SendOverPlanNotificationAt")
                        .HasColumnType("datetime(6)");

                    b.Property<int>("SendOverPlanNotificationCount")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasDefaultValueSql("0");

                    b.Property<bool>("Status")
                        .HasColumnType("tinyint(1)");

                    b.Property<string>("Username")
                        .HasMaxLength(128)
                        .HasColumnType("varchar(128)");

                    b.Property<string>("Zip")
                        .HasMaxLength(10)
                        .HasColumnType("varchar(10)");

                    b.HasKey("Id");

                    b.HasIndex("HashPhone");

                    b.HasIndex("Email", "DeletedAt")
                        .IsUnique();

                    b.ToTable("User");
                });

            modelBuilder.Entity("Homo.AuthApi.VerifyCode", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    b.Property<string>("Code")
                        .IsRequired()
                        .HasMaxLength(12)
                        .HasColumnType("varchar(12)");

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("datetime(6)");

                    b.Property<string>("Email")
                        .HasColumnType("varchar(255)");

                    b.Property<DateTime>("Expiration")
                        .HasColumnType("datetime(6)");

                    b.Property<string>("Ip")
                        .HasMaxLength(128)
                        .HasColumnType("varchar(128)");

                    b.Property<bool?>("IsTwoFactorAuth")
                        .HasColumnType("tinyint(1)");

                    b.Property<bool?>("IsUsed")
                        .HasColumnType("tinyint(1)");

                    b.Property<string>("Msgid")
                        .HasColumnType("longtext");

                    b.Property<string>("Phone")
                        .HasColumnType("varchar(255)");

                    b.HasKey("Id");

                    b.HasIndex("Code");

                    b.HasIndex("Email");

                    b.HasIndex("IsTwoFactorAuth");

                    b.HasIndex("IsUsed");

                    b.HasIndex("Phone");

                    b.ToTable("VerifyCode");
                });
#pragma warning restore 612, 618
        }
    }
}
