"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("video_generations", {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      school_id: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: "schools",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      teacher_id: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: "teachers",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      class_id: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: "classes",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      section_id: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: "sections",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      subject_id: {
        type: Sequelize.BIGINT,
        allowNull: true,
      },
      subject_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      topic: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      language: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "English",
      },
      duration: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "5",
      },
      status: {
        type: Sequelize.ENUM("pending", "processing", "completed", "failed"),
        allowNull: false,
        defaultValue: "pending",
      },
      kling_job_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      video_path: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      video_url: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      thumbnail_path: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      prompt: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      error_message: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
      completed_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });

    await queryInterface.addIndex("video_generations", ["teacher_id"]);
    await queryInterface.addIndex("video_generations", ["class_id"]);
    await queryInterface.addIndex("video_generations", ["kling_job_id"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("video_generations");
  },
};
