'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      -- Drop dynamic unique constraints on users(phone)
      DO $$
      DECLARE
          r RECORD;
      BEGIN
          FOR r IN (
              SELECT conname 
              FROM pg_constraint 
              WHERE conrelid = 'users'::regclass AND contype = 'u' AND conkey @> (
                  SELECT array_agg(attnum) 
                  FROM pg_attribute 
                  WHERE attrelid = 'users'::regclass AND attname = 'phone'
              )
          ) LOOP
              EXECUTE 'ALTER TABLE users DROP CONSTRAINT ' || quote_ident(r.conname);
          END LOOP;
      END $$;

      -- Drop unique indexes on phone
      DROP INDEX IF EXISTS users_phone;
      DROP INDEX IF EXISTS users_phone_key;
      DROP INDEX IF EXISTS users_phone_unique;

      -- Drop foreign key constraint on students table
      ALTER TABLE students DROP CONSTRAINT IF EXISTS students_family_id_fkey;

      -- Drop family_id column from students table
      ALTER TABLE students DROP COLUMN IF EXISTS family_id;

      -- Drop families table
      DROP TABLE IF EXISTS families CASCADE;
    `);
  },

  async down(queryInterface) {
    // Down migration is omitted to prevent database exceptions since phone constraints cannot be safely added back if duplicate numbers now exist.
  }
};
