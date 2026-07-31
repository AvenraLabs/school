"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableDesc = await queryInterface.describeTable("notifications");

    if (!tableDesc.deep_link) {
      await queryInterface.addColumn("notifications", "deep_link", {
        type: Sequelize.STRING(512),
        allowNull: true,
        comment: "Optional in-app route path (e.g. /teacher/timetable) for deep-link navigation on tap",
        after: "specific_dates",
      });
      console.log("[Migration] Added deep_link column to notifications table.");
    } else {
      console.log("[Migration] deep_link column already exists in notifications, skipping.");
    }
  },

  async down(queryInterface) {
    const tableDesc = await queryInterface.describeTable("notifications");
    if (tableDesc.deep_link) {
      await queryInterface.removeColumn("notifications", "deep_link");
      console.log("[Migration] Removed deep_link column from notifications table.");
    }
  },
};
