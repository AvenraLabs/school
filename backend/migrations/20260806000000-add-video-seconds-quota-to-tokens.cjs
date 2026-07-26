'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TABLE token_policies ADD COLUMN IF NOT EXISTS annual_video_seconds INTEGER NOT NULL DEFAULT 2000;
      ALTER TABLE token_accounts ADD COLUMN IF NOT EXISTS video_seconds_balance INTEGER NOT NULL DEFAULT 2000;
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TABLE token_accounts DROP COLUMN IF EXISTS video_seconds_balance;
      ALTER TABLE token_policies DROP COLUMN IF EXISTS annual_video_seconds;
    `);
  }
};
