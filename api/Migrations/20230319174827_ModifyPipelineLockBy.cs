using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IotApi.Migrations
{
    public partial class ModifyPipelineLockBy : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "PipelineExecuteLog",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(2023, 3, 20, 1, 48, 27, 361, DateTimeKind.Local).AddTicks(2320),
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)",
                oldDefaultValue: new DateTime(2023, 3, 14, 13, 41, 0, 160, DateTimeKind.Local).AddTicks(8510));

            migrationBuilder.AddColumn<string>(
                name: "LockBy",
                table: "Pipeline",
                type: "varchar(255)",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_Pipeline_LockBy",
                table: "Pipeline",
                column: "LockBy");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Pipeline_LockBy",
                table: "Pipeline");

            migrationBuilder.DropColumn(
                name: "LockBy",
                table: "Pipeline");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "PipelineExecuteLog",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(2023, 3, 14, 13, 41, 0, 160, DateTimeKind.Local).AddTicks(8510),
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)",
                oldDefaultValue: new DateTime(2023, 3, 20, 1, 48, 27, 361, DateTimeKind.Local).AddTicks(2320));
        }
    }
}
