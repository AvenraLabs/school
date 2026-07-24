'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      -- 1. Add section_id to teacher_quizzes
      ALTER TABLE teacher_quizzes 
      ADD COLUMN IF NOT EXISTS section_id BIGINT REFERENCES sections(id) ON DELETE SET NULL;

      CREATE INDEX IF NOT EXISTS idx_teacher_quizzes_section ON teacher_quizzes(section_id);

      -- 2. Drop legacy occupation & family_income fields from students table if existing
      ALTER TABLE students DROP COLUMN IF EXISTS father_occupation;
      ALTER TABLE students DROP COLUMN IF EXISTS mother_occupation;
      ALTER TABLE students DROP COLUMN IF EXISTS guardian_occupation;
      ALTER TABLE students DROP COLUMN IF EXISTS family_income;
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TABLE teacher_quizzes DROP COLUMN IF EXISTS section_id;
    `);
  }
};
