using Microsoft.EntityFrameworkCore.Migrations;

namespace IotApi.Migrations
{
    public partial class UpdatePinMaxLength : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "SourcePin",
                table: "Trigger",
                type: "varchar(4)",
                maxLength: 4,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "varchar(3)",
                oldMaxLength: 3)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AlterColumn<string>(
                name: "DestinationPin",
                table: "Trigger",
                type: "varchar(4)",
                maxLength: 4,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "varchar(3)",
                oldMaxLength: 3,
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AlterColumn<string>(
                name: "Pin",
                table: "SensorLog",
                type: "varchar(4)",
                maxLength: 4,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "varchar(3)",
                oldMaxLength: 3)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "SourcePin",
                table: "Trigger",
                type: "varchar(3)",
                maxLength: 3,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "varchar(4)",
                oldMaxLength: 4)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AlterColumn<string>(
                name: "DestinationPin",
                table: "Trigger",
                type: "varchar(3)",
                maxLength: 3,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "varchar(4)",
                oldMaxLength: 4,
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AlterColumn<string>(
                name: "Pin",
                table: "SensorLog",
                type: "varchar(3)",
                maxLength: 3,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "varchar(4)",
                oldMaxLength: 4)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");
        }
    }
}
