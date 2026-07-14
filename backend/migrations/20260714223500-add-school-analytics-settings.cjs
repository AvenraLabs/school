'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TABLE schools 
      ADD COLUMN IF NOT EXISTS risk_attendance_cutoff INTEGER DEFAULT 75,
      ADD COLUMN IF NOT EXISTS risk_academic_cutoff INTEGER DEFAULT 40,
      ADD COLUMN IF NOT EXISTS risk_grade_drop_margin INTEGER DEFAULT 15;
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TABLE schools 
      DROP COLUMN IF EXISTS risk_attendance_cutoff,
      DROP COLUMN IF EXISTS risk_academic_cutoff,
      DROP COLUMN IF EXISTS risk_grade_drop_margin;
    `);
  }
};
