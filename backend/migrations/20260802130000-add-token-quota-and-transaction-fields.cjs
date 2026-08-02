'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Add image_generation_balance to token_accounts
    await queryInterface.addColumn('token_accounts', 'image_generation_balance', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });

    // 2. Add annual_image_generations to token_policies
    await queryInterface.addColumn('token_policies', 'annual_image_generations', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });

    // 3. Add resource_type to token_transactions
    await queryInterface.addColumn('token_transactions', 'resource_type', {
      type: Sequelize.ENUM('tokens', 'video_seconds', 'image_generations'),
      allowNull: false,
      defaultValue: 'tokens',
    });

    // 4. Add ref_id to token_transactions
    await queryInterface.addColumn('token_transactions', 'ref_id', {
      type: Sequelize.BIGINT,
      allowNull: true,
    });

    // 5. Add reason to token_transactions
    await queryInterface.addColumn('token_transactions', 'reason', {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('token_transactions', 'reason');
    await queryInterface.removeColumn('token_transactions', 'ref_id');
    await queryInterface.removeColumn('token_transactions', 'resource_type');
    await queryInterface.removeColumn('token_policies', 'annual_image_generations');
    await queryInterface.removeColumn('token_accounts', 'image_generation_balance');
  },
};
