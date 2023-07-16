using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IotApi.Migrations
{
    public partial class AddDashboardMonitor : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("UPDATE `DevicePin` SET `DevicePin`.`Value` = 0 WHERE `DevicePin`.`Value` IS NULL");
            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "PipelineExecuteLog",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(2023, 7, 13, 2, 33, 57, 219, DateTimeKind.Local).AddTicks(4040),
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)",
                oldDefaultValue: new DateTime(2023, 7, 10, 0, 12, 28, 556, DateTimeKind.Local).AddTicks(6940));

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "DeviceUploadedImage",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(2023, 7, 13, 2, 33, 57, 219, DateTimeKind.Local).AddTicks(5610),
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)",
                oldDefaultValue: new DateTime(2023, 7, 10, 0, 12, 28, 556, DateTimeKind.Local).AddTicks(8350));

            migrationBuilder.AlterColumn<decimal>(
                name: "Value",
                table: "DevicePin",
                type: "decimal(65,30)",
                nullable: false,
                defaultValueSql: "0",
                oldClrType: typeof(decimal),
                oldType: "decimal(65,30)",
                oldNullable: true,
                oldDefaultValueSql: "0");

            migrationBuilder.AddColumn<long>(
                name: "GroupId",
                table: "DashboardMonitor",
                type: "bigint",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "GroupId",
                table: "DashboardMonitor");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "PipelineExecuteLog",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(2023, 7, 10, 0, 12, 28, 556, DateTimeKind.Local).AddTicks(6940),
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)",
                oldDefaultValue: new DateTime(2023, 7, 13, 2, 33, 57, 219, DateTimeKind.Local).AddTicks(4040));

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "DeviceUploadedImage",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(2023, 7, 10, 0, 12, 28, 556, DateTimeKind.Local).AddTicks(8350),
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)",
                oldDefaultValue: new DateTime(2023, 7, 13, 2, 33, 57, 219, DateTimeKind.Local).AddTicks(5610));

            migrationBuilder.AlterColumn<decimal>(
                name: "Value",
                table: "DevicePin",
                type: "decimal(65,30)",
                nullable: true,
                defaultValueSql: "0",
                oldClrType: typeof(decimal),
                oldType: "decimal(65,30)",
                oldDefaultValueSql: "0");
        }
    }
}
