'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TABLE schools DROP COLUMN IF EXISTS library_fine_to_fees;
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TABLE schools ADD COLUMN IF NOT EXISTS library_fine_to_fees BOOLEAN DEFAULT TRUE;
    `);
  }
};
