const { Presensi, User } = require("../models");
const { format } = require("date-fns-tz");
const { validationResult } = require("express-validator");

const timeZone = "Asia/Jakarta";

// === CHECK-IN ===
exports.CheckIn = async (req, res) => {
  try {
    const { id: userId } = req.user; // ✅ Ambil dari JWT payload
    const waktuSekarang = new Date();

    // Cek apakah user sudah check-in tapi belum check-out
    const existingRecord = await Presensi.findOne({
      where: { userId: userId, checkOut: null },
    });

    if (existingRecord) {
      return res.status(400).json({
        message: "Anda sudah melakukan check-in hari ini.",
      });
    }

    // Buat data baru tanpa kolom nama
    const newRecord = await Presensi.create({
      userId: userId,
      checkIn: waktuSekarang,
    });

    const formattedData = {
      userId: newRecord.userId,
      checkIn: format(newRecord.checkIn, "yyyy-MM-dd HH:mm:ssXXX", { timeZone }),
      checkOut: null,
    };

    res.status(201).json({
      message: `Check-in berhasil pada pukul ${format(
        waktuSekarang,
        "HH:mm:ss",
        { timeZone }
      )} WIB`,
      data: formattedData,
    });
  } catch (error) {
    res.status(500).json({
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

// === CHECK-OUT ===
exports.CheckOut = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const waktuSekarang = new Date();

    // Cari data check-in aktif milik user ini
    const recordToUpdate = await Presensi.findOne({
      where: { userId: userId, checkOut: null },
    });

    if (!recordToUpdate) {
      return res.status(404).json({
        message: "Tidak ditemukan catatan check-in aktif untuk Anda.",
      });
    }

    // Update waktu keluar
    recordToUpdate.checkOut = waktuSekarang;
    await recordToUpdate.save();

    const formattedData = {
      userId: recordToUpdate.userId,
      checkIn: format(recordToUpdate.checkIn, "yyyy-MM-dd HH:mm:ssXXX", { timeZone }),
      checkOut: format(recordToUpdate.checkOut, "yyyy-MM-dd HH:mm:ssXXX", { timeZone }),
    };

    res.json({
      message: `Check-out berhasil pada pukul ${format(waktuSekarang, "HH:mm:ss", { timeZone })} WIB`,
      data: formattedData,
    });
  } catch (error) {
    res.status(500).json({
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

// === DELETE PRESENSI ===
exports.deletePresensi = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const presensiId = req.params.id;

    const recordToDelete = await Presensi.findByPk(presensiId);

    if (!recordToDelete) {
      return res.status(404).json({
        message: "Catatan presensi tidak ditemukan.",
      });
    }

    if (recordToDelete.userId !== userId) {
      return res.status(403).json({
        message: "Akses ditolak: Anda bukan pemilik catatan ini.",
      });
    }

    await recordToDelete.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

// === UPDATE PRESENSI ===
exports.updatePresensi = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const { waktuCheckIn, waktuCheckOut } = req.body;

    const presensi = await Presensi.findByPk(id);
    if (!presensi) {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }

    if (waktuCheckIn) presensi.checkIn = waktuCheckIn;
    if (waktuCheckOut) presensi.checkOut = waktuCheckOut;

    await presensi.save();

    res.status(200).json({
      message: `Data presensi ${id} berhasil diupdate.`,
      data: presensi,
    });
  } catch (err) {
    res.status(500).json({
      message: "Terjadi kesalahan pada server",
      error: err.message,
    });
  }
};

// === GET SEMUA PRESENSI (dengan relasi User untuk ambil nama user) ===
exports.getAllPresensi = async (req, res) => {
  try {
    const data = await Presensi.findAll({
      include: [{ model: User, attributes: ["nama"] }],
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({
      message: "Gagal mengambil data presensi",
      error: error.message,
    });
  }
};
