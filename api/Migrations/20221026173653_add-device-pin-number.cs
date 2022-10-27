using Microsoft.EntityFrameworkCore.Migrations;

namespace IotApi.Migrations
{
    public partial class adddevicepinnumber : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PinNumber",
                table: "DevicePin",
                type: "varchar(5)",
                maxLength: 5,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.Sql("CREATE TEMPORARY TABLE MicrocontrollerPinsNumber SELECT id AS MicrocontrollerId ,name AS pinsName, value AS pinsValue FROM Microcontroller CROSS JOIN JSON_TABLE (Microcontroller.Pins, '$[*]' COLUMNS(name text path '$.name',value text path '$.value')) as pinsData ");
            migrationBuilder.Sql("UPDATE DevicePin LEFT JOIN Device ON DevicePin.DeviceId = Device.id LEFT JOIN MicrocontrollerPinsNumber ON MicrocontrollerPinsNumber.MicrocontrollerId = Device.Microcontroller AND DevicePin.Pin = MicrocontrollerPinsNumber.pinsName SET PinNumber = pinsValue WHERE Device.Microcontroller IS NOT NULL AND pinsName IS NOT NULL");
            migrationBuilder.Sql("DROP TEMPORARY TABLE MicrocontrollerPinsNumber");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PinNumber",
                table: "DevicePin");
        }
    }
}
