const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const presensiController = require("../controllers/presensiController");
const authenticateToken = require("../middleware/authenticateToken");
const { isAdmin } = require("../middleware/permissionMiddleware");
const multer = require('multer');
const path = require('path');
// Konfigurasi penyimpanan file
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); 
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); 
    }
});
// Middleware 'upload'
const upload = multer({ storage: storage });
// Validasi input update presensi
const validatePresensiUpdate = [
  body("waktuCheckIn")
    .optional()
    .isISO8601()
    .withMessage("Format waktuCheckIn harus tanggal ISO 8601 yang valid."),
  body("waktuCheckOut")
    .optional()
    .isISO8601()
    .withMessage("Format waktuCheckOut harus tanggal ISO 8601 yang valid."),
];

// === ROUTES ===
router.post('/check-in', presensiController.upload.single('image'), authenticateToken, presensiController.CheckIn);
router.post('/check-out', authenticateToken, presensiController.upload.single('image'), presensiController.CheckOut);
router.get("/", authenticateToken, isAdmin, presensiController.getAllPresensi);
router.put("/:id", authenticateToken, isAdmin, validatePresensiUpdate, presensiController.updatePresensi);
router.delete("/:id", authenticateToken, isAdmin, presensiController.deletePresensi);
module.exports = router;
