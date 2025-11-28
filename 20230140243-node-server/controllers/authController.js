const { User } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');	
const JWT_SECRET = 'INI_ADALAH_KUNCI_RAHASIA_ANDA_YANG_SANGAT_AMAN';
require('dotenv').config();


exports.register = async (req, res) => {
  try {
    const { nama, email, password, role } = req.body;

    if (!nama || nama.trim() === '' || 
            !email || email.trim() === '' || 
            !password || password.trim() === '') 
        {
            return res.status(400).json({ message: "Nama, email, dan password harus diisi" });
        }

    if (role && !['mahasiswa', 'admin'].includes(role)) {
      return res.status(400).json({ message: "Role tidak valid. Harus 'mahasiswa' atau 'admin'." });
    }

    const hashedPassword = await bcrypt.hash(password, 10); 
    const newUser = await User.create({
      nama: nama,
      email: email,
      password: hashedPassword,
      role: role || 'mahasiswa' 
    });

    res.status(201).json({
      message: "Registrasi berhasil",
      data: { id: newUser.id, email: newUser.email, role: newUser.role }
    });

  } catch (error) {
    if (error.nama === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: "Email sudah terdaftar." });
    }
    res.status(500).json({ message: "Terjadi kesalahan pada server", error: error.message });
  }
};


exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: "Email tidak ditemukan." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Password salah." });
        }

        const payload = {
            id: user.id,
            nama: user.nama,
            role: user.role 
        };

        // Menggunakan JWT_SECRET yang diambil dari variabel lingkungan
        const token = jwt.sign(payload, JWT_SECRET, {
            expiresIn: '1h' 
        });

        res.json({
            message: "Login berhasil",
            token: token 
        });

    } catch (error) {
        res.status(500).json({ message: "Terjadi kesalahan pada server", error: error.message });
    }
};



exports.presensi=async (req, res) => {
  try {
    const { id: userId } = req.user; 
    const waktuSekarang = new Date();
    const existingRecord = await Presensi.findOne({
      where: { userId: userId, checkOut: null },
    });
    if (existingRecord) {
      return res.status(400).json({
        message: "Anda sudah melakukan check-in hari ini.",
      });
    }
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