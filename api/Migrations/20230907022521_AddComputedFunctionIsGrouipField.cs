using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IotApi.Migrations
{
    public partial class AddComputedFunctionIsGrouipField : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ComputedFunction_UserId_GroupId_DeviceId_Pin_Target_IsDeleted",
                table: "ComputedFunction");

            migrationBuilder.AddColumn<bool>(
                name: "IsGroup",
                table: "ComputedFunction",
                type: "tinyint(1)",
                nullable: true,
                computedColumnSql: "IF(`GroupId` IS NULL, 0, 1)");

            migrationBuilder.CreateIndex(
                name: "IX_ComputedFunction_UserId_IsGroup_DeviceId_Pin_Target_IsDeleted",
                table: "ComputedFunction",
                columns: new[] { "UserId", "IsGroup", "DeviceId", "Pin", "Target", "IsDeleted" },
                unique: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ComputedFunction_UserId_IsGroup_DeviceId_Pin_Target_IsDeleted",
                table: "ComputedFunction");

            migrationBuilder.DropColumn(
                name: "IsGroup",
                table: "ComputedFunction");

            migrationBuilder.CreateIndex(
                name: "IX_ComputedFunction_UserId_GroupId_DeviceId_Pin_Target_IsDeleted",
                table: "ComputedFunction",
                columns: new[] { "UserId", "GroupId", "DeviceId", "Pin", "Target", "IsDeleted" },
                unique: true);
        }
    }
}
