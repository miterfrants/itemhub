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
        public virtual DbSet<Invitation> Invitation { get; set; }
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

            modelBuilder.Entity<Invitation>(entity =>
            {
                entity.HasIndex(p => new { p.Status });
                entity.HasIndex(p => new { p.Email, p.GroupId, p.DeletedAt }).IsUnique();
                entity.HasIndex(p => new { p.DeletedAt });
                entity.HasIndex(p => new { p.CreatedBy });
                entity.Property(b => b.Status).HasDefaultValue(INVITATION_STATUS.PENDING);
            });

            modelBuilder.Entity<Group>(entity =>
            {
                entity.Property(e => e.IsDeleted)
                        .HasComputedColumnSql("IF(`DeletedAt` IS NULL, 0, NULL)");
                entity.HasIndex(x => new { x.IsDeleted, x.Name }).IsUnique();
            });

            modelBuilder.Entity<Invitation>(entity =>
            {
                entity.HasIndex(p => new { p.Status });
                entity.Property(e => e.IsDeleted)
                        .HasComputedColumnSql("IF(`DeletedAt` IS NULL, 0, NULL)");
                entity.HasIndex(p => new { p.Email, p.GroupId, p.IsDeleted }).IsUnique();
                entity.HasIndex(p => new { p.DeletedAt });
                entity.HasIndex(p => new { p.CreatedBy });
                entity.Property(b => b.Status).HasDefaultValue(INVITATION_STATUS.PENDING);
            });

            modelBuilder.Entity<RelationOfGroupAndUser>(entity =>
            {
                entity.Property(e => e.IsDeleted)
                        .HasComputedColumnSql("IF(`DeletedAt` IS NULL, 0, NULL)");
                entity.HasIndex(p => new { p.GroupId });
                entity.HasIndex(p => new { p.UserId });
                entity.HasIndex(p => new { p.GroupId, p.UserId, p.IsDeleted }).IsUnique();
            });

            OnModelCreatingPartial(modelBuilder);
        }

        partial void OnModelCreatingPartial(ModelBuilder modelBuilder);


    }
}