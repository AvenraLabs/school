"use strict";

/**
 * Migration: Drop legacy textbook_chapters PostgreSQL table
 * RAG architecture has moved to 100% ChromaDB vector store with hybrid caching.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      DROP TABLE IF EXISTS "textbook_chapters" CASCADE;
    `);
    console.log("[Migration] Successfully dropped legacy 'textbook_chapters' table.");
  },

  async down(queryInterface, Sequelize) {
    // Legacy rollback definition (if needed)
    await queryInterface.sequelize.query(`
      CREATE TABLE IF NOT EXISTS "textbook_chapters" (
        "id" BIGSERIAL PRIMARY KEY,
        "board" VARCHAR(50) NOT NULL DEFAULT 'CBSE',
        "grade" INTEGER NOT NULL,
        "subject" VARCHAR(100) NOT NULL,
        "chapter_number" INTEGER NOT NULL,
        "chapter_title" VARCHAR(255) NOT NULL,
        "book_name" VARCHAR(255),
        "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
  },
};
