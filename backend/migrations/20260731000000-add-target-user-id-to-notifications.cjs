'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TABLE notifications ADD COLUMN IF NOT EXISTS target_user_id BIGINT REFERENCES users(id) ON DELETE CASCADE;
      CREATE INDEX IF NOT EXISTS idx_notifications_target_user ON notifications(target_user_id);
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS idx_notifications_target_user;
      ALTER TABLE notifications DROP COLUMN IF EXISTS target_user_id;
    `);
  }
};
