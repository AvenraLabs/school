const { DataTypes } = require("sequelize");

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable("ai_chat_logs");
    if (!tableDescription.prompt_tokens) {
      await queryInterface.addColumn("ai_chat_logs", "prompt_tokens", {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      });
    }
    if (!tableDescription.candidate_tokens) {
      await queryInterface.addColumn("ai_chat_logs", "candidate_tokens", {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable("ai_chat_logs");
    if (tableDescription.prompt_tokens) {
      await queryInterface.removeColumn("ai_chat_logs", "prompt_tokens");
    }
    if (tableDescription.candidate_tokens) {
      await queryInterface.removeColumn("ai_chat_logs", "candidate_tokens");
    }
  },
};
