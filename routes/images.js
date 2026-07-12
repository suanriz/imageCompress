const express = require('express');
const fs = require('fs');
const checkSingleImageAvailable = require('../middleware/checkSingleImageAvailable');
const errorMessage = require('../config/errorMessages');
const processImage = require('../utils/imageProcessor');
const { calculateSavedPercent } = require('../utils/imageUtils');
const { defaultQuality, outputDir } = require('../config/constants');

const router = express.Router();

// 建立輸出資料夾
fs.mkdirSync(outputDir, { recursive: true });

router.post('/process', checkSingleImageAvailable, async (req, res) => {
  // multer 產生的隨機檔名 + 原始檔名
  const newFileName = req.file.filename.slice(0, 15);

  try {
    // sharp 壓縮
    const buf = fs.readFileSync(req.file.path);
    const compressedImage = await processImage(buf, outputDir, {
      changeType: req.body.changeType,
      quality: Number(req.body.quality ?? defaultQuality),
      filename: newFileName
    });

    const outputSize = compressedImage.size;
    const originalSize = req.file.size;
    const savedPercent = calculateSavedPercent(originalSize, outputSize);
    const publicFilePath = `/${compressedImage.filePath.replace(/^\/+/, '')}`;

    // 刪除暫存檔
    fs.unlink(req.file.path, () => {});
    return res.status(200).json({
      success: true,
      data: {
        filename: compressedImage.filename,
        originalSize,
        outputSize,
        savedPercent,
        format: compressedImage.format,
        previewUrl: publicFilePath,
        downloadUrl: publicFilePath
      }
    });
  } catch (error) {
    fs.unlink(req.file.path, () => {});
    if (error.message === '不支援此圖片格式') {
      return res.status(400).json({
        success: false,
        errorCode: 'UNSUPPORTED_FORMAT',
        message: errorMessage.UNSUPPORTED_FORMAT
      });
    }
    // sharp 其他錯誤(例如檔案損毀)
    return res.status(400).json({
      success: false,
      errorCode: 'INVALID_IMAGE',
      message: errorMessage.INVALID_IMAGE
    });
  }
});

module.exports = router;
