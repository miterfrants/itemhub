using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IotApi.Migrations
{
    public partial class AddComputedFunction : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "PipelineExecuteLog",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(2023, 8, 11, 10, 32, 35, 264, DateTimeKind.Local).AddTicks(7930),
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)",
                oldDefaultValue: new DateTime(2023, 7, 13, 2, 33, 57, 219, DateTimeKind.Local).AddTicks(4040));

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "DeviceUploadedImage",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(2023, 8, 11, 10, 32, 35, 264, DateTimeKind.Local).AddTicks(9770),
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)",
                oldDefaultValue: new DateTime(2023, 7, 13, 2, 33, 57, 219, DateTimeKind.Local).AddTicks(5610));

            migrationBuilder.CreateTable(
                name: "ComputedFunction",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    EditedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    UserId = table.Column<long>(type: "bigint", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    Pin = table.Column<string>(type: "varchar(5)", maxLength: 5, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    DeviceId = table.Column<long>(type: "bigint", nullable: false),
                    GroupId = table.Column<long>(type: "bigint", nullable: true),
                    MonitorId = table.Column<long>(type: "bigint", nullable: true),
                    Func = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Target = table.Column<int>(type: "int", nullable: false),
                    IsDeleted = table.Column<bool>(type: "tinyint(1)", nullable: true, computedColumnSql: "IF(`DeletedAt` IS NULL, 0, NULL)")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ComputedFunction", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_ComputedFunction_CreatedAt",
                table: "ComputedFunction",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_ComputedFunction_DeletedAt",
                table: "ComputedFunction",
                column: "DeletedAt");

            migrationBuilder.CreateIndex(
                name: "IX_ComputedFunction_DeviceId",
                table: "ComputedFunction",
                column: "DeviceId");

            migrationBuilder.CreateIndex(
                name: "IX_ComputedFunction_GroupId",
                table: "ComputedFunction",
                column: "GroupId");

            migrationBuilder.CreateIndex(
                name: "IX_ComputedFunction_MonitorId",
                table: "ComputedFunction",
                column: "MonitorId");

            migrationBuilder.CreateIndex(
                name: "IX_ComputedFunction_Pin",
                table: "ComputedFunction",
                column: "Pin");

            migrationBuilder.CreateIndex(
                name: "IX_ComputedFunction_Target",
                table: "ComputedFunction",
                column: "Target");

            migrationBuilder.CreateIndex(
                name: "IX_ComputedFunction_UserId",
                table: "ComputedFunction",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_ComputedFunction_UserId_GroupId_DeviceId_Pin_Target_IsDeleted",
                table: "ComputedFunction",
                columns: new[] { "UserId", "GroupId", "DeviceId", "Pin", "Target", "IsDeleted" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ComputedFunction_UserId_GroupId_MonitorId_Target_IsDeleted",
                table: "ComputedFunction",
                columns: new[] { "UserId", "GroupId", "MonitorId", "Target", "IsDeleted" },
                unique: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ComputedFunction");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "PipelineExecuteLog",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(2023, 7, 13, 2, 33, 57, 219, DateTimeKind.Local).AddTicks(4040),
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)",
                oldDefaultValue: new DateTime(2023, 8, 11, 10, 32, 35, 264, DateTimeKind.Local).AddTicks(7930));

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "DeviceUploadedImage",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(2023, 7, 13, 2, 33, 57, 219, DateTimeKind.Local).AddTicks(5610),
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)",
                oldDefaultValue: new DateTime(2023, 8, 11, 10, 32, 35, 264, DateTimeKind.Local).AddTicks(9770));
        }
    }
}
