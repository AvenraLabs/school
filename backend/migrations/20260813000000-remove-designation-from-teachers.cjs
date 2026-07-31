"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable("teachers");

    if (tableDescription.designation) {
      await queryInterface.removeColumn("teachers", "designation");
    }
    // subject and department columns do not exist in the current schema,
    // so no removal is needed for those.
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn("teachers", "designation", {
      type: Sequelize.STRING,
      allowNull: true,
      after: "gender",
    });
  },
};
