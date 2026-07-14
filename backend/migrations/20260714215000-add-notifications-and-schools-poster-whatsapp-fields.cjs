'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TABLE notifications ADD COLUMN IF NOT EXISTS is_poster BOOLEAN DEFAULT FALSE;
      ALTER TABLE notifications ADD COLUMN IF NOT EXISTS start_date DATE;
      ALTER TABLE notifications ADD COLUMN IF NOT EXISTS end_date DATE;
      ALTER TABLE notifications ADD COLUMN IF NOT EXISTS specific_dates JSONB;
      ALTER TABLE schools ADD COLUMN IF NOT EXISTS whatsapp_bus_start_enabled BOOLEAN DEFAULT FALSE;
      ALTER TABLE schools ADD COLUMN IF NOT EXISTS whatsapp_bus_end_enabled BOOLEAN DEFAULT FALSE;
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TABLE notifications DROP COLUMN IF EXISTS is_poster;
      ALTER TABLE notifications DROP COLUMN IF EXISTS start_date;
      ALTER TABLE notifications DROP COLUMN IF EXISTS end_date;
      ALTER TABLE notifications DROP COLUMN IF EXISTS specific_dates;
      ALTER TABLE schools DROP COLUMN IF EXISTS whatsapp_bus_start_enabled;
      ALTER TABLE schools DROP COLUMN IF EXISTS whatsapp_bus_end_enabled;
    `);
  }
};
