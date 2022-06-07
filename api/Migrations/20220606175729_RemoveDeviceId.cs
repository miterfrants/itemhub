using Microsoft.EntityFrameworkCore.Migrations;

namespace IotApi.Migrations
{
    public partial class RemoveDeviceId : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Device_DeviceId",
                table: "Device");

            migrationBuilder.DropColumn(
                name: "DeviceId",
                table: "Device");

            migrationBuilder.AlterColumn<bool>(
                name: "Online",
                table: "Device",
                type: "tinyint(128)",
                maxLength: 128,
                nullable: false,
                oldClrType: typeof(bool),
                oldType: "tinyint(1)");

            migrationBuilder.CreateIndex(
                name: "IX_Device_Id",
                table: "Device",
                column: "Id");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Device_Id",
                table: "Device");

            migrationBuilder.AlterColumn<bool>(
                name: "Online",
                table: "Device",
                type: "tinyint(1)",
                nullable: false,
                oldClrType: typeof(bool),
                oldType: "tinyint(128)",
                oldMaxLength: 128);

            migrationBuilder.AddColumn<string>(
                name: "DeviceId",
                table: "Device",
                type: "varchar(128)",
                maxLength: 128,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_Device_DeviceId",
                table: "Device",
                column: "DeviceId");
        }
    }
}
