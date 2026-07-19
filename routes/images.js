const express = require('express');
const fs = require('fs');
const checkImagesAvailable = require('../middleware/checkImagesAvailable');
const errorMessage = require('../config/errorMessages');
const processImage = require('../utils/imageProcessor');
const { calculateSavedPercent } = require('../utils/imageUtils');
const { defaultQuality, outputDir } = require('../config/constants');
const fileStore = require('../service/fileStore')

const router = express.Router();

// 建立輸出資料夾
fs.mkdirSync(outputDir, { recursive: true });

router.post('/process', checkImagesAvailable, async (req, res) => {
  const quality = Number(req.body.quality ?? defaultQuality);
  const changeType = req.body.changeType;

  // 對每張圖片並行壓縮，各自獨立捕捉錯誤
  const tasks = req.files.map(async (file) => {
    // multer 產生的隨機檔名取前 15 碼作為輸出檔名
    const newFileName = file.filename.slice(0, 15);

    try {
      const buf = await fs.promises.readFile(file.path);
      const compressedImage = await processImage(buf, outputDir, {
        changeType,
        quality,
        filename: newFileName
      });

      const outputSize = compressedImage.size;
      const originalSize = file.size;
      const savedPercent = calculateSavedPercent(originalSize, outputSize);
      const publicFilePath = `/${compressedImage.filePath.replace(/^\/+/, '')}`;

      fs.unlink(file.path, () => {});

      return {
        originalName: file.originalname,
        success: true,
        data: {
          filename: compressedImage.filename,
          originalSize,
          outputSize,
          savedPercent,
          format: compressedImage.format,
          downloadUrl: publicFilePath
        }
      };
    } catch (error) {
      fs.unlink(file.path, () => {});

      const isUnsupported =
        error.message === '不支援此圖片格式';

      return {
        originalName: file.originalname,
        success: false,
        errorCode: isUnsupported ? 'UNSUPPORTED_FORMAT' : 'INVALID_IMAGE',
        message: isUnsupported
          ? errorMessage.UNSUPPORTED_FORMAT
          : errorMessage.INVALID_IMAGE
      };
    }
  });

  // 將 middleware 過濾掉的不合法格式檔案也加入失敗清單
  const rejectedResults = (req.rejectedFiles || []).map((originalName) => ({
    originalName,
    success: false,
    errorCode: 'UNSUPPORTED_FORMAT',
    message: errorMessage.UNSUPPORTED_FORMAT
  }));

  const results = [...(await Promise.all(tasks)), ...rejectedResults];
  const successCount = results.filter((r) => r.success).length;
  const failCount = results.length - successCount;

  return res.status(200).json({
    success: true,
    total: results.length,
    successCount,
    failCount,
    results
  });
});

module.exports = router;
