'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS refresh_token TEXT;
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TABLE users DROP COLUMN IF EXISTS refresh_token;
    `);
  }
};
