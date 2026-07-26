'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TYPE enum_ai_chat_logs_ai_type ADD VALUE IF NOT EXISTS 'greeting';
      ALTER TYPE enum_ai_chat_logs_ai_type ADD VALUE IF NOT EXISTS 'direct_language';
      ALTER TYPE enum_ai_chat_logs_ai_type ADD VALUE IF NOT EXISTS 'direct_curriculum_fallback';
    `);
  },

  async down(queryInterface) {
    // PostgreSQL enum values cannot be easily removed without recreating the ENUM type.
  }
};
