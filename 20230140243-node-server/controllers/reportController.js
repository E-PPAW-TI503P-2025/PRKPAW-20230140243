const { Presensi } = require("../models");
const { Op } = require("sequelize");

exports.getDailyReport = async (req, res) => {
  try {
    const { nama, tanggal } = req.query; // ambil query params
    let options = { where: {} };

   
    if (nama) {
      options.where.nama = {
        [Op.like]: `%${nama}%`,
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
      data: records,
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal mengambil laporan",
      error: error.message,
    });
  }
};
