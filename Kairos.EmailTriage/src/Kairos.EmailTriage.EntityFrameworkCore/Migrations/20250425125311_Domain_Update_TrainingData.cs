using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Kairos.EmailTriage.Migrations
{
    /// <inheritdoc />
    public partial class Domain_Update_TrainingData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "LabelColumn",
                table: "TrainingDatas",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TextColumn",
                table: "TrainingDatas",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LabelColumn",
                table: "TrainingDatas");

            migrationBuilder.DropColumn(
                name: "TextColumn",
                table: "TrainingDatas");
        }
    }
}
