const { DataTypes } = require("sequelize");

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable("schools");
    if (tableDescription.google_maps_enabled) {
      await queryInterface.removeColumn("schools", "google_maps_enabled");
    }
  },

  async down(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable("schools");
    if (!tableDescription.google_maps_enabled) {
      await queryInterface.addColumn("schools", "google_maps_enabled", {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      });
    }
  },
};
