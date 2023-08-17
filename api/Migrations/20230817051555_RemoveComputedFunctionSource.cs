using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IotApi.Migrations
{
    public partial class RemoveComputedFunctionSource : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ComputedFunction_Source",
                table: "ComputedFunction");

            migrationBuilder.DropColumn(
                name: "Source",
                table: "ComputedFunction");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Source",
                table: "ComputedFunction",
                type: "int",
                nullable: true,
                defaultValueSql: "0");

            migrationBuilder.CreateIndex(
                name: "IX_ComputedFunction_Source",
                table: "ComputedFunction",
                column: "Source");
        }
    }
}
