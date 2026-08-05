'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('push_subscriptions', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      school_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: { model: 'schools', key: 'id' },
        onDelete: 'CASCADE',
      },
      user_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },
      endpoint: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      p256dh: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      auth: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      user_agent: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('push_subscriptions', ['user_id']);
    await queryInterface.addIndex('push_subscriptions', ['school_id']);
    await queryInterface.addConstraint('push_subscriptions', {
      fields: ['user_id', 'endpoint'],
      type: 'unique',
      name: 'unique_user_push_endpoint',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('push_subscriptions');
  },
};
