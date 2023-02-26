using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IotApi.Migrations
{
    public partial class ModifyPipelineExecuteLog : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "PipelineExecuteLog",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    PipelineId = table.Column<long>(type: "bigint", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false, defaultValue: new DateTime(2023, 2, 27, 0, 6, 44, 561, DateTimeKind.Local).AddTicks(8540)),
                    EditedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    CurrentPipelineId = table.Column<long>(type: "bigint", nullable: true),
                    IsCompleted = table.Column<bool>(type: "tinyint(1)", nullable: false, defaultValueSql: "0"),
                    Log = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PipelineExecuteLog", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_PipelineExecuteLog_CreatedAt",
                table: "PipelineExecuteLog",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_PipelineExecuteLog_DeletedAt",
                table: "PipelineExecuteLog",
                column: "DeletedAt");

            migrationBuilder.CreateIndex(
                name: "IX_PipelineExecuteLog_PipelineId",
                table: "PipelineExecuteLog",
                column: "PipelineId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PipelineExecuteLog");
        }
    }
}
