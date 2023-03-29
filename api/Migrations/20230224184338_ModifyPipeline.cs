using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IotApi.Migrations
{
    public partial class ModifyPipeline : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "CurrentPipelineItemIds",
                table: "Pipeline",
                newName: "FirstPipelineItemPin");

            migrationBuilder.AddColumn<int>(
                name: "FirstPieplineItemType",
                table: "Pipeline",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<long>(
                name: "FirstPipelineItemDeviceId",
                table: "Pipeline",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsRun",
                table: "Pipeline",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FirstPieplineItemType",
                table: "Pipeline");

            migrationBuilder.DropColumn(
                name: "FirstPipelineItemDeviceId",
                table: "Pipeline");

            migrationBuilder.DropColumn(
                name: "IsRun",
                table: "Pipeline");

            migrationBuilder.RenameColumn(
                name: "FirstPipelineItemPin",
                table: "Pipeline",
                newName: "CurrentPipelineItemIds");
        }
    }
}
