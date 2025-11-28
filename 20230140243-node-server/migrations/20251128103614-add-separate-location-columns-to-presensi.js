'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Presensis', 'latitude_in', {
      type: Sequelize.DECIMAL(10, 8),
      allowNull: true,
    });
    await queryInterface.addColumn('Presensis', 'longitude_in', {
      type: Sequelize.DECIMAL(11, 8),
      allowNull: true,
    });
    await queryInterface.addColumn('Presensis', 'latitude_out', {
      type: Sequelize.DECIMAL(10, 8),
      allowNull: true,
    });
    await queryInterface.addColumn('Presensis', 'longitude_out', {
      type: Sequelize.DECIMAL(11, 8),
      allowNull: true,
    });
    // Opsional: Hapus kolom lama jika tidak digunakan lagi
    await queryInterface.removeColumn('Presensis', 'latitude');
    await queryInterface.removeColumn('Presensis', 'longitude');
  },

  down: async (queryInterface, Sequelize) => {
    // Logika rollback (mengembalikan keadaan)
    await queryInterface.removeColumn('Presensis', 'latitude_in');
    await queryInterface.removeColumn('Presensis', 'longitude_in');
    await queryInterface.removeColumn('Presensis', 'latitude_out');
    await queryInterface.removeColumn('Presensis', 'longitude_out');
  }
};