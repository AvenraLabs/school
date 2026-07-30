'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TABLE schools ADD COLUMN IF NOT EXISTS enabled_modules JSONB NOT NULL DEFAULT '{
        "transport": true,
        "library": true,
        "finance": true,
        "ai_tutor": true,
        "ai_tools": true,
        "ai_video": true,
        "whatsapp": true
      }'::jsonb;
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TABLE schools DROP COLUMN IF EXISTS enabled_modules;
    `);
  }
};
