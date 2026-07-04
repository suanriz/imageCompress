const express = require('express');
const fs = require('fs');
const checkSingleImageAvailable = require('../middleware/checkSingleImageAvailable');
const errorMessage = require('../config/errorMessages');

const router = express.Router();

router.post('/process', checkSingleImageAvailable, (req, res) => {
  // 先測試目前的程式碼
  fs.unlink(req.file.path, () => {});
  res.status(200).send('multer讀取成功');
});

module.exports = router;
