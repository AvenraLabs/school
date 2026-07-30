'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('class_subjects', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      school_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: { model: 'schools', key: 'id' },
        onDelete: 'CASCADE',
      },
      class_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: { model: 'classes', key: 'id' },
        onDelete: 'CASCADE',
      },
      subject_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: { model: 'subjects', key: 'id' },
        onDelete: 'CASCADE',
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.addIndex('class_subjects', ['school_id'], { name: 'idx_class_subjects_school_id' });
    await queryInterface.addIndex('class_subjects', ['class_id'], { name: 'idx_class_subjects_class_id' });
    await queryInterface.addIndex('class_subjects', ['school_id', 'class_id', 'subject_id'], {
      name: 'idx_class_subjects_unique',
      unique: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('class_subjects');
  },
};
