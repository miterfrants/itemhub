using Microsoft.EntityFrameworkCore.Migrations;

namespace IotApi.Migrations
{
    public partial class TriggerUpdateFieldForNotification : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Trigger_Device_DestinationDeviceId",
                table: "Trigger");

            migrationBuilder.DropColumn(
                name: "DestinationDeviceSourceState",
                table: "Trigger");

            migrationBuilder.AlterColumn<string>(
                name: "DestinationPin",
                table: "Trigger",
                type: "varchar(3)",
                maxLength: 3,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "varchar(3)",
                oldMaxLength: 3)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AlterColumn<long>(
                name: "DestinationDeviceId",
                table: "Trigger",
                type: "bigint",
                nullable: true,
                oldClrType: typeof(long),
                oldType: "bigint");

            migrationBuilder.AddForeignKey(
                name: "FK_Trigger_Device_DestinationDeviceId",
                table: "Trigger",
                column: "DestinationDeviceId",
                principalTable: "Device",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Trigger_Device_DestinationDeviceId",
                table: "Trigger");

            migrationBuilder.AlterColumn<string>(
                name: "DestinationPin",
                table: "Trigger",
                type: "varchar(3)",
                maxLength: 3,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "varchar(3)",
                oldMaxLength: 3,
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AlterColumn<long>(
                name: "DestinationDeviceId",
                table: "Trigger",
                type: "bigint",
                nullable: false,
                defaultValue: 0L,
                oldClrType: typeof(long),
                oldType: "bigint",
                oldNullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "DestinationDeviceSourceState",
                table: "Trigger",
                type: "decimal(65,30)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddForeignKey(
                name: "FK_Trigger_Device_DestinationDeviceId",
                table: "Trigger",
                column: "DestinationDeviceId",
                principalTable: "Device",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
