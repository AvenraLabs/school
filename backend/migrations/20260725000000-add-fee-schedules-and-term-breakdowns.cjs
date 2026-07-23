'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      -- Class Fee Schedules (Term 1, Term 2, Term 3 breakdown per class)
      CREATE TABLE IF NOT EXISTS class_fee_schedules (
        id BIGSERIAL PRIMARY KEY,
        school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
        academic_year_id BIGINT NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
        class_id BIGINT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
        term_name VARCHAR(100) NOT NULL,
        due_date DATE,
        amount DECIMAL(12,2) NOT NULL DEFAULT 0,
        display_order INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE(school_id, academic_year_id, class_id, term_name)
      );
      CREATE INDEX IF NOT EXISTS idx_class_fee_schedules_class ON class_fee_schedules(class_id);

      -- Student Term Ledgers (Term-by-term status per student)
      CREATE TABLE IF NOT EXISTS student_term_ledgers (
        id BIGSERIAL PRIMARY KEY,
        school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
        academic_year_id BIGINT NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
        student_id BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
        schedule_id BIGINT REFERENCES class_fee_schedules(id) ON DELETE SET NULL,
        term_name VARCHAR(100) NOT NULL,
        due_date DATE,
        total DECIMAL(12,2) NOT NULL DEFAULT 0,
        paid DECIMAL(12,2) NOT NULL DEFAULT 0,
        balance DECIMAL(12,2) NOT NULL DEFAULT 0,
        status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'paid')),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE(school_id, academic_year_id, student_id, term_name)
      );
      CREATE INDEX IF NOT EXISTS idx_student_term_ledgers_student ON student_term_ledgers(student_id);

      -- Add late_fee_amount and term_ledger_id to fee_payments
      ALTER TABLE fee_payments ADD COLUMN IF NOT EXISTS term_ledger_id BIGINT REFERENCES student_term_ledgers(id) ON DELETE SET NULL;
      ALTER TABLE fee_payments ADD COLUMN IF NOT EXISTS late_fee_amount DECIMAL(12,2) NOT NULL DEFAULT 0;

      -- Add is_archived to fee_categories
      ALTER TABLE fee_categories ADD COLUMN IF NOT EXISTS is_archived BOOLEAN NOT NULL DEFAULT FALSE;
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      DROP TABLE IF EXISTS student_term_ledgers CASCADE;
      DROP TABLE IF EXISTS class_fee_schedules CASCADE;
      ALTER TABLE fee_payments DROP COLUMN IF EXISTS term_ledger_id;
      ALTER TABLE fee_payments DROP COLUMN IF EXISTS late_fee_amount;
      ALTER TABLE fee_categories DROP COLUMN IF EXISTS is_archived;
    `);
  }
};
