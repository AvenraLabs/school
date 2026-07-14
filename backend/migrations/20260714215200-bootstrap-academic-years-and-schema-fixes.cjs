'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      -- Clean up duplicate attendance data (keep only latest per student/date)
      DELETE FROM attendances a USING attendances b
      WHERE a.id < b.id AND a.student_id = b.student_id AND a.date = b.date;

      -- Drop legacy constraints and indexes
      ALTER TABLE attendances DROP CONSTRAINT IF EXISTS attendances_student_id_teacher_class_session_id_key;
      DROP INDEX IF EXISTS attendances_student_id_teacher_class_session_id;

      -- Alter columns to make class session optional and add audit columns
      ALTER TABLE attendances ALTER COLUMN teacher_class_session_id DROP NOT NULL;
      ALTER TABLE attendances ADD COLUMN IF NOT EXISTS created_by BIGINT;
      ALTER TABLE attendances ADD COLUMN IF NOT EXISTS updated_by BIGINT;
      ALTER TABLE notifications ADD COLUMN IF NOT EXISTS image_url TEXT;

      -- Create profile_update_requests table
      CREATE TABLE IF NOT EXISTS profile_update_requests (
        id BIGSERIAL PRIMARY KEY,
        school_id BIGINT NOT NULL,
        user_id BIGINT NOT NULL,
        role VARCHAR(50) NOT NULL,
        pending_data JSON NOT NULL,
        status VARCHAR(50) DEFAULT 'PENDING',
        rejection_reason TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      -- Add status column to students and teachers
      ALTER TABLE students ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'ACTIVE';
      ALTER TABLE teachers ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'ACTIVE';

      ALTER TABLE attendances ADD COLUMN IF NOT EXISTS academic_year_id BIGINT;
      ALTER TABLE timetables ADD COLUMN IF NOT EXISTS academic_year_id BIGINT;
      ALTER TABLE exams ADD COLUMN IF NOT EXISTS academic_year_id BIGINT;
      ALTER TABLE homeworks ADD COLUMN IF NOT EXISTS academic_year_id BIGINT;
      ALTER TABLE game_sessions ALTER COLUMN quiz_id DROP NOT NULL;
      ALTER TABLE game_sessions ADD COLUMN IF NOT EXISTS settings JSONB;
      ALTER TABLE exam_subjects ADD COLUMN IF NOT EXISTS max_marks FLOAT DEFAULT 100;

      -- Drop old report card tables and create exam_marks
      DROP TABLE IF EXISTS report_card_marks CASCADE;
      DROP TABLE IF EXISTS report_cards CASCADE;

      CREATE TABLE IF NOT EXISTS exam_marks (
        id BIGSERIAL PRIMARY KEY,
        school_id BIGINT NOT NULL,
        academic_year_id BIGINT,
        exam_id BIGINT NOT NULL,
        subject_id BIGINT NOT NULL,
        student_id BIGINT NOT NULL,
        marks_obtained FLOAT NOT NULL,
        max_marks FLOAT NOT NULL DEFAULT 100,
        remarks TEXT,
        entered_by BIGINT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      -- Create grading_scales table
      CREATE TABLE IF NOT EXISTS grading_scales (
        id BIGSERIAL PRIMARY KEY,
        school_id BIGINT NOT NULL,
        grade_name VARCHAR(50) NOT NULL,
        min_percentage INTEGER NOT NULL,
        is_pass BOOLEAN DEFAULT TRUE,
        color_code VARCHAR(20) DEFAULT '#10b981',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (school_id, grade_name)
      );

      -- Create academic_years table
      CREATE TABLE IF NOT EXISTS academic_years (
        id BIGSERIAL PRIMARY KEY,
        school_id BIGINT NOT NULL,
        name VARCHAR(255) NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        is_current BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (school_id, name)
      );

      -- Create student_enrollments table
      CREATE TABLE IF NOT EXISTS student_enrollments (
        id BIGSERIAL PRIMARY KEY,
        student_id BIGINT NOT NULL,
        academic_year_id BIGINT NOT NULL,
        class_id BIGINT NOT NULL,
        section_id BIGINT NOT NULL,
        roll_no INTEGER,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (student_id, academic_year_id)
      );
    `);

    // Handle seeding and linking logic in migration
    const [schools] = await queryInterface.sequelize.query(`SELECT id FROM schools;`);
    for (const school of schools) {
      const schoolId = school.id;
      // Find or create default academic year "2026-2027"
      const [existingYears] = await queryInterface.sequelize.query(
        `SELECT id FROM academic_years WHERE school_id = :schoolId AND is_current = true LIMIT 1;`,
        { replacements: { schoolId } }
      );

      let yearId;
      if (existingYears.length > 0) {
        yearId = existingYears[0].id;
      } else {
        const [result] = await queryInterface.sequelize.query(
          `INSERT INTO academic_years (school_id, name, start_date, end_date, is_current, created_at, updated_at)
           VALUES (:schoolId, '2026-2027', '2026-06-01', '2027-05-31', true, NOW(), NOW())
           RETURNING id;`,
          { replacements: { schoolId } }
        );
        yearId = result[0].id;
      }

      // Update yearly tables to link to this yearId if null
      await queryInterface.sequelize.query(`UPDATE attendances SET academic_year_id = :yearId WHERE school_id = :schoolId AND academic_year_id IS NULL;`, { replacements: { yearId, schoolId } });
      await queryInterface.sequelize.query(`UPDATE timetables SET academic_year_id = :yearId WHERE school_id = :schoolId AND academic_year_id IS NULL;`, { replacements: { yearId, schoolId } });
      await queryInterface.sequelize.query(`UPDATE exams SET academic_year_id = :yearId WHERE school_id = :schoolId AND academic_year_id IS NULL;`, { replacements: { yearId, schoolId } });
      await queryInterface.sequelize.query(`UPDATE exam_marks SET academic_year_id = :yearId WHERE school_id = :schoolId AND academic_year_id IS NULL;`, { replacements: { yearId, schoolId } });

      // Seed default grading scales if none exist for this school
      const [existingScales] = await queryInterface.sequelize.query(
        `SELECT id FROM grading_scales WHERE school_id = :schoolId LIMIT 1;`,
        { replacements: { schoolId } }
      );
      if (existingScales.length === 0) {
        await queryInterface.sequelize.query(
          `INSERT INTO grading_scales (school_id, grade_name, min_percentage, is_pass, color_code, created_at, updated_at) VALUES
            (:schoolId, 'A+', 90, true, '#10b981', NOW(), NOW()),
            (:schoolId, 'A', 80, true, '#10b981', NOW(), NOW()),
            (:schoolId, 'B', 70, true, '#3b82f6', NOW(), NOW()),
            (:schoolId, 'C', 60, true, '#f59e0b', NOW(), NOW()),
            (:schoolId, 'D', 50, true, '#f59e0b', NOW(), NOW()),
            (:schoolId, 'F', 0, false, '#ef4444', NOW(), NOW());`,
          { replacements: { schoolId } }
        );
      }
      await queryInterface.sequelize.query(`UPDATE homeworks SET academic_year_id = :yearId WHERE school_id = :schoolId AND academic_year_id IS NULL;`, { replacements: { yearId, schoolId } });

      // Create student enrollments from student placements
      const [students] = await queryInterface.sequelize.query(
        `SELECT id, class_id, section_id, roll_no FROM students WHERE school_id = :schoolId AND approval_status = 'approved';`,
        { replacements: { schoolId } }
      );
      for (const student of students) {
        if (student.class_id && student.section_id) {
          // Check if enrollment exists
          const [enrollments] = await queryInterface.sequelize.query(
            `SELECT id FROM student_enrollments WHERE student_id = :studentId AND academic_year_id = :yearId LIMIT 1;`,
            { replacements: { studentId: student.id, yearId } }
          );
          if (enrollments.length === 0) {
            await queryInterface.sequelize.query(
              `INSERT INTO student_enrollments (student_id, academic_year_id, class_id, section_id, roll_no, created_at, updated_at)
               VALUES (:studentId, :yearId, :classId, :sectionId, :rollNo, NOW(), NOW())
               ON CONFLICT (student_id, academic_year_id) DO NOTHING;`,
              {
                replacements: {
                  studentId: student.id,
                  yearId,
                  classId: student.class_id,
                  sectionId: student.section_id,
                  rollNo: student.roll_no,
                },
              }
            );
          }
        }
      }
    }
  },

  async down(queryInterface) {
    // Legacy database rollback is omitted.
  }
};
