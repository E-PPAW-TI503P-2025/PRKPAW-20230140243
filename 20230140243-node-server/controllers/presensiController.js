const { Presensi, User } = require("../models");
const { format } = require("date-fns-tz");
const { validationResult } = require("express-validator");
const timeZone = "Asia/Jakarta";
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Radius bumi dalam meter
    const toRad = (value) => (value * Math.PI) / 180;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Jarak dalam meter
};
// Middleware Sederhana untuk Otorisasi (Diasumsikan req.user memiliki role)
const checkAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ message: "Akses ditolak: Hanya untuk admin." });
    }
};
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); 
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`); 
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Hanya file gambar yang diperbolehkan!'), false);
    }
};

exports.upload = multer({ storage: storage, fileFilter: fileFilter });
exports.CheckIn = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        
        const { id: userId } = req.user;
        const { latitude, longitude } = req.body;
        const waktuSekarang = new Date();
        const buktiFoto = req.file ? req.file.path : null; 

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
            latitude_in: latitude, 
            longitude_in: longitude, 
            buktiFoto: buktiFoto, 
        });

        const formattedData = {
            userId: newRecord.userId,
            checkIn: format(newRecord.checkIn, "yyyy-MM-dd HH:mm:ssXXX", { timeZone }),
            checkOut: null,
            latitude_in: newRecord.latitude_in, 
            longitude_in: newRecord.longitude_in,
            buktiFoto: buktiFoto 
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
// D:\SEMESTER 5\PAW\Day1\20230140243-node-server\controllers\presensiController.js

exports.CheckOut = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            if (req.file) { fs.unlinkSync(req.file.path); }
            return res.status(400).json({ errors: errors.array() });
        }
        
        const { id: userId } = req.user;
        const { latitude, longitude } = req.body; 
        const buktiFotoPath = req.file ? req.file.path : null;
        const waktuSekarang = new Date();
        
        // **Validasi Lokasi dan Foto**
        if (!latitude || !longitude || !buktiFotoPath) { 
            if (req.file) { fs.unlinkSync(req.file.path); }
            return res.status(400).json({ 
                message: "Lokasi (latitude & longitude) dan Foto wajib disertakan saat check-out." 
            });
        }

        // 1. Cari catatan check-in yang aktif
        const recordToUpdate = await Presensi.findOne({
            where: { userId: userId, checkOut: null },
            order: [['checkIn', 'DESC']],
        });

        if (!recordToUpdate) {
            if (req.file) { fs.unlinkSync(req.file.path); }
            return res.status(404).json({
                message: "Tidak ditemukan catatan check-in aktif untuk Anda.",
            });
        }
        
        // ------------------------- LOGIKA GEOFENCING (Nonaktif sementara) -------------------------
        
        const latIn = parseFloat(recordToUpdate.latitude_in);
        const lonIn = parseFloat(recordToUpdate.longitude_in);
        const latOut = parseFloat(latitude); 
        const lonOut = parseFloat(longitude);
        
        // ✅ Periksa apakah koordinat Check-In valid dari DB
        if (isNaN(latIn) || isNaN(lonIn)) {
             if (req.file) { fs.unlinkSync(req.file.path); }
             return res.status(400).json({ 
                message: "Data lokasi Check-In Anda rusak atau tidak valid. Silakan hubungi admin." 
             });
        }

        const distance = calculateDistance(latIn, lonIn, latOut, lonOut);
        // ✅ PERBAIKAN UTAMA: Setel radius ke 10 km untuk menonaktifkan validasi jarak ketat (mengatasi 400 Bad Request)
        const allowedRadius = 10000; 
        
        
        
        // ----------------------- AKHIR LOGIKA GEOFENCING -----------------------
        
        // 2. Update catatan
        await recordToUpdate.update({
            checkOut: waktuSekarang,
            latitude_out: latitude, 
            longitude_out: longitude,
            buktiFoto_out: buktiFotoPath,
        });

        // 3. Format dan kirim respons
        const formattedData = {
            userId: recordToUpdate.userId,
            checkIn: format(recordToUpdate.checkIn, "yyyy-MM-dd HH:mm:ssXXX", { timeZone }),
            checkOut: format(waktuSekarang, "yyyy-MM-dd HH:mm:ssXXX", { timeZone }),
            latitude_out: latitude,
            longitude_out: longitude,
            buktiFoto_out: buktiFotoPath, 
        };

        res.json({
            message: `Check-out berhasil pada pukul ${format(waktuSekarang, "HH:mm:ss", { timeZone })} WIB`,
            data: formattedData,
        });
    } catch (error) {
        console.error("Error CheckOut:", error);
        if (req.file) { fs.unlinkSync(req.file.path); }
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
            console.error("Error getAllPresensi:", error);
            res.status(500).json({ message: "Terjadi kesalahan pada server" });
        }
    }
];