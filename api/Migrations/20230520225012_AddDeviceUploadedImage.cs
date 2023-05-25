using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IotApi.Migrations
{
    public partial class AddDeviceUploadedImage : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "PipelineExecuteLog",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(2023, 5, 21, 6, 50, 12, 16, DateTimeKind.Local).AddTicks(8730),
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)",
                oldDefaultValue: new DateTime(2023, 5, 4, 11, 58, 51, 617, DateTimeKind.Local).AddTicks(4860));

            migrationBuilder.CreateTable(
                name: "DeviceUploadedImage",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false, defaultValue: new DateTime(2023, 5, 21, 6, 50, 12, 17, DateTimeKind.Local).AddTicks(310)),
                    EditedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    EditedBy = table.Column<long>(type: "bigint", nullable: true),
                    OwnerId = table.Column<long>(type: "bigint", nullable: false),
                    DeviceId = table.Column<long>(type: "bigint", nullable: false),
                    Filename = table.Column<string>(type: "varchar(128)", maxLength: 128, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DeviceUploadedImage", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceUploadedImage_CreatedAt",
                table: "DeviceUploadedImage",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceUploadedImage_DeletedAt",
                table: "DeviceUploadedImage",
                column: "DeletedAt");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceUploadedImage_DeviceId",
                table: "DeviceUploadedImage",
                column: "DeviceId");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceUploadedImage_Filename",
                table: "DeviceUploadedImage",
                column: "Filename");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceUploadedImage_OwnerId",
                table: "DeviceUploadedImage",
                column: "OwnerId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DeviceUploadedImage");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "PipelineExecuteLog",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(2023, 5, 4, 11, 58, 51, 617, DateTimeKind.Local).AddTicks(4860),
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)",
                oldDefaultValue: new DateTime(2023, 5, 21, 6, 50, 12, 16, DateTimeKind.Local).AddTicks(8730));
        }
    }
}
