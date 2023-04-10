using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IotApi.Migrations
{
    public partial class removetrigger : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Trigger");

            migrationBuilder.DropTable(
                name: "TriggerLog");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "PipelineExecuteLog",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(2023, 4, 9, 1, 34, 28, 667, DateTimeKind.Local).AddTicks(4460),
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)",
                oldDefaultValue: new DateTime(2023, 3, 20, 1, 48, 27, 361, DateTimeKind.Local).AddTicks(2320));
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "PipelineExecuteLog",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(2023, 3, 20, 1, 48, 27, 361, DateTimeKind.Local).AddTicks(2320),
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)",
                oldDefaultValue: new DateTime(2023, 4, 9, 1, 34, 28, 667, DateTimeKind.Local).AddTicks(4460));

            migrationBuilder.CreateTable(
                name: "Trigger",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    DestinationDeviceId = table.Column<long>(type: "bigint", nullable: true),
                    SourceDeviceId = table.Column<long>(type: "bigint", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    DestinationDeviceTargetState = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    DestinationPin = table.Column<string>(type: "varchar(5)", maxLength: 5, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    EditedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    Email = table.Column<string>(type: "varchar(255)", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Name = table.Column<string>(type: "varchar(255)", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    NotificationPeriod = table.Column<int>(type: "int", nullable: false),
                    Operator = table.Column<int>(type: "int", nullable: false),
                    OwnerId = table.Column<long>(type: "bigint", nullable: false),
                    Phone = table.Column<string>(type: "varchar(255)", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    SourcePin = table.Column<string>(type: "varchar(5)", maxLength: 5, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    SourceThreshold = table.Column<decimal>(type: "decimal(65,30)", nullable: false),
                    Type = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Trigger", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Trigger_Device_DestinationDeviceId",
                        column: x => x.DestinationDeviceId,
                        principalTable: "Device",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Trigger_Device_SourceDeviceId",
                        column: x => x.SourceDeviceId,
                        principalTable: "Device",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "TriggerLog",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    OwnerId = table.Column<long>(type: "bigint", nullable: false),
                    Raw = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    TriggerId = table.Column<long>(type: "bigint", nullable: false),
                    Type = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TriggerLog", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_Trigger_CreatedAt",
                table: "Trigger",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_Trigger_DeletedAt",
                table: "Trigger",
                column: "DeletedAt");

            migrationBuilder.CreateIndex(
                name: "IX_Trigger_DestinationDeviceId",
                table: "Trigger",
                column: "DestinationDeviceId");

            migrationBuilder.CreateIndex(
                name: "IX_Trigger_DestinationPin",
                table: "Trigger",
                column: "DestinationPin");

            migrationBuilder.CreateIndex(
                name: "IX_Trigger_Email",
                table: "Trigger",
                column: "Email");

            migrationBuilder.CreateIndex(
                name: "IX_Trigger_Name",
                table: "Trigger",
                column: "Name");

            migrationBuilder.CreateIndex(
                name: "IX_Trigger_OwnerId",
                table: "Trigger",
                column: "OwnerId");

            migrationBuilder.CreateIndex(
                name: "IX_Trigger_Phone",
                table: "Trigger",
                column: "Phone");

            migrationBuilder.CreateIndex(
                name: "IX_Trigger_SourceDeviceId",
                table: "Trigger",
                column: "SourceDeviceId");

            migrationBuilder.CreateIndex(
                name: "IX_Trigger_SourcePin",
                table: "Trigger",
                column: "SourcePin");

            migrationBuilder.CreateIndex(
                name: "IX_Trigger_Type",
                table: "Trigger",
                column: "Type");

            migrationBuilder.CreateIndex(
                name: "IX_TriggerLog_CreatedAt",
                table: "TriggerLog",
                column: "CreatedAt");
        }
    }
}
