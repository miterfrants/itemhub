using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IotApi.Migrations.DB
{
    public partial class AddInvitationIndex : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Invitation_Email",
                table: "Invitation");

            migrationBuilder.CreateIndex(
                name: "IX_Invitation_Email_GroupId_DeletedAt",
                table: "Invitation",
                columns: new[] { "Email", "GroupId", "DeletedAt" },
                unique: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Invitation_Email_GroupId_DeletedAt",
                table: "Invitation");

            migrationBuilder.CreateIndex(
                name: "IX_Invitation_Email",
                table: "Invitation",
                column: "Email");
        }
    }
}
