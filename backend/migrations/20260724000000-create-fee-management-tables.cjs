'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      -- Fee Categories
      CREATE TABLE IF NOT EXISTS fee_categories (
        id BIGSERIAL PRIMARY KEY,
        school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE(school_id, name)
      );
      CREATE INDEX IF NOT EXISTS idx_fee_categories_school ON fee_categories(school_id);

      -- Class Fee Plans
      CREATE TABLE IF NOT EXISTS class_fee_plans (
        id BIGSERIAL PRIMARY KEY,
        school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
        academic_year_id BIGINT NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
        class_id BIGINT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
        fee_category_id BIGINT NOT NULL REFERENCES fee_categories(id) ON DELETE CASCADE,
        amount DECIMAL(12,2) NOT NULL DEFAULT 0,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE(school_id, academic_year_id, class_id, fee_category_id)
      );
      CREATE INDEX IF NOT EXISTS idx_class_fee_plans_school ON class_fee_plans(school_id);
      CREATE INDEX IF NOT EXISTS idx_class_fee_plans_class ON class_fee_plans(class_id);

      -- Student Fee Ledgers
      CREATE TABLE IF NOT EXISTS student_fee_ledgers (
        id BIGSERIAL PRIMARY KEY,
        school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
        academic_year_id BIGINT NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
        student_id BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
        total DECIMAL(12,2) NOT NULL DEFAULT 0,
        paid DECIMAL(12,2) NOT NULL DEFAULT 0,
        balance DECIMAL(12,2) NOT NULL DEFAULT 0,
        scholarship_percent DECIMAL(5,2) NOT NULL DEFAULT 0,
        discount_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
        fee_mode VARCHAR(10) NOT NULL DEFAULT 'full' CHECK (fee_mode IN ('full', 'custom')),
        custom_total DECIMAL(12,2),
        status VARCHAR(10) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'frozen')),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE(school_id, academic_year_id, student_id)
      );
      CREATE INDEX IF NOT EXISTS idx_student_fee_ledgers_student ON student_fee_ledgers(student_id);
      CREATE INDEX IF NOT EXISTS idx_student_fee_ledgers_school_year ON student_fee_ledgers(school_id, academic_year_id);

      -- Fee Payments
      CREATE TABLE IF NOT EXISTS fee_payments (
        id BIGSERIAL PRIMARY KEY,
        school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
        student_id BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
        ledger_id BIGINT NOT NULL REFERENCES student_fee_ledgers(id) ON DELETE CASCADE,
        amount DECIMAL(12,2) NOT NULL,
        mode VARCHAR(20) NOT NULL DEFAULT 'cash' CHECK (mode IN ('cash', 'upi', 'bank_transfer', 'cheque', 'dd', 'online')),
        reference VARCHAR(255),
        receipt_no VARCHAR(50) NOT NULL,
        paid_by VARCHAR(255),
        remarks TEXT,
        paid_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        is_void BOOLEAN NOT NULL DEFAULT FALSE,
        voided_by BIGINT REFERENCES users(id),
        voided_at TIMESTAMPTZ,
        void_reason TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE(school_id, receipt_no)
      );
      CREATE INDEX IF NOT EXISTS idx_fee_payments_student ON fee_payments(student_id);
      CREATE INDEX IF NOT EXISTS idx_fee_payments_ledger ON fee_payments(ledger_id);

      -- Receipt counter on schools
      ALTER TABLE schools ADD COLUMN IF NOT EXISTS fee_receipt_counter INTEGER NOT NULL DEFAULT 0;
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      DROP TABLE IF EXISTS fee_payments CASCADE;
      DROP TABLE IF EXISTS student_fee_ledgers CASCADE;
      DROP TABLE IF EXISTS class_fee_plans CASCADE;
      DROP TABLE IF EXISTS fee_categories CASCADE;
      ALTER TABLE schools DROP COLUMN IF EXISTS fee_receipt_counter;
    `);
  }
};
