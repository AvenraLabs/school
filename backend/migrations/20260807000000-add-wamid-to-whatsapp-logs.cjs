'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TABLE whatsapp_logs ADD COLUMN IF NOT EXISTS wamid VARCHAR(255);
      CREATE INDEX IF NOT EXISTS "whatsapp_logs_wamid" ON "whatsapp_logs" ("wamid");
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS "whatsapp_logs_wamid";
      ALTER TABLE whatsapp_logs DROP COLUMN IF EXISTS wamid;
    `);
  }
};
