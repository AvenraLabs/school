'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      -- 1. Add Library Settings columns to schools table
      ALTER TABLE schools ADD COLUMN IF NOT EXISTS library_loan_period_days INTEGER DEFAULT 14;
      ALTER TABLE schools ADD COLUMN IF NOT EXISTS library_fine_to_fees BOOLEAN DEFAULT TRUE;
      ALTER TABLE schools ADD COLUMN IF NOT EXISTS library_overdue_whatsapp_enabled BOOLEAN DEFAULT FALSE;
      ALTER TABLE schools ADD COLUMN IF NOT EXISTS library_overdue_reminder_days INTEGER DEFAULT 1;

      -- 2. Create books table
      CREATE TABLE IF NOT EXISTS books (
        id BIGSERIAL PRIMARY KEY,
        school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
        book_no VARCHAR(50) NOT NULL,
        book_name VARCHAR(255) NOT NULL,
        total_copies INTEGER NOT NULL DEFAULT 1,
        available_copies INTEGER NOT NULL DEFAULT 1,
        status VARCHAR(20) NOT NULL DEFAULT 'active',
        created_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE(school_id, book_no)
      );

      CREATE INDEX IF NOT EXISTS idx_books_school ON books(school_id);
      CREATE INDEX IF NOT EXISTS idx_books_status ON books(status);

      -- 3. Create book_issues table
      CREATE TABLE IF NOT EXISTS book_issues (
        id BIGSERIAL PRIMARY KEY,
        school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
        book_id BIGINT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
        student_id BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
        issue_date DATE NOT NULL,
        due_date DATE NOT NULL,
        returned_date DATE,
        status VARCHAR(20) NOT NULL DEFAULT 'issued',
        issued_by BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        returned_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
        fine_amount DECIMAL(10,2),
        remarks TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_book_issues_school ON book_issues(school_id);
      CREATE INDEX IF NOT EXISTS idx_book_issues_student ON book_issues(student_id);
      CREATE INDEX IF NOT EXISTS idx_book_issues_book ON book_issues(book_id);
      CREATE INDEX IF NOT EXISTS idx_book_issues_status ON book_issues(status);
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      DROP TABLE IF EXISTS book_issues CASCADE;
      DROP TABLE IF EXISTS books CASCADE;

      ALTER TABLE schools DROP COLUMN IF EXISTS library_loan_period_days;
      ALTER TABLE schools DROP COLUMN IF EXISTS library_fine_to_fees;
      ALTER TABLE schools DROP COLUMN IF EXISTS library_overdue_whatsapp_enabled;
      ALTER TABLE schools DROP COLUMN IF EXISTS library_overdue_reminder_days;
    `);
  }
};
