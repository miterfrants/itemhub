using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IotApi.Migrations
{
    public partial class ChangeComputedFunctionSourceToComputedColumn : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Source",
                table: "ComputedFunction",
                type: "int",
                nullable: false,
                computedColumnSql: "IF(`SourceDeviceId` IS NULL, 0, 1)");

            migrationBuilder.CreateIndex(
                name: "IX_ComputedFunction_Source",
                table: "ComputedFunction",
                column: "Source");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ComputedFunction_Source",
                table: "ComputedFunction");

            migrationBuilder.DropColumn(
                name: "Source",
                table: "ComputedFunction");
        }
    }
}
