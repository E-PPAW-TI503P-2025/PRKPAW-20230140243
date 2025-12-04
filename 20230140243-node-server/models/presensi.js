'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Presensi extends Model {
    static associate(models) {
      // Definisi Relasi: Setiap Presensi dimiliki oleh satu User
      Presensi.belongsTo(models.User, {
        foreignKey: 'userId', 
        as: 'user' // Diubah dari 'user' menjadi 'User' agar konsisten dengan konvensi Sequelize/Node.js (PascalCase untuk Model)
      });
    }

  }
  Presensi.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    checkIn: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    checkOut: {
      type: DataTypes.DATE,
      allowNull: true, 
    },
    
    buktiFoto: {
      type: DataTypes.STRING, // Menyimpan path atau nama file foto
      allowNull: true,
    },
    // ✅ PERBAIKAN: Kolom Lokasi Masuk
    latitude_in: { 
        type: DataTypes.DECIMAL(10, 8),
        allowNull: true
    },
    longitude_in: { 
        type: DataTypes.DECIMAL(11, 8),
        allowNull: true 
    },

    // ✅ PERBAIKAN: Kolom Lokasi Keluar
    latitude_out: { 
        type: DataTypes.DECIMAL(10, 8),
        allowNull: true
    },
    longitude_out: { 
        type: DataTypes.DECIMAL(11, 8),
        allowNull: true 
    },
 
  }, {
    sequelize,
    modelName: 'Presensi',
    
  },
  );
  return Presensi;
};