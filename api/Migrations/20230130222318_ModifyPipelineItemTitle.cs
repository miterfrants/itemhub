using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IotApi.Migrations
{
    public partial class ModifyPipelineItemTitle : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Title",
                table: "PipelineItem",
                type: "varchar(24)",
                maxLength: 24,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "varchar(24)",
                oldMaxLength: 24)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "PipelineItem",
                keyColumn: "Title",
                keyValue: null,
                column: "Title",
                value: "");

            migrationBuilder.AlterColumn<string>(
                name: "Title",
                table: "PipelineItem",
                type: "varchar(24)",
                maxLength: 24,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "varchar(24)",
                oldMaxLength: 24,
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");
        }
    }
}
