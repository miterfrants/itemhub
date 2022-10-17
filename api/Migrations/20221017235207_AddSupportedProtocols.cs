using Microsoft.EntityFrameworkCore.Migrations;

namespace IotApi.Migrations
{
    public partial class AddSupportedProtocols : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "SupportedProtocols",
                table: "Microcontroller",
                type: "varchar(1024)",
                maxLength: 1024,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.Sql("UPDATE Microcontroller SET Microcontroller.SupportedProtocols = '[\"http\"]' WHERE `Key` != 'ESP_01S'");
            migrationBuilder.Sql("UPDATE Microcontroller SET Microcontroller.SupportedProtocols = '[\"http\",\"mqtt\"]' WHERE `Key` = 'ESP_01S'");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SupportedProtocols",
                table: "Microcontroller");
        }
    }
}
