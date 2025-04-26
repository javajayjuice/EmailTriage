using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Kairos.EmailTriage.Migrations
{
    /// <inheritdoc />
    public partial class DomainUpdateTicket : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ClassificationLabel",
                table: "Tickets");

            migrationBuilder.AddColumn<Guid>(
                name: "LabelId",
                table: "Tickets",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_Tickets_LabelId",
                table: "Tickets",
                column: "LabelId");

            migrationBuilder.AddForeignKey(
                name: "FK_Tickets_Labels_LabelId",
                table: "Tickets",
                column: "LabelId",
                principalTable: "Labels",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Tickets_Labels_LabelId",
                table: "Tickets");

            migrationBuilder.DropIndex(
                name: "IX_Tickets_LabelId",
                table: "Tickets");

            migrationBuilder.DropColumn(
                name: "LabelId",
                table: "Tickets");

            migrationBuilder.AddColumn<string>(
                name: "ClassificationLabel",
                table: "Tickets",
                type: "nvarchar(max)",
                nullable: true);
        }
    }
}
