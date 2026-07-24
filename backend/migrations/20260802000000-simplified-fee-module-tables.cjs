'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      DROP TABLE IF EXISTS student_term_ledger_items CASCADE;
      DROP TABLE IF EXISTS ledger_adjustment_history CASCADE;
      DROP TABLE IF EXISTS student_optional_fee_opt_ins CASCADE;
      DROP TABLE IF EXISTS student_term_ledgers CASCADE;
      DROP TABLE IF EXISTS class_fee_plans CASCADE;
      DROP TABLE IF EXISTS class_fee_schedules CASCADE;
      DROP TABLE IF EXISTS student_fee_ledgers CASCADE;
      DROP TABLE IF EXISTS fee_payments CASCADE;

      CREATE TABLE IF NOT EXISTS fee_definitions (
        id BIGSERIAL PRIMARY KEY,
        school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
        academic_year_id BIGINT NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
        class_id BIGINT REFERENCES classes(id) ON DELETE CASCADE,
        title VARCHAR(150) NOT NULL,
        due_date DATE,
        total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
        breakdown JSONB NOT NULL DEFAULT '[]'::jsonb,
        fee_type VARCHAR(20) NOT NULL DEFAULT 'class',
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_fee_def_school_class ON fee_definitions(school_id, class_id);

      CREATE TABLE IF NOT EXISTS student_fees (
        id BIGSERIAL PRIMARY KEY,
        school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
        academic_year_id BIGINT NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
        student_id BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
        fee_definition_id BIGINT NOT NULL REFERENCES fee_definitions(id) ON DELETE CASCADE,
        total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
        concession_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
        concession_reason VARCHAR(255),
        paid_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
        balance_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE(student_id, fee_definition_id)
      );
      CREATE INDEX IF NOT EXISTS idx_student_fees_student ON student_fees(student_id);
      CREATE INDEX IF NOT EXISTS idx_student_fees_def ON student_fees(fee_definition_id);
      CREATE INDEX IF NOT EXISTS idx_student_fees_status ON student_fees(status);

      CREATE TABLE IF NOT EXISTS fee_payments (
        id BIGSERIAL PRIMARY KEY,
        school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
        student_id BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
        student_fee_id BIGINT REFERENCES student_fees(id) ON DELETE CASCADE,
        receipt_no VARCHAR(50) NOT NULL,
        amount DECIMAL(12,2) NOT NULL DEFAULT 0,
        late_fee_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
        mode VARCHAR(30) NOT NULL DEFAULT 'cash',
        reference VARCHAR(100),
        paid_by VARCHAR(100),
        remarks TEXT,
        paid_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        is_void BOOLEAN NOT NULL DEFAULT FALSE,
        voided_at TIMESTAMPTZ,
        voided_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
        void_reason TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_fee_pay_student ON fee_payments(student_id);
      CREATE INDEX IF NOT EXISTS idx_fee_pay_receipt ON fee_payments(school_id, receipt_no);
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      DROP TABLE IF EXISTS fee_payments CASCADE;
      DROP TABLE IF EXISTS student_fees CASCADE;
      DROP TABLE IF EXISTS fee_definitions CASCADE;
    `);
  }
};
