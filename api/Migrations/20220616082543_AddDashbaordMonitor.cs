using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

namespace IotApi.Migrations
{
    public partial class AddDashbaordMonitor : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Device_Id",
                table: "Device");

            migrationBuilder.AlterColumn<string>(
                name: "Pin",
                table: "DevicePin",
                type: "varchar(5)",
                maxLength: 5,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "varchar(3)",
                oldMaxLength: 3)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "DashboardMonitor",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    EditedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    OwnerId = table.Column<long>(type: "bigint", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    Pin = table.Column<string>(type: "varchar(5)", maxLength: 5, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Mode = table.Column<int>(type: "int", nullable: false),
                    DeviceId = table.Column<long>(type: "bigint", nullable: false),
                    Sort = table.Column<int>(type: "int", nullable: false),
                    Row = table.Column<int>(type: "int", nullable: false),
                    Column = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DashboardMonitor", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_DashboardMonitor_CreatedAt",
                table: "DashboardMonitor",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_DashboardMonitor_DeletedAt",
                table: "DashboardMonitor",
                column: "DeletedAt");

            migrationBuilder.CreateIndex(
                name: "IX_DashboardMonitor_DeviceId",
                table: "DashboardMonitor",
                column: "DeviceId");

            migrationBuilder.CreateIndex(
                name: "IX_DashboardMonitor_Mode",
                table: "DashboardMonitor",
                column: "Mode");

            migrationBuilder.CreateIndex(
                name: "IX_DashboardMonitor_OwnerId",
                table: "DashboardMonitor",
                column: "OwnerId");

            migrationBuilder.CreateIndex(
                name: "IX_DashboardMonitor_Pin",
                table: "DashboardMonitor",
                column: "Pin");

            migrationBuilder.CreateIndex(
                name: "IX_DashboardMonitor_Sort",
                table: "DashboardMonitor",
                column: "Sort");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DashboardMonitor");

            migrationBuilder.AlterColumn<string>(
                name: "Pin",
                table: "DevicePin",
                type: "varchar(3)",
                maxLength: 3,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "varchar(5)",
                oldMaxLength: 5)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_Device_Id",
                table: "Device",
                column: "Id");
        }
    }
}
