using Microsoft.EntityFrameworkCore.Migrations;

namespace IotApi.Migrations
{
    public partial class TriggerAddNotificationPeriod : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "OwnerId",
                table: "TriggerLog",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<int>(
                name: "Type",
                table: "TriggerLog",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "NotificationPeriod",
                table: "Trigger",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "OwnerId",
                table: "TriggerLog");

            migrationBuilder.DropColumn(
                name: "Type",
                table: "TriggerLog");

            migrationBuilder.DropColumn(
                name: "NotificationPeriod",
                table: "Trigger");
        }
    }
}
