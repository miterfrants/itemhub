using System;
using System.Data;
using System.Data.Common;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;

namespace Homo.AuthApi
{
    public partial class DBContext : DbContext
    {
        public DBContext() { }

        public DBContext(DbContextOptions<DBContext> options) : base(options) { }
        public virtual DbSet<User> User { get; set; }
        public virtual DbSet<VerifyCode> VerifyCode { get; set; }
        public virtual DbSet<RelationOfGroupAndUser> RelationOfGroupAndUser { get; set; }
        public virtual DbSet<Group> Group { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>(entity =>
            {
                entity.HasIndex(p => new { p.Email, p.DeletedAt }).IsUnique();
                entity.HasIndex(p => new { p.HashPhone });
                entity.Property(b => b.IsOverSubscriptionPlan)
                    .HasDefaultValueSql("0");
                entity.Property(b => b.SendOverPlanNotificationCount)
                    .HasDefaultValueSql("0");
                entity.Property(b => b.IsEarlyBird)
                    .HasDefaultValueSql("0");
            });

            modelBuilder.Entity<VerifyCode>(entity =>
            {
                entity.HasIndex(p => new { p.Email });
                entity.HasIndex(p => new { p.Phone });
                entity.HasIndex(p => new { p.IsUsed });
                entity.HasIndex(p => new { p.Code });
                entity.HasIndex(p => new { p.IsTwoFactorAuth });
            });

            OnModelCreatingPartial(modelBuilder);
        }

        partial void OnModelCreatingPartial(ModelBuilder modelBuilder);


    }
}