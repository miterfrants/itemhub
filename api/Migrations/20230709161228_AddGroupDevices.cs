using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IotApi.Migrations
{
    public partial class AddGroupDevices : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "PipelineExecuteLog",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(2023, 7, 10, 0, 12, 28, 556, DateTimeKind.Local).AddTicks(6940),
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)",
                oldDefaultValue: new DateTime(2023, 6, 29, 22, 46, 35, 862, DateTimeKind.Local).AddTicks(90));

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "DeviceUploadedImage",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(2023, 7, 10, 0, 12, 28, 556, DateTimeKind.Local).AddTicks(8350),
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)",
                oldDefaultValue: new DateTime(2023, 6, 29, 22, 46, 35, 862, DateTimeKind.Local).AddTicks(2140));

            migrationBuilder.CreateTable(
                name: "GroupDevice",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    EditedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    EditedBy = table.Column<long>(type: "bigint", nullable: true),
                    DeviceId = table.Column<long>(type: "bigint", nullable: false),
                    GroupId = table.Column<long>(type: "bigint", nullable: false),
                    UserId = table.Column<long>(type: "bigint", nullable: false),
                    IsDeleted = table.Column<bool>(type: "tinyint(1)", nullable: true, computedColumnSql: "IF(`DeletedAt` IS NULL, 0, NULL)")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GroupDevice", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_GroupDevice_CreatedAt",
                table: "GroupDevice",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_GroupDevice_DeletedAt",
                table: "GroupDevice",
                column: "DeletedAt");

            migrationBuilder.CreateIndex(
                name: "IX_GroupDevice_DeviceId",
                table: "GroupDevice",
                column: "DeviceId");

            migrationBuilder.CreateIndex(
                name: "IX_GroupDevice_GroupId",
                table: "GroupDevice",
                column: "GroupId");

            migrationBuilder.CreateIndex(
                name: "IX_GroupDevice_GroupId_UserId_DeviceId_IsDeleted",
                table: "GroupDevice",
                columns: new[] { "GroupId", "UserId", "DeviceId", "IsDeleted" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_GroupDevice_UserId",
                table: "GroupDevice",
                column: "UserId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "GroupDevice");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "PipelineExecuteLog",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(2023, 6, 29, 22, 46, 35, 862, DateTimeKind.Local).AddTicks(90),
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)",
                oldDefaultValue: new DateTime(2023, 7, 10, 0, 12, 28, 556, DateTimeKind.Local).AddTicks(6940));

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "DeviceUploadedImage",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(2023, 6, 29, 22, 46, 35, 862, DateTimeKind.Local).AddTicks(2140),
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)",
                oldDefaultValue: new DateTime(2023, 7, 10, 0, 12, 28, 556, DateTimeKind.Local).AddTicks(8350));
        }
    }
}
