using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IotApi.Migrations
{
    public partial class UpdateComputedFunction : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "PipelineExecuteLog",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(2023, 8, 11, 10, 52, 50, 629, DateTimeKind.Local).AddTicks(3220),
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)",
                oldDefaultValue: new DateTime(2023, 8, 11, 10, 32, 35, 264, DateTimeKind.Local).AddTicks(7930));

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "DeviceUploadedImage",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(2023, 8, 11, 10, 52, 50, 629, DateTimeKind.Local).AddTicks(5790),
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)",
                oldDefaultValue: new DateTime(2023, 8, 11, 10, 32, 35, 264, DateTimeKind.Local).AddTicks(9770));

            migrationBuilder.AlterColumn<string>(
                name: "Pin",
                table: "ComputedFunction",
                type: "varchar(5)",
                maxLength: 5,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "varchar(5)",
                oldMaxLength: 5)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AlterColumn<long>(
                name: "DeviceId",
                table: "ComputedFunction",
                type: "bigint",
                nullable: true,
                oldClrType: typeof(long),
                oldType: "bigint");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "PipelineExecuteLog",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(2023, 8, 11, 10, 32, 35, 264, DateTimeKind.Local).AddTicks(7930),
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)",
                oldDefaultValue: new DateTime(2023, 8, 11, 10, 52, 50, 629, DateTimeKind.Local).AddTicks(3220));

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "DeviceUploadedImage",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(2023, 8, 11, 10, 32, 35, 264, DateTimeKind.Local).AddTicks(9770),
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)",
                oldDefaultValue: new DateTime(2023, 8, 11, 10, 52, 50, 629, DateTimeKind.Local).AddTicks(5790));

            migrationBuilder.UpdateData(
                table: "ComputedFunction",
                keyColumn: "Pin",
                keyValue: null,
                column: "Pin",
                value: "");

            migrationBuilder.AlterColumn<string>(
                name: "Pin",
                table: "ComputedFunction",
                type: "varchar(5)",
                maxLength: 5,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "varchar(5)",
                oldMaxLength: 5,
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AlterColumn<long>(
                name: "DeviceId",
                table: "ComputedFunction",
                type: "bigint",
                nullable: false,
                defaultValue: 0L,
                oldClrType: typeof(long),
                oldType: "bigint",
                oldNullable: true);
        }
    }
}
