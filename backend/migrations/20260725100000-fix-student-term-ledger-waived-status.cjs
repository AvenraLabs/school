'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TABLE student_term_ledgers DROP CONSTRAINT IF EXISTS student_term_ledgers_status_check;
      ALTER TABLE student_term_ledgers ADD CONSTRAINT student_term_ledgers_status_check 
        CHECK (status IN ('pending', 'partial', 'paid', 'waived'));
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TABLE student_term_ledgers DROP CONSTRAINT IF EXISTS student_term_ledgers_status_check;
      ALTER TABLE student_term_ledgers ADD CONSTRAINT student_term_ledgers_status_check 
        CHECK (status IN ('pending', 'partial', 'paid'));
    `);
  }
};
