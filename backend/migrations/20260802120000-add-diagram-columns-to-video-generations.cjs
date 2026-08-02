'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // content_type ENUM
    await queryInterface.addColumn('video_generations', 'content_type', {
      type: Sequelize.ENUM('diagram_only', 'diagram_and_video'),
      allowNull: true,
      defaultValue: 'diagram_only',
    });
    // Diagram image GCS path (gs:// URI)
    await queryInterface.addColumn('video_generations', 'image_path', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    // Diagram image public HTTPS URL
    await queryInterface.addColumn('video_generations', 'image_url', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    // Student-facing "what you'll learn" one-liner (≤15 words)
    await queryInterface.addColumn('video_generations', 'summary', {
      type: Sequelize.STRING(200),
      allowNull: true,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('video_generations', 'summary');
    await queryInterface.removeColumn('video_generations', 'image_url');
    await queryInterface.removeColumn('video_generations', 'image_path');
    await queryInterface.removeColumn('video_generations', 'content_type');
    // Note: Sequelize doesn't auto-remove ENUMs on removeColumn; the ENUM type
    // itself remains in the DB. Run:
    //   DROP TYPE IF EXISTS "enum_video_generations_content_type";
    // manually after rollback if needed.
  },
};
