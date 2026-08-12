'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('students');
    if (tableInfo.aadhar_no) {
      await queryInterface.removeColumn('students', 'aadhar_no');
    }
  },

  async down(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('students');
    if (!tableInfo.aadhar_no) {
      await queryInterface.addColumn('students', 'aadhar_no', {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
      });
    }
  },
};
