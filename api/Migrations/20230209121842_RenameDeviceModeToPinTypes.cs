using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IotApi.Migrations
{
    public partial class RenameDeviceModeToPinTypes : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Mode",
                table: "DevicePin",
                newName: "PinType");

            migrationBuilder.RenameIndex(
                name: "IX_DevicePin_Mode",
                table: "DevicePin",
                newName: "IX_DevicePin_PinType");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "PinType",
                table: "DevicePin",
                newName: "Mode");

            migrationBuilder.RenameIndex(
                name: "IX_DevicePin_PinType",
                table: "DevicePin",
                newName: "IX_DevicePin_Mode");
        }
    }
}
