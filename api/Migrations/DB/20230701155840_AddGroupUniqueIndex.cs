using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IotApi.Migrations.DB
{
    public partial class AddGroupUniqueIndex : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_Group_Name_CreatedBy_DeletedAt",
                table: "Group",
                columns: new[] { "Name", "CreatedBy", "DeletedAt" },
                unique: true,
                filter: "[DeletedAt] IS NOT NULL");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Group_Name_CreatedBy_DeletedAt",
                table: "Group");
        }
    }
}
