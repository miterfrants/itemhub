using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IotApi.Migrations
{
    public partial class ModifyPipelineItem : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "NextIds",
                table: "PipelineItem",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "Point",
                table: "PipelineItem",
                type: "longtext",
                nullable: false)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_PipelineItem_CreatedAt",
                table: "PipelineItem",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_PipelineItem_DeletedAt",
                table: "PipelineItem",
                column: "DeletedAt");

            migrationBuilder.CreateIndex(
                name: "IX_PipelineItem_OwnerId",
                table: "PipelineItem",
                column: "OwnerId");

            migrationBuilder.CreateIndex(
                name: "IX_PipelineItem_PipelineId",
                table: "PipelineItem",
                column: "PipelineId");

            migrationBuilder.CreateIndex(
                name: "IX_Pipeline_CreatedAt",
                table: "Pipeline",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_Pipeline_DeletedAt",
                table: "Pipeline",
                column: "DeletedAt");

            migrationBuilder.CreateIndex(
                name: "IX_Pipeline_OwnerId",
                table: "Pipeline",
                column: "OwnerId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_PipelineItem_CreatedAt",
                table: "PipelineItem");

            migrationBuilder.DropIndex(
                name: "IX_PipelineItem_DeletedAt",
                table: "PipelineItem");

            migrationBuilder.DropIndex(
                name: "IX_PipelineItem_OwnerId",
                table: "PipelineItem");

            migrationBuilder.DropIndex(
                name: "IX_PipelineItem_PipelineId",
                table: "PipelineItem");

            migrationBuilder.DropIndex(
                name: "IX_Pipeline_CreatedAt",
                table: "Pipeline");

            migrationBuilder.DropIndex(
                name: "IX_Pipeline_DeletedAt",
                table: "Pipeline");

            migrationBuilder.DropIndex(
                name: "IX_Pipeline_OwnerId",
                table: "Pipeline");

            migrationBuilder.DropColumn(
                name: "NextIds",
                table: "PipelineItem");

            migrationBuilder.DropColumn(
                name: "Point",
                table: "PipelineItem");
        }
    }
}
