"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable("token_policies");

    // 1. Add school_id column if not present
    if (!tableInfo.school_id) {
      await queryInterface.addColumn("token_policies", "school_id", {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "schools",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      });
    }

    // 2. Drop legacy single-column unique constraints/indexes on "role" alone
    try {
      await queryInterface.sequelize.query(`ALTER TABLE token_policies DROP CONSTRAINT IF EXISTS "token_policies_role";`);
      await queryInterface.sequelize.query(`DROP INDEX IF EXISTS "token_policies_role";`);
      await queryInterface.sequelize.query(`ALTER TABLE token_policies DROP CONSTRAINT IF EXISTS "token_policies_role_key";`);
      await queryInterface.sequelize.query(`DROP INDEX IF EXISTS "token_policies_role_key";`);
    } catch (e) {
      // Ignore if constraint does not exist
    }

    // 3. Ensure composite unique index on (role, school_id) exists
    try {
      await queryInterface.addIndex("token_policies", ["role", "school_id"], {
        name: "idx_token_policies_role_school",
        unique: true,
      });
    } catch (e) {
      // Index already exists
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable("token_policies");
    if (tableInfo.school_id) {
      await queryInterface.removeIndex("token_policies", "idx_token_policies_role_school").catch(() => {});
      await queryInterface.removeColumn("token_policies", "school_id").catch(() => {});
    }
  },
};
