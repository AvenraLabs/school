'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.tables 
          WHERE table_name = 'student_term_ledgers'
        ) THEN
          ALTER TABLE student_term_ledgers DROP CONSTRAINT IF EXISTS student_term_ledgers_status_check;
          ALTER TABLE student_term_ledgers ADD CONSTRAINT student_term_ledgers_status_check 
            CHECK (status IN ('pending', 'partial', 'paid', 'waived'));
        END IF;
      END $$;
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.tables 
          WHERE table_name = 'student_term_ledgers'
        ) THEN
          ALTER TABLE student_term_ledgers DROP CONSTRAINT IF EXISTS student_term_ledgers_status_check;
          ALTER TABLE student_term_ledgers ADD CONSTRAINT student_term_ledgers_status_check 
            CHECK (status IN ('pending', 'partial', 'paid'));
        END IF;
      END $$;
    `);
  }
};

