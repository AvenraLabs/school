'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('teacher_assignments', 'teacher_id', {
      type: Sequelize.BIGINT,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('teacher_assignments', 'teacher_id', {
      type: Sequelize.BIGINT,
      allowNull: false,
    });
  }
};
