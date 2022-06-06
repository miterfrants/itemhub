using Microsoft.EntityFrameworkCore.Migrations;

namespace IotApi.Migrations.DB
{
    public partial class IsDeletedEmailUniqueIndex : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_User_Email",
                table: "User");

            migrationBuilder.CreateIndex(
                name: "IX_User_Email_DeletedAt",
                table: "User",
                columns: new[] { "Email", "DeletedAt" },
                unique: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_User_Email_DeletedAt",
                table: "User");

            migrationBuilder.CreateIndex(
                name: "IX_User_Email",
                table: "User",
                column: "Email",
                unique: true);
        }
    }
}
