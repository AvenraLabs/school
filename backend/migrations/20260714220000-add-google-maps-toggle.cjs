'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TABLE schools ADD COLUMN IF NOT EXISTS google_maps_enabled BOOLEAN DEFAULT FALSE;
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TABLE schools DROP COLUMN IF EXISTS google_maps_enabled;
    `);
  }
};
