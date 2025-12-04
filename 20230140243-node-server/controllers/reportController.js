const { Presensi, User } = require("../models"); // 1. Impor Model User
const { Op } = require("sequelize");

exports.getDailyReport = async (req, res) => {
  try {
    const { nama, tanggal } = req.query; 
    let options = { 
        where: {}, 
        // 3. Tambahkan Eager Loading untuk model User
        include: [{ 
            model: User, 
            as: 'user', // Sesuai dengan alias di models/presensi.js
            attributes: ['id', 'nama', 'email'], // Kolom yang ingin diambil
        }],
        order: [['checkIn', 'DESC']]
    };

   
    if (nama) {
      // 2. Filter Nama berdasarkan relasi (tabel User)
      options.include[0].where = { 
            nama: {
                [Op.like]: `%${nama}%`,
            }
        };
    }

    // 📅 Filter berdasarkan tanggal (mencocokkan tanggal checkIn)
    if (tanggal) {
      const startOfDay = new Date(`${tanggal}T00:00:00Z`);
      const endOfDay = new Date(`${tanggal}T23:59:59Z`);
      options.where.checkIn = {
        [Op.between]: [startOfDay, endOfDay],
      };
    }

    const records = await Presensi.findAll(options);

    res.json({
      reportDate: new Date().toLocaleDateString(),
      totalData: records.length,
      // Data sekarang menyertakan objek 'user'
      data: records, 
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal mengambil laporan",
      error: error.message,
    });
  }
};