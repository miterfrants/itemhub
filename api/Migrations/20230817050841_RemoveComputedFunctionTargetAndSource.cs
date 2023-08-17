using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IotApi.Migrations
{
    public partial class RemoveComputedFunctionTargetAndSource : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ComputedFunction_Source",
                table: "ComputedFunction");

            migrationBuilder.DropIndex(
                name: "IX_ComputedFunction_Target",
                table: "ComputedFunction");

            migrationBuilder.DropIndex(
                name: "IX_ComputedFunction_UserId_GroupId_DeviceId_Pin_Target_IsDeleted",
                table: "ComputedFunction");

            migrationBuilder.DropIndex(
                name: "IX_ComputedFunction_UserId_GroupId_MonitorId_Target_IsDeleted",
                table: "ComputedFunction");

            migrationBuilder.DropColumn(
                name: "Source",
                table: "ComputedFunction");

            migrationBuilder.DropColumn(
                name: "Target",
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

            migrationBuilder.AddColumn<int>(
                name: "Target",
                table: "ComputedFunction",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_ComputedFunction_Source",
                table: "ComputedFunction",
                column: "Source");

            migrationBuilder.CreateIndex(
                name: "IX_ComputedFunction_Target",
                table: "ComputedFunction",
                column: "Target");

            migrationBuilder.CreateIndex(
                name: "IX_ComputedFunction_UserId_GroupId_DeviceId_Pin_Target_IsDeleted",
                table: "ComputedFunction",
                columns: new[] { "UserId", "GroupId", "DeviceId", "Pin", "Target", "IsDeleted" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ComputedFunction_UserId_GroupId_MonitorId_Target_IsDeleted",
                table: "ComputedFunction",
                columns: new[] { "UserId", "GroupId", "MonitorId", "Target", "IsDeleted" },
                unique: true);
        }
    }
}
