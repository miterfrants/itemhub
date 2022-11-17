using Microsoft.EntityFrameworkCore.Migrations;

namespace IotApi.Migrations
{
    public partial class AddFirmwareProtocol : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_OauthClient_DeletedAt",
                table: "OauthClient");

            migrationBuilder.AddColumn<int>(
                name: "Protocol",
                table: "FirmwareBundleLog",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "Protocol",
                table: "Device",
                type: "int",
                nullable: false,
                defaultValueSql: "0");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Protocol",
                table: "FirmwareBundleLog");

            migrationBuilder.DropColumn(
                name: "Protocol",
                table: "Device");

            migrationBuilder.CreateIndex(
                name: "IX_OauthClient_DeletedAt",
                table: "OauthClient",
                column: "DeletedAt");
        }
    }
}
