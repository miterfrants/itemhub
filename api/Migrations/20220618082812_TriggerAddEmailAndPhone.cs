using Microsoft.EntityFrameworkCore.Migrations;

namespace IotApi.Migrations
{
    public partial class TriggerAddEmailAndPhone : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Email",
                table: "Trigger",
                type: "varchar(255)",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "Phone",
                table: "Trigger",
                type: "varchar(255)",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_Trigger_Email",
                table: "Trigger",
                column: "Email");

            migrationBuilder.CreateIndex(
                name: "IX_Trigger_Phone",
                table: "Trigger",
                column: "Phone");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Trigger_Email",
                table: "Trigger");

            migrationBuilder.DropIndex(
                name: "IX_Trigger_Phone",
                table: "Trigger");

            migrationBuilder.DropColumn(
                name: "Email",
                table: "Trigger");

            migrationBuilder.DropColumn(
                name: "Phone",
                table: "Trigger");
        }
    }
}
