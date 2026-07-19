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
  qualityRange,
  maxBatchCount
} = require('../config/constants');

const uploadArray = multer({
  dest: 'uploads/',
  limits: { fileSize: megabytesToBytes(maxImageMegabytes) }
}).array('images', maxBatchCount); // 'images' 對應前端 FormData 欄位名

function checkImagesAvailable(req, res, next) {
  uploadArray(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // 單張檔案超過大小限制
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
          success: false,
          errorCode: 'FILE_TOO_LARGE',
          message: errorMessage.FILE_TOO_LARGE
        });
      }
      // 超過批量張數上限
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
          success: false,
          errorCode: 'TOO_MANY_FILES',
          message: errorMessage.TOO_MANY_FILES
        });
      }
    }

    // 其他 multer 錯誤
    if (err) {
      return res.status(400).json({
        success: false,
        errorCode: 'PROCESSING_FAILED',
        message: errorMessage.PROCESSING_FAILED
      });
    }

    // 未上傳任何檔案
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        errorCode: 'NO_FILES',
        message: errorMessage.NO_FILES
      });
    }

    // 逐一過濾不合法 MIME Type，刪除暫存並從陣列移除
    const validFiles = [];
    const invalidFiles = [];
    for (const file of req.files) {
      if (isMimeTypeValid(file.mimetype, allowImageTypes)) {
        validFiles.push(file);
      } else {
        invalidFiles.push(file.originalname);
        fs.unlink(file.path, () => {});
      }
    }

    // 全部圖片格式都不合法
    if (validFiles.length === 0) {
      return res.status(400).json({
        success: false,
        errorCode: 'UNSUPPORTED_FORMAT',
        message: errorMessage.UNSUPPORTED_FORMAT
      });
    }

    // 將不合法的檔名記錄給 route 層使用
    req.files = validFiles;
    req.rejectedFiles = invalidFiles;

    // 品質設定驗證
    if (
      !isQualityValid(Number(req.body.quality ?? defaultQuality), qualityRange)
    ) {
      // 刪除所有已接受的暫存檔
      for (const file of validFiles) {
        fs.unlink(file.path, () => {});
      }
      return res.status(400).json({
        success: false,
        errorCode: 'INVALID_QUALITY',
        message: errorMessage.INVALID_QUALITY
      });
    }

    next();
  });
}

module.exports = checkImagesAvailable;
