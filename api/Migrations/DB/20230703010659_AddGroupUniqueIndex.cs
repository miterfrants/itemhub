using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IotApi.Migrations.DB
{
    public partial class AddGroupUniqueIndex : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "Group",
                type: "tinyint(1)",
                nullable: true,
                computedColumnSql: "IF(`DeletedAt` IS NULL, 0, NULL)");

            migrationBuilder.CreateIndex(
                name: "IX_Group_IsDeleted_Name",
                table: "Group",
                columns: new[] { "IsDeleted", "Name" },
                unique: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Group_IsDeleted_Name",
                table: "Group");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "Group");
        }
    }
}
