const multer = require('multer');
const path = require('path');

// Konfigurasi penyimpanan file
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Ganti './uploads' dengan folder penyimpanan yang Anda inginkan
        cb(null, 'uploads/'); 
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); 
    }
});

// Ekspor middleware 'upload'
const upload = multer({ storage: storage });

module.exports = upload;