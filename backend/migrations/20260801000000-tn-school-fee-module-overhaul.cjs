'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      -- 1. Student Fee Ledgers: Previous balance & Carry forward link
      ALTER TABLE student_fee_ledgers ADD COLUMN IF NOT EXISTS previous_balance DECIMAL(12,2) NOT NULL DEFAULT 0;
      ALTER TABLE student_fee_ledgers ADD COLUMN IF NOT EXISTS carried_forward_from_ledger_id BIGINT REFERENCES student_fee_ledgers(id) ON DELETE SET NULL;

      -- 2. Itemized Term Ledger Breakdown (Tuition vs Transport vs Books per term)
      CREATE TABLE IF NOT EXISTS student_term_ledger_items (
        id BIGSERIAL PRIMARY KEY,
        school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
        student_term_ledger_id BIGINT NOT NULL REFERENCES student_term_ledgers(id) ON DELETE CASCADE,
        fee_category_id BIGINT NOT NULL REFERENCES fee_categories(id) ON DELETE CASCADE,
        amount DECIMAL(12,2) NOT NULL DEFAULT 0,
        paid DECIMAL(12,2) NOT NULL DEFAULT 0,
        balance DECIMAL(12,2) NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE(student_term_ledger_id, fee_category_id)
      );
      CREATE INDEX IF NOT EXISTS idx_term_ledger_items_term ON student_term_ledger_items(student_term_ledger_id);
      CREATE INDEX IF NOT EXISTS idx_term_ledger_items_cat ON student_term_ledger_items(fee_category_id);

      -- 3. Concession & Scholarship Audit Log (who changed what, when, why)
      CREATE TABLE IF NOT EXISTS ledger_adjustment_history (
        id BIGSERIAL PRIMARY KEY,
        school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
        ledger_id BIGINT NOT NULL REFERENCES student_fee_ledgers(id) ON DELETE CASCADE,
        term_ledger_id BIGINT REFERENCES student_term_ledgers(id) ON DELETE SET NULL,
        adjusted_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
        adjustment_type VARCHAR(30) NOT NULL DEFAULT 'scholarship',
        amount DECIMAL(12,2) NOT NULL DEFAULT 0,
        reason TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_ledger_adj_ledger ON ledger_adjustment_history(ledger_id);

      -- 4. Optional Fee Categories (Transport, Hostel, Special Activity)
      ALTER TABLE fee_categories ADD COLUMN IF NOT EXISTS is_optional BOOLEAN NOT NULL DEFAULT FALSE;

      -- 5. Student Optional Fee Opt-Ins
      CREATE TABLE IF NOT EXISTS student_optional_fee_opt_ins (
        id BIGSERIAL PRIMARY KEY,
        school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
        academic_year_id BIGINT NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
        student_id BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
        fee_category_id BIGINT NOT NULL REFERENCES fee_categories(id) ON DELETE CASCADE,
        is_opted_in BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE(school_id, academic_year_id, student_id, fee_category_id)
      );
      CREATE INDEX IF NOT EXISTS idx_opt_ins_student ON student_optional_fee_opt_ins(student_id);

      -- 6. Late Fee Automation Rules on Class Fee Schedules
      ALTER TABLE class_fee_schedules ADD COLUMN IF NOT EXISTS grace_days INTEGER NOT NULL DEFAULT 5;
      ALTER TABLE class_fee_schedules ADD COLUMN IF NOT EXISTS late_fee_type VARCHAR(10) NOT NULL DEFAULT 'flat';
      ALTER TABLE class_fee_schedules ADD COLUMN IF NOT EXISTS late_fee_value DECIMAL(12,2) NOT NULL DEFAULT 0;
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TABLE class_fee_schedules DROP COLUMN IF EXISTS grace_days;
      ALTER TABLE class_fee_schedules DROP COLUMN IF EXISTS late_fee_type;
      ALTER TABLE class_fee_schedules DROP COLUMN IF EXISTS late_fee_value;
      DROP TABLE IF EXISTS student_optional_fee_opt_ins CASCADE;
      ALTER TABLE fee_categories DROP COLUMN IF EXISTS is_optional;
      DROP TABLE IF EXISTS ledger_adjustment_history CASCADE;
      DROP TABLE IF EXISTS student_term_ledger_items CASCADE;
      ALTER TABLE student_fee_ledgers DROP COLUMN IF EXISTS previous_balance;
      ALTER TABLE student_fee_ledgers DROP COLUMN IF EXISTS carried_forward_from_ledger_id;
    `);
  }
};
