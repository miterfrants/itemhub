using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IotApi.Migrations
{
    public partial class ModifyPipelineSchema : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "NextIds",
                table: "PipelineItem");

            migrationBuilder.DropColumn(
                name: "Title",
                table: "Pipeline");

            migrationBuilder.AddColumn<string>(
                name: "CurrentPipelineItemIds",
                table: "Pipeline",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CurrentPipelineItemIds",
                table: "Pipeline");

            migrationBuilder.AddColumn<string>(
                name: "NextIds",
                table: "PipelineItem",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "Title",
                table: "Pipeline",
                type: "varchar(24)",
                maxLength: 24,
                nullable: false,
                defaultValue: "")
                .Annotation("MySql:CharSet", "utf8mb4");
        }
    }
}
