using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IotApi.Migrations
{
    public partial class ModifyPipelineSchemaV2 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Title",
                table: "Pipeline",
                type: "varchar(24)",
                maxLength: 24,
                nullable: false,
                defaultValue: "")
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Title",
                table: "Pipeline");
        }
    }
}
