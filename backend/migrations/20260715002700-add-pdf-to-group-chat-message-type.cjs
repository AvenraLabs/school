'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_group_chat_messages_message_type" ADD VALUE IF NOT EXISTS 'pdf';
    `);
  },

  async down(queryInterface) {
    // Enum values cannot be removed in PG
  }
};
