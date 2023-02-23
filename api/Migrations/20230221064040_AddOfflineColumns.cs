using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IotApi.Migrations
{
    public partial class AddOfflineColumns : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsOfflineNotification",
                table: "Device",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "OfflineNotificationTarget",
                table: "Device",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsOfflineNotification",
                table: "Device");

            migrationBuilder.DropColumn(
                name: "OfflineNotificationTarget",
                table: "Device");
        }
    }
}
