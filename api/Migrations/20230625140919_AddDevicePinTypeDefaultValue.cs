using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IotApi.Migrations
{
    public partial class AddDevicePinTypeDefaultValue : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "PipelineExecuteLog",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(2023, 6, 25, 22, 9, 19, 149, DateTimeKind.Local).AddTicks(3200),
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)",
                oldDefaultValue: new DateTime(2023, 5, 21, 6, 50, 12, 16, DateTimeKind.Local).AddTicks(8730));

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "DeviceUploadedImage",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(2023, 6, 25, 22, 9, 19, 150, DateTimeKind.Local).AddTicks(7850),
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)",
                oldDefaultValue: new DateTime(2023, 5, 21, 6, 50, 12, 17, DateTimeKind.Local).AddTicks(310));

            migrationBuilder.AlterColumn<int>(
                name: "PinType",
                table: "DevicePin",
                type: "int",
                nullable: false,
                defaultValueSql: "0",
                oldClrType: typeof(int),
                oldType: "int");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "PipelineExecuteLog",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(2023, 5, 21, 6, 50, 12, 16, DateTimeKind.Local).AddTicks(8730),
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)",
                oldDefaultValue: new DateTime(2023, 6, 25, 22, 9, 19, 149, DateTimeKind.Local).AddTicks(3200));

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "DeviceUploadedImage",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(2023, 5, 21, 6, 50, 12, 17, DateTimeKind.Local).AddTicks(310),
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)",
                oldDefaultValue: new DateTime(2023, 6, 25, 22, 9, 19, 150, DateTimeKind.Local).AddTicks(7850));

            migrationBuilder.AlterColumn<int>(
                name: "PinType",
                table: "DevicePin",
                type: "int",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int",
                oldDefaultValueSql: "0");
        }
    }
}
