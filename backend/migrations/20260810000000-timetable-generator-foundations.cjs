'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Add subject_type ENUM to subjects
    await queryInterface.addColumn('subjects', 'subject_type', {
      type: Sequelize.ENUM('academic', 'co_curricular'),
      allowNull: false,
      defaultValue: 'academic',
    });

    // 2. Add periods_per_week to class_subjects
    await queryInterface.addColumn('class_subjects', 'periods_per_week', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: null,
    });

    // 3. Add periods_per_week to section_subject_overrides
    await queryInterface.addColumn('section_subject_overrides', 'periods_per_week', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: null,
    });

    // 4. Create bell_schedule_templates table
    await queryInterface.createTable('bell_schedule_templates', {
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
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      working_days_per_week: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 6,
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

    await queryInterface.addIndex('bell_schedule_templates', ['school_id'], {
      name: 'idx_bst_school_id',
    });

    // 5. Create bell_schedule_periods table
    await queryInterface.createTable('bell_schedule_periods', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      template_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: { model: 'bell_schedule_templates', key: 'id' },
        onDelete: 'CASCADE',
      },
      order_index: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      start_time: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      end_time: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      is_break: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: true,
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

    await queryInterface.addIndex('bell_schedule_periods', ['template_id'], {
      name: 'idx_bsp_template_id',
    });

    // 6. Add bell_schedule_template_id to classes
    await queryInterface.addColumn('classes', 'bell_schedule_template_id', {
      type: Sequelize.BIGINT,
      allowNull: true,
      defaultValue: null,
      references: { model: 'bell_schedule_templates', key: 'id' },
      onDelete: 'SET NULL',
    });

    // 7. Add max_periods_per_week to teachers
    await queryInterface.addColumn('teachers', 'max_periods_per_week', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: null,
    });

    // 8. Create timetable_generation_jobs table
    await queryInterface.createTable('timetable_generation_jobs', {
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
      academic_year_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: { model: 'academic_years', key: 'id' },
        onDelete: 'CASCADE',
      },
      status: {
        type: Sequelize.ENUM('pending', 'processing', 'completed', 'failed'),
        allowNull: false,
        defaultValue: 'pending',
      },
      triggered_by: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onDelete: 'SET NULL',
      },
      result_summary: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: {},
      },
      completed_at: {
        type: Sequelize.DATE,
        allowNull: true,
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

    await queryInterface.addIndex('timetable_generation_jobs', ['school_id'], {
      name: 'idx_tgj_school_id',
    });
    await queryInterface.addIndex('timetable_generation_jobs', ['academic_year_id'], {
      name: 'idx_tgj_academic_year_id',
    });
    await queryInterface.addIndex('timetable_generation_jobs', ['status'], {
      name: 'idx_tgj_status',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('timetable_generation_jobs');
    await queryInterface.removeColumn('teachers', 'max_periods_per_week');
    await queryInterface.removeColumn('classes', 'bell_schedule_template_id');
    await queryInterface.dropTable('bell_schedule_periods');
    await queryInterface.dropTable('bell_schedule_templates');
    await queryInterface.removeColumn('section_subject_overrides', 'periods_per_week');
    await queryInterface.removeColumn('class_subjects', 'periods_per_week');
    await queryInterface.removeColumn('subjects', 'subject_type');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_subjects_subject_type";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_timetable_generation_jobs_status";');
  },
};
