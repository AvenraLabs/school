'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('section_subject_overrides', {
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
      section_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: { model: 'sections', key: 'id' },
        onDelete: 'CASCADE',
      },
      subject_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: { model: 'subjects', key: 'id' },
        onDelete: 'CASCADE',
      },
      // true  = include in section even if absent from class default
      // false = exclude from section even if present in class default
      is_included: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
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

    await queryInterface.addIndex('section_subject_overrides', ['school_id'], {
      name: 'idx_sso_school_id',
    });
    await queryInterface.addIndex('section_subject_overrides', ['class_id', 'section_id'], {
      name: 'idx_sso_class_section',
    });
    await queryInterface.addIndex(
      'section_subject_overrides',
      ['school_id', 'class_id', 'section_id', 'subject_id'],
      { name: 'idx_sso_unique', unique: true }
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable('section_subject_overrides');
  },
};
