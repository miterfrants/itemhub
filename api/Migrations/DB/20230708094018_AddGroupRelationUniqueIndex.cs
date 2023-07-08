using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IotApi.Migrations.DB
{
    public partial class AddGroupRelationUniqueIndex : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "RelationOfGroupAndUser",
                type: "tinyint(1)",
                nullable: true,
                computedColumnSql: "IF(`DeletedAt` IS NULL, 0, NULL)");

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "Invitation",
                type: "tinyint(1)",
                nullable: true,
                computedColumnSql: "IF(`DeletedAt` IS NULL, 0, NULL)");

            migrationBuilder.CreateIndex(
                name: "IX_RelationOfGroupAndUser_GroupId_UserId_IsDeleted",
                table: "RelationOfGroupAndUser",
                columns: new[] { "GroupId", "UserId", "IsDeleted" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Invitation_Email_GroupId_IsDeleted",
                table: "Invitation",
                columns: new[] { "Email", "GroupId", "IsDeleted" },
                unique: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_RelationOfGroupAndUser_GroupId_UserId_IsDeleted",
                table: "RelationOfGroupAndUser");

            migrationBuilder.DropIndex(
                name: "IX_Invitation_Email_GroupId_IsDeleted",
                table: "Invitation");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "RelationOfGroupAndUser");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "Invitation");
        }
    }
}
