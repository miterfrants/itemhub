using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IotApi.Migrations
{
    public partial class AddPiplelineTypeLog : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "LogType",
                table: "Log",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_PipelineExecuteLog_ItemId",
                table: "PipelineExecuteLog",
                column: "ItemId");

            migrationBuilder.CreateIndex(
                name: "IX_Log_LogType",
                table: "Log",
                column: "LogType");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PipelineExecuteLog_PipelineItem_ItemId",
                table: "PipelineExecuteLog");

            migrationBuilder.DropIndex(
                name: "IX_PipelineExecuteLog_ItemId",
                table: "PipelineExecuteLog");

            migrationBuilder.DropIndex(
                name: "IX_Log_LogType",
                table: "Log");

            migrationBuilder.DropColumn(
                name: "LogType",
                table: "Log");
        }
    }
}
