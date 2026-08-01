const { DataTypes } = require("sequelize");

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable("video_generations");
    if (!tableDescription.operation_name) {
      await queryInterface.addColumn("video_generations", "operation_name", {
        type: DataTypes.STRING,
        allowNull: true,
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable("video_generations");
    if (tableDescription.operation_name) {
      await queryInterface.removeColumn("video_generations", "operation_name");
    }
  },
};
