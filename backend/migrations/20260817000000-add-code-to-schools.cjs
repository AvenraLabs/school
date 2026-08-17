module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable("schools");
    if (!tableInfo.code) {
      await queryInterface.addColumn("schools", "code", {
        type: Sequelize.STRING(30),
        allowNull: true,
      });

      // Backfill existing rows with their id as the school code
      await queryInterface.sequelize.query(`
        UPDATE "schools" SET "code" = CAST("id" AS VARCHAR) WHERE "code" IS NULL;
      `);

      // Add unique constraint safely
      try {
        await queryInterface.addConstraint("schools", {
          fields: ["code"],
          type: "unique",
          name: "schools_code_unique",
        });
      } catch (err) {
        console.warn("[Migration] unique constraint note:", err.message);
      }
    }
  },

  down: async (queryInterface) => {
    const tableInfo = await queryInterface.describeTable("schools");
    if (tableInfo.code) {
      await queryInterface.removeColumn("schools", "code");
    }
  },
};
