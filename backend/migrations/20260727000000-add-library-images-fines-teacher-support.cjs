'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      -- 1. Add library_overdue_fine_per_day to schools table
      ALTER TABLE schools ADD COLUMN IF NOT EXISTS library_overdue_fine_per_day DECIMAL(10,2) DEFAULT 0.00;

      -- 2. Add image_url to books table
      ALTER TABLE books ADD COLUMN IF NOT EXISTS image_url VARCHAR(500);

      -- 3. Update book_issues table to support teachers and damaged status
      ALTER TABLE book_issues ADD COLUMN IF NOT EXISTS borrower_type VARCHAR(20) NOT NULL DEFAULT 'student';
      ALTER TABLE book_issues ADD COLUMN IF NOT EXISTS teacher_id BIGINT REFERENCES teachers(id) ON DELETE CASCADE;

      -- Make student_id nullable so an issue can be for a student or teacher
      ALTER TABLE book_issues ALTER COLUMN student_id DROP NOT NULL;

      CREATE INDEX IF NOT EXISTS idx_book_issues_teacher ON book_issues(teacher_id);
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TABLE book_issues DROP COLUMN IF EXISTS teacher_id;
      ALTER TABLE book_issues DROP COLUMN IF EXISTS borrower_type;
      ALTER TABLE books DROP COLUMN IF EXISTS image_url;
      ALTER TABLE schools DROP COLUMN IF EXISTS library_overdue_fine_per_day;
    `);
  }
};
