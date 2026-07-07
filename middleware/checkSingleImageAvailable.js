const multer = require('multer');
const fs = require('fs');
const errorMessage = require('../config/errorMessages');
const {
  megabytesToBytes,
  isMimeTypeValid,
  isQualityValid
} = require('../utils/imageUtils');
const {
  maxImageMegabytes,
  allowImageTypes,
  defaultQuality,
  qualityRange
} = require('../config/constants');
const uploadSingle = multer({
  dest: 'uploads/',
  limits: { fileSize: megabytesToBytes(maxImageMegabytes) }
}).single('image'); // 'image'要確認前端命名

function checkSingleImageAvailable(req, res, next) {
  uploadSingle(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // 檔案太大
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
          success: false,
          errorCode: 'FILE_TOO_LARGE',
          message: errorMessage.FILE_TOO_LARGE
        });
      }
    }

    // multer其他錯誤(例如多個檔案)
    if (err) {
      return res.status(400).json({
        success: false,
        errorCode: 'PROCESSING_FAILED',
        message: errorMessage.PROCESSING_FAILED
      });
    }

    // 未上傳檔案
    if (!req.file) {
      return res.status(400).json({
        success: false,
        errorCode: 'NO_FILE',
        message: errorMessage.NO_FILE
      });
    }

    // 檔案格式錯誤
    if (!isMimeTypeValid(req.file.mimetype, allowImageTypes)) {
      fs.unlink(req.file.path, () => {});
      return res.status(400).json({
        success: false,
        errorCode: 'UNSUPPORTED_FORMAT',
        message: errorMessage.UNSUPPORTED_FORMAT
      });
    }

    // 品質設定錯誤
    if (
      !isQualityValid(Number(req.body.quality ?? defaultQuality), qualityRange)
    ) {
      fs.unlink(req.file.path, () => {});
      return res.status(400).json({
        success: false,
        errorCode: 'INVALID_QUALITY',
        message: errorMessage.INVALID_QUALITY
      });
    }

    next();
  });
}

module.exports = checkSingleImageAvailable;
