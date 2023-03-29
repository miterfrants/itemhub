using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IotApi.Migrations
{
    public partial class UpdatePipelineExecuteLog : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CurrentPipelineId",
                table: "PipelineExecuteLog");

            migrationBuilder.RenameColumn(
                name: "Log",
                table: "PipelineExecuteLog",
                newName: "Raw");

            migrationBuilder.RenameColumn(
                name: "IsCompleted",
                table: "PipelineExecuteLog",
                newName: "IsHead");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "PipelineExecuteLog",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(2023, 3, 14, 13, 41, 0, 160, DateTimeKind.Local).AddTicks(8510),
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)",
                oldDefaultValue: new DateTime(2023, 2, 27, 0, 6, 44, 561, DateTimeKind.Local).AddTicks(8540));

            migrationBuilder.AddColumn<bool>(
                name: "IsEnd",
                table: "PipelineExecuteLog",
                type: "tinyint(1)",
                nullable: false,
                defaultValueSql: "0");

            migrationBuilder.AddColumn<long>(
                name: "ItemId",
                table: "PipelineExecuteLog",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<string>(
                name: "Message",
                table: "PipelineExecuteLog",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<long>(
                name: "OwnerId",
                table: "PipelineExecuteLog",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.CreateIndex(
                name: "IX_PipelineExecuteLog_IsEnd",
                table: "PipelineExecuteLog",
                column: "IsEnd");

            migrationBuilder.CreateIndex(
                name: "IX_PipelineExecuteLog_IsHead",
                table: "PipelineExecuteLog",
                column: "IsHead");

            migrationBuilder.CreateIndex(
                name: "IX_PipelineExecuteLog_OwnerId",
                table: "PipelineExecuteLog",
                column: "OwnerId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_PipelineExecuteLog_IsEnd",
                table: "PipelineExecuteLog");

            migrationBuilder.DropIndex(
                name: "IX_PipelineExecuteLog_IsHead",
                table: "PipelineExecuteLog");

            migrationBuilder.DropIndex(
                name: "IX_PipelineExecuteLog_OwnerId",
                table: "PipelineExecuteLog");

            migrationBuilder.DropColumn(
                name: "IsEnd",
                table: "PipelineExecuteLog");

            migrationBuilder.DropColumn(
                name: "ItemId",
                table: "PipelineExecuteLog");

            migrationBuilder.DropColumn(
                name: "Message",
                table: "PipelineExecuteLog");

            migrationBuilder.DropColumn(
                name: "OwnerId",
                table: "PipelineExecuteLog");

            migrationBuilder.RenameColumn(
                name: "Raw",
                table: "PipelineExecuteLog",
                newName: "Log");

            migrationBuilder.RenameColumn(
                name: "IsHead",
                table: "PipelineExecuteLog",
                newName: "IsCompleted");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "PipelineExecuteLog",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(2023, 2, 27, 0, 6, 44, 561, DateTimeKind.Local).AddTicks(8540),
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)",
                oldDefaultValue: new DateTime(2023, 3, 14, 13, 41, 0, 160, DateTimeKind.Local).AddTicks(8510));

            migrationBuilder.AddColumn<long>(
                name: "CurrentPipelineId",
                table: "PipelineExecuteLog",
                type: "bigint",
                nullable: true);
        }
    }
}
