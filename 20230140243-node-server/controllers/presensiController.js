 	// 1. Ganti sumber data dari array ke model Sequelize
 	const { Presensi } = require("../models");
 	const { format } = require("date-fns-tz");
 	const timeZone = "Asia/Jakarta";
 	
 	exports.CheckIn = async (req, res) => {
 	  // 2. Gunakan try...catch untuk error handling
 	  try {
 	    const { id: userId, nama: userName } = req.user;
 	    const waktuSekarang = new Date();
 	
 	    // 3. Ubah cara mencari data menggunakan 'findOne' dari Sequelize
 	    const existingRecord = await Presensi.findOne({
 	      where: { userId: userId, checkOut: null },
 	    });
 	
 	    if (existingRecord) {
 	      return res
 	        .status(400)
 	        .json({ message: "Anda sudah melakukan check-in hari ini." });
 	    }
 	
 	    // 4. Ubah cara membuat data baru menggunakan 'create' dari Sequelize
 	    const newRecord = await Presensi.create({
 	      userId: userId,
 	      nama: userName,
 	      checkIn: waktuSekarang,
 	    });
 	    
 	    const formattedData = {
 	        userId: newRecord.userId,
 	        nama: newRecord.nama,
 	        checkIn: format(newRecord.checkIn, "yyyy-MM-dd HH:mm:ssXXX", { timeZone }),
 	        checkOut: null
 	    };
 	
 	    res.status(201).json({
 	      message: `Halo ${userName}, check-in Anda berhasil pada pukul ${format(
 	        waktuSekarang,
 	        "HH:mm:ss",
 	        { timeZone }
 	      )} WIB`,
 	      data: formattedData,
 	    });
 	  } catch (error) {
 	    res.status(500).json({ message: "Terjadi kesalahan pada server", error: error.message });
 	  }
 	};
 	
 	exports.CheckOut = async (req, res) => {
 	  // Gunakan try...catch
 	  try {
 	    const { id: userId, nama: userName } = req.user;
 	    const waktuSekarang = new Date();
 	
 	    // Cari data di database
 	    const recordToUpdate = await Presensi.findOne({
 	      where: { userId: userId, checkOut: null },
 	    });
 	
 	    if (!recordToUpdate) {
 	      return res.status(404).json({
 	        message: "Tidak ditemukan catatan check-in yang aktif untuk Anda.",
 	      });
 	    }
 	
 	    // 5. Update dan simpan perubahan ke database
 	    recordToUpdate.checkOut = waktuSekarang;
 	    await recordToUpdate.save();
 	
 	    const formattedData = {
 	        userId: recordToUpdate.userId,
 	        nama: recordToUpdate.nama,
 	        checkIn: format(recordToUpdate.checkIn, "yyyy-MM-dd HH:mm:ssXXX", { timeZone }),
 	        checkOut: format(recordToUpdate.checkOut, "yyyy-MM-dd HH:mm:ssXXX", { timeZone }),
 	    };
 	
 	    res.json({
 	      message: `Selamat jalan ${userName}, check-out Anda berhasil pada pukul ${format(
 	        waktuSekarang,
 	        "HH:mm:ss",
 	        { timeZone }
 	      )} WIB`,
 	      data: formattedData,
 	    });
 	  } catch (error) {
 	    res.status(500).json({ message: "Terjadi kesalahan pada server", error: error.message });
 	  }
	  
 	};

	exports.deletePresensi = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const presensiId = req.params.id;
    const recordToDelete = await Presensi.findByPk(presensiId);

    if (!recordToDelete) {
      return res
        .status(404)
        .json({ message: "Catatan presensi tidak ditemukan." });
    }
    if (recordToDelete.userId !== userId) {
      return res
        .status(403)
        .json({ message: "Akses ditolak: Anda bukan pemilik catatan ini." });
    }
      await recordToDelete.destroy();
    res.status(204).send();
  } catch (error) {
    res
      .status(500)
      .json({ message: "Terjadi kesalahan pada server", error: error.message });
  }
};

exports.updatePresensi = async (req, res) => {
  // Periksa hasil validasi DI AWAL FUNGSI
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Jika ada error, kirim respon 400 (Bad Request)
    return res.status(400).json({ errors: errors.array() });
  }

  // 3. Jika tidak ada error, baru lanjutkan logika bisnis Anda
  try {
    const { id } = req.params;
    const { waktuCheckIn, waktuCheckOut } = req.body;

    // ... (Logika Anda untuk update data ke database) ...
    const presensi = await Presensi.findByPk(id);
    if (!presensi) {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }
    
    // Update field jika ada di body
    if (waktuCheckIn) presensi.waktuCheckIn = waktuCheckIn;
    if (waktuCheckOut) presensi.waktuCheckOut = waktuCheckOut;
    
    await presensi.save();
    
    res.status(200).json({
      message: `Data presensi ${id} berhasil diupdate.`,
      data: presensi
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Terjadi error pada server" });
  }
};



