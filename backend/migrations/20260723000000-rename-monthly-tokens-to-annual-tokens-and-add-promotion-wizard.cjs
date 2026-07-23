'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TABLE token_policies RENAME COLUMN monthly_tokens TO annual_tokens;
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE schools ADD COLUMN IF NOT EXISTS promotion_wizard_enabled BOOLEAN DEFAULT TRUE;
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TABLE token_policies RENAME COLUMN annual_tokens TO monthly_tokens;
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE schools DROP COLUMN IF EXISTS promotion_wizard_enabled;
    `);
  }
};
