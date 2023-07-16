using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IotApi.Migrations.DB
{
    public partial class AddRelationGroupAndUserUniqueIndex : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_RelationOfGroupAndUser_GroupId",
                table: "RelationOfGroupAndUser",
                column: "GroupId");

            migrationBuilder.CreateIndex(
                name: "IX_RelationOfGroupAndUser_UserId",
                table: "RelationOfGroupAndUser",
                column: "UserId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_RelationOfGroupAndUser_GroupId",
                table: "RelationOfGroupAndUser");

            migrationBuilder.DropIndex(
                name: "IX_RelationOfGroupAndUser_UserId",
                table: "RelationOfGroupAndUser");
        }
    }
}
