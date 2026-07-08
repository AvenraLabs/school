'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        CREATE TYPE enum_lost_found_items_type AS ENUM ('lost', 'found');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;

      DO $$
      BEGIN
        CREATE TYPE enum_lost_found_items_status AS ENUM ('OPEN', 'CLOSED');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;

      CREATE TABLE IF NOT EXISTS lost_found_items (
        id BIGSERIAL PRIMARY KEY,
        school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE ON UPDATE CASCADE,
        title VARCHAR(255) NOT NULL,
        type enum_lost_found_items_type NOT NULL,
        description TEXT,
        date DATE NOT NULL DEFAULT CURRENT_DATE,
        photos JSON DEFAULT '[]',
        status enum_lost_found_items_status NOT NULL DEFAULT 'OPEN',
        created_by BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS lost_found_items_school_id ON lost_found_items (school_id);
      CREATE INDEX IF NOT EXISTS lost_found_items_status ON lost_found_items (status);
      CREATE INDEX IF NOT EXISTS lost_found_items_type ON lost_found_items (type);
      CREATE INDEX IF NOT EXISTS lost_found_items_created_by ON lost_found_items (created_by);
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      DROP TABLE IF EXISTS lost_found_items;
      DROP TYPE IF EXISTS enum_lost_found_items_status;
      DROP TYPE IF EXISTS enum_lost_found_items_type;
    `);
  },
};
