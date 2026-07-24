'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      -- 1. Add board column to schools table
      ALTER TABLE schools ADD COLUMN IF NOT EXISTS board VARCHAR(50) DEFAULT 'CBSE';

      -- 2. Create student_chat_sessions table
      CREATE TABLE IF NOT EXISTS student_chat_sessions (
        id BIGSERIAL PRIMARY KEY,
        student_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL DEFAULT 'New Conversation',
        subject VARCHAR(100),
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_student_chat_sessions_student ON student_chat_sessions(student_id);
      CREATE INDEX IF NOT EXISTS idx_student_chat_sessions_school ON student_chat_sessions(school_id);

      -- 3. Create student_chat_messages table
      CREATE TABLE IF NOT EXISTS student_chat_messages (
        id BIGSERIAL PRIMARY KEY,
        session_id BIGINT NOT NULL REFERENCES student_chat_sessions(id) ON DELETE CASCADE,
        sender VARCHAR(20) NOT NULL CHECK (sender IN ('user', 'assistant')),
        content TEXT NOT NULL,
        sources JSONB,
        tokens_used INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_student_chat_messages_session ON student_chat_messages(session_id);

      -- 4. Create teacher_quizzes table
      CREATE TABLE IF NOT EXISTS teacher_quizzes (
        id BIGSERIAL PRIMARY KEY,
        school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
        teacher_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        class_id BIGINT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
        subject VARCHAR(100) NOT NULL,
        chapter VARCHAR(100),
        title VARCHAR(255) NOT NULL,
        instructions TEXT,
        difficulty VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
        total_marks INTEGER NOT NULL DEFAULT 10,
        estimated_minutes INTEGER DEFAULT 15,
        show_correct_answers BOOLEAN NOT NULL DEFAULT true,
        show_explanations BOOLEAN NOT NULL DEFAULT true,
        due_date TIMESTAMPTZ,
        status VARCHAR(20) NOT NULL DEFAULT 'published',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_teacher_quizzes_school ON teacher_quizzes(school_id);
      CREATE INDEX IF NOT EXISTS idx_teacher_quizzes_class ON teacher_quizzes(class_id);
      CREATE INDEX IF NOT EXISTS idx_teacher_quizzes_teacher ON teacher_quizzes(teacher_id);

      -- 5. Create teacher_quiz_questions table
      CREATE TABLE IF NOT EXISTS teacher_quiz_questions (
        id BIGSERIAL PRIMARY KEY,
        quiz_id BIGINT NOT NULL REFERENCES teacher_quizzes(id) ON DELETE CASCADE,
        order_index INTEGER NOT NULL,
        question_text TEXT NOT NULL,
        options JSONB NOT NULL,
        correct_answer TEXT NOT NULL,
        explanation TEXT,
        marks INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_teacher_quiz_questions_quiz ON teacher_quiz_questions(quiz_id);

      -- 6. Create student_quiz_submissions table
      CREATE TABLE IF NOT EXISTS student_quiz_submissions (
        id BIGSERIAL PRIMARY KEY,
        quiz_id BIGINT NOT NULL REFERENCES teacher_quizzes(id) ON DELETE CASCADE,
        student_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        answers JSONB NOT NULL,
        score NUMERIC(5,2) NOT NULL DEFAULT 0,
        total_marks NUMERIC(5,2) NOT NULL DEFAULT 0,
        status VARCHAR(20) NOT NULL DEFAULT 'submitted',
        submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE(quiz_id, student_id)
      );

      CREATE INDEX IF NOT EXISTS idx_student_quiz_submissions_student ON student_quiz_submissions(student_id);
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      DROP TABLE IF EXISTS student_quiz_submissions;
      DROP TABLE IF EXISTS teacher_quiz_questions;
      DROP TABLE IF EXISTS teacher_quizzes;
      DROP TABLE IF EXISTS student_chat_messages;
      DROP TABLE IF EXISTS student_chat_sessions;
      ALTER TABLE schools DROP COLUMN IF EXISTS board;
    `);
  }
};
