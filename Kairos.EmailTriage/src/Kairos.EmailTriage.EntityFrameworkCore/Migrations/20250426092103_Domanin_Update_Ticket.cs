using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Kairos.EmailTriage.Migrations
{
    /// <inheritdoc />
    public partial class Domanin_Update_Ticket : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Tickets_Labels_LabelId",
                table: "Tickets");

            migrationBuilder.AlterColumn<Guid>(
                name: "LabelId",
                table: "Tickets",
                type: "uniqueidentifier",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier");

            migrationBuilder.AddForeignKey(
                name: "FK_Tickets_Labels_LabelId",
                table: "Tickets",
                column: "LabelId",
                principalTable: "Labels",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Tickets_Labels_LabelId",
                table: "Tickets");

            migrationBuilder.AlterColumn<Guid>(
                name: "LabelId",
                table: "Tickets",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Tickets_Labels_LabelId",
                table: "Tickets",
                column: "LabelId",
                principalTable: "Labels",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
