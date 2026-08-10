'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('video_generations', 'image_path', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.changeColumn('video_generations', 'image_url', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.changeColumn('video_generations', 'video_path', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.changeColumn('video_generations', 'video_url', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.changeColumn('video_generations', 'thumbnail_path', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('video_generations', 'image_path', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.changeColumn('video_generations', 'image_url', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.changeColumn('video_generations', 'video_path', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.changeColumn('video_generations', 'video_url', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.changeColumn('video_generations', 'thumbnail_path', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
};
