'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TABLE student_fees ADD COLUMN IF NOT EXISTS concession_amount DECIMAL(12,2) NOT NULL DEFAULT 0;
      ALTER TABLE student_fees ADD COLUMN IF NOT EXISTS concession_reason VARCHAR(255);
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TABLE student_fees DROP COLUMN IF EXISTS concession_amount;
      ALTER TABLE student_fees DROP COLUMN IF EXISTS concession_reason;
    `);
  }
};
