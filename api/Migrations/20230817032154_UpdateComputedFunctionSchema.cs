using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IotApi.Migrations
{
    public partial class UpdateComputedFunctionSchema : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Source",
                table: "ComputedFunction",
                type: "int",
                nullable: true,
                defaultValueSql: "0");

            migrationBuilder.AddColumn<long>(
                name: "SourceDeviceId",
                table: "ComputedFunction",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SourcePin",
                table: "ComputedFunction",
                type: "varchar(5)",
                maxLength: 5,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_ComputedFunction_Source",
                table: "ComputedFunction",
                column: "Source");

            migrationBuilder.CreateIndex(
                name: "IX_ComputedFunction_SourceDeviceId_SourcePin",
                table: "ComputedFunction",
                columns: new[] { "SourceDeviceId", "SourcePin" });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ComputedFunction_Source",
                table: "ComputedFunction");

            migrationBuilder.DropIndex(
                name: "IX_ComputedFunction_SourceDeviceId_SourcePin",
                table: "ComputedFunction");

            migrationBuilder.DropColumn(
                name: "Source",
                table: "ComputedFunction");

            migrationBuilder.DropColumn(
                name: "SourceDeviceId",
                table: "ComputedFunction");

            migrationBuilder.DropColumn(
                name: "SourcePin",
                table: "ComputedFunction");
        }
    }
}
