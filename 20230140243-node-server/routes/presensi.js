const express = require('express');
const router = express.Router();
const presensiController = require('../controllers/presensiController');
const { addUserData } = require('../middleware/permissionMiddleware');

const { body } = require('express-validator');

const validatePresensiUpdate = [
  body('waktuCheckIn')
    .optional() 
    .isISO8601() 
    .withMessage('Format waktuCheckIn harus tanggal ISO 8601 yang valid.'),

  body('waktuCheckOut')
    .optional()
    .isISO8601()
    .withMessage('Format waktuCheckOut harus tanggal ISO 8601 yang valid.')
];


router.use(addUserData);


router.post('/check-in', presensiController.CheckIn);
router.post('/check-out', presensiController.CheckOut);


router.put(
  '/:id',
  validatePresensiUpdate, 
  presensiController.updatePresensi
);

router.delete('/:id', presensiController.deletePresensi);

module.exports = router;