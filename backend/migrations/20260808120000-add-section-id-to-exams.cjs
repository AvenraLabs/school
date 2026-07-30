'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if column section_id already exists on exams table
    const tableInfo = await queryInterface.describeTable('exams');
    if (!tableInfo.section_id) {
      await queryInterface.addColumn('exams', 'section_id', {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: { model: 'sections', key: 'id' },
        onDelete: 'SET NULL',
      });

      await queryInterface.addIndex('exams', ['section_id'], {
        name: 'idx_exams_section_id',
      });
    }
  },

  async down(queryInterface) {
    const tableInfo = await queryInterface.describeTable('exams');
    if (tableInfo.section_id) {
      await queryInterface.removeIndex('exams', 'idx_exams_section_id');
      await queryInterface.removeColumn('exams', 'section_id');
    }
  },
};
