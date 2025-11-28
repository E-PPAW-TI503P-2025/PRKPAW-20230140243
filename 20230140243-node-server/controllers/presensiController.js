const { Presensi, User } = require("../models");
const { format } = require("date-fns-tz");
const { validationResult } = require("express-validator");
const timeZone = "Asia/Jakarta";


// Middleware Sederhana untuk Otorisasi (Diasumsikan req.user memiliki role)
const checkAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ message: "Akses ditolak: Hanya untuk admin." });
    }
};

exports.CheckIn = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        
        const { id: userId } = req.user;
        const { latitude, longitude } = req.body;
        const waktuSekarang = new Date();

        // **Validasi Lokasi**
        if (!latitude || !longitude) {
            return res.status(400).json({ message: "Lokasi (latitude & longitude) harus disertakan." });
        }

        // 1. Cek apakah sudah ada check-in aktif
        const existingRecord = await Presensi.findOne({
            where: { userId: userId, checkOut: null },
        });

        if (existingRecord) {
            return res.status(400).json({
                message: "Anda sudah melakukan check-in. Mohon check-out terlebih dahulu.",
            });
        }
        
        // 2. Buat catatan baru (termasuk lokasi masuk)
        const newRecord = await Presensi.create({
            userId: userId,
            checkIn: waktuSekarang,
            latitude_in: latitude, // Asumsi nama kolom di DB adalah latitude_in
            longitude_in: longitude, // Asumsi nama kolom di DB adalah longitude_in
        });

        const formattedData = {
            userId: newRecord.userId,
            checkIn: format(newRecord.checkIn, "yyyy-MM-dd HH:mm:ssXXX", { timeZone }),
            checkOut: null,
            latitude_in: newRecord.latitude_in, 
            longitude_in: newRecord.longitude_in,
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
        console.error("Error CheckIn:", error);
        res.status(500).json({
            message: "Terjadi kesalahan pada server",
            error: error.message,
        });
    }
};

exports.CheckOut = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        
        const { id: userId } = req.user;
        const { latitude, longitude } = req.body; // Ambil lokasi check-out
        const waktuSekarang = new Date();
        
        // **Validasi Lokasi**
        if (!latitude || !longitude) {
            return res.status(400).json({ message: "Lokasi (latitude & longitude) harus disertakan saat check-out." });
        }

        // 1. Cari catatan check-in yang aktif (belum check-out)
        const recordToUpdate = await Presensi.findOne({
            where: { userId: userId, checkOut: null },
            order: [['checkIn', 'DESC']], // Ambil yang terbaru jika ada lebih dari satu (meskipun seharusnya tidak)
        });

        if (!recordToUpdate) {
            return res.status(404).json({
                message: "Tidak ditemukan catatan check-in aktif untuk Anda.",
            });
        }

        // 2. Update catatan dengan waktu dan lokasi check-out
        await recordToUpdate.update({
            checkOut: waktuSekarang,
            latitude_out: latitude, // Asumsi nama kolom di DB adalah latitude_out
            longitude_out: longitude,
        });

        // 3. Format dan kirim respons
        const formattedData = {
            userId: recordToUpdate.userId,
            checkIn: format(recordToUpdate.checkIn, "yyyy-MM-dd HH:mm:ssXXX", { timeZone }),
            checkOut: format(waktuSekarang, "yyyy-MM-dd HH:mm:ssXXX", { timeZone }),
            latitude_out: latitude,
            longitude_out: longitude,
        };

        res.json({
            message: `Check-out berhasil pada pukul ${format(waktuSekarang, "HH:mm:ss", { timeZone })} WIB`,
            data: formattedData,
        });
    } catch (error) {
        console.error("Error CheckOut:", error);
        res.status(500).json({
            message: "Terjadi kesalahan pada server",
            error: error.message,
        });
    }
};

exports.deletePresensi = [
    checkAdmin, // Otorisasi: Hanya admin yang boleh menghapus
    async (req, res) => {
        try {
            const presensiId = req.params.id;

            const recordToDelete = await Presensi.findByPk(presensiId);

            if (!recordToDelete) {
                return res.status(404).json({
                    message: "Catatan presensi tidak ditemukan.",
                });
            }

            // Hapus pemeriksaan ownership (recordToDelete.userId !== userId) 
            // karena ini adalah fungsi Admin
            
            await recordToDelete.destroy();
            res.status(200).json({ message: `Catatan ID ${presensiId} berhasil dihapus.` });
            
        } catch (error) {
            console.error("Error deletePresensi:", error);
            res.status(500).json({
                message: "Terjadi kesalahan pada server",
                error: error.message,
            });
        }
    }
];

exports.updatePresensi = [
    checkAdmin, // Otorisasi: Hanya admin yang boleh mengupdate
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { id } = req.params;
            // Gunakan nama kolom yang tepat sesuai model Anda
            const { checkIn, checkOut, latitude_in, longitude_in, latitude_out, longitude_out } = req.body; 

            const presensi = await Presensi.findByPk(id);
            if (!presensi) {
                return res.status(404).json({ message: "Data tidak ditemukan" });
            }
            
            // Lakukan update
            const updatedData = {};
            if (checkIn) updatedData.checkIn = checkIn;
            if (checkOut) updatedData.checkOut = checkOut;
            if (latitude_in) updatedData.latitude_in = latitude_in;
            if (longitude_in) updatedData.longitude_in = longitude_in;
            if (latitude_out) updatedData.latitude_out = latitude_out;
            if (longitude_out) updatedData.longitude_out = longitude_out;

            await presensi.update(updatedData);

            res.status(200).json({
                message: `Data presensi ${id} berhasil diupdate.`,
                data: presensi,
            });
        } catch (err) {
            console.error("Error updatePresensi:", err);
            res.status(500).json({
                message: "Terjadi kesalahan pada server",
                error: err.message,
            });
        }
    }
];

exports.getAllPresensi = [
    checkAdmin, 
    async (req, res) => {
        try {
            const data = await Presensi.findAll({
                // ✅ Tambahkan alias yang benar (misalnya 'User' jika model menggunakan 'User')
                include: [{ model: User, as: 'User', attributes: ["nama", "email"] }], 
                order: [['checkIn', 'DESC']]
            });
            res.json({ presensi: data }); 
        } catch (error) {
            console.error("Error getAllPresensi:", error); // Log ini adalah kunci!
            // ...
        }
    }
];