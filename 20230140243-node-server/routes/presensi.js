const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const presensiController = require("../controllers/presensiController");
const authenticateToken = require("../middleware/authenticateToken");
const { isAdmin } = require("../middleware/permissionMiddleware");
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
router.post("/checkin", authenticateToken, presensiController.CheckIn);
router.post("/checkout", authenticateToken, presensiController.CheckOut);
router.get("/", authenticateToken, isAdmin, presensiController.getAllPresensi);
router.put("/:id", authenticateToken, isAdmin, validatePresensiUpdate, presensiController.updatePresensi);
router.delete("/:id", authenticateToken, isAdmin, presensiController.deletePresensi);
module.exports = router;
