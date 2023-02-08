using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IotApi.Migrations
{
    public partial class AddPipelineConnector : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "PipelineConnector",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    PipelineId = table.Column<long>(type: "bigint", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    EditedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    OwnerId = table.Column<long>(type: "bigint", nullable: false),
                    EditedBy = table.Column<long>(type: "bigint", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    SourcePipelineItemId = table.Column<long>(type: "bigint", nullable: false),
                    DestPipelineItemId = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PipelineConnector", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_PipelineConnector_CreatedAt",
                table: "PipelineConnector",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_PipelineConnector_DeletedAt",
                table: "PipelineConnector",
                column: "DeletedAt");

            migrationBuilder.CreateIndex(
                name: "IX_PipelineConnector_OwnerId",
                table: "PipelineConnector",
                column: "OwnerId");

            migrationBuilder.CreateIndex(
                name: "IX_PipelineConnector_PipelineId",
                table: "PipelineConnector",
                column: "PipelineId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PipelineConnector");
        }
    }
}
