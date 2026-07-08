'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        CREATE TYPE enum_feedbacks_category AS ENUM (
          'bug_report',
          'feature_request',
          'suggestion',
          'complaint',
          'appreciation'
        );
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;

      DO $$
      BEGIN
        CREATE TYPE enum_feedbacks_status AS ENUM (
          'OPEN',
          'IN_PROGRESS',
          'RESOLVED',
          'CLOSED'
        );
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;

      CREATE TABLE IF NOT EXISTS feedbacks (
        id BIGSERIAL PRIMARY KEY,
        school_id BIGINT REFERENCES schools(id) ON DELETE SET NULL ON UPDATE CASCADE,
        title VARCHAR(255) NOT NULL,
        category enum_feedbacks_category NOT NULL,
        description TEXT NOT NULL,
        screenshot_url TEXT,
        user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
        role VARCHAR(255) NOT NULL,
        browser VARCHAR(255),
        app_version VARCHAR(255),
        status enum_feedbacks_status NOT NULL DEFAULT 'OPEN',
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS feedbacks_status ON feedbacks (status);
      CREATE INDEX IF NOT EXISTS feedbacks_category ON feedbacks (category);
      CREATE INDEX IF NOT EXISTS feedbacks_user_id ON feedbacks (user_id);
      CREATE INDEX IF NOT EXISTS feedbacks_school_id ON feedbacks (school_id);
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      DROP TABLE IF EXISTS feedbacks;
      DROP TYPE IF EXISTS enum_feedbacks_status;
      DROP TYPE IF EXISTS enum_feedbacks_category;
    `);
  },
};
