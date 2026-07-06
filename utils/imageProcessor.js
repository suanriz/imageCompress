const sharp = require('sharp');
const path = require('path');
const { defaultQuality, allowImageTypes } = require('../config/constants');
const { isImageTypeValid } = require('../utils/imageUtils');

/**
 * 處理圖片格式轉換與品質壓縮
 *
 * @async
 * @function processImage
 * @param {string|Buffer} originalImage - 原始圖片的路徑（String）或二進位資料（Buffer）
 * @param {string} outputDir - 處理完成後的圖片輸出儲存路徑，例:"downloads/"
 * @param {Object} [options={}] - 選項設定
 * @param {string} [options.changeType=''] - 目標轉換格式（例如：'jpeg', 'png', 'webp'），留空則維持原格式
 * @param {number} [options.quality=80] - 圖片壓縮品質，範圍為 1-100（對 PNG 來說是品質參考值）
 * @returns {Promise<Object>} 回傳 sharp 的 info 物件，包含 size, width, height 等資訊
 */
const processImage = async (originalImage, outputDir, options) => {
  const { changeType, filename } = options;
  const quality = options.quality || defaultQuality;

  try {
    const image = sharp(originalImage);
    const metadata = await image.metadata();

    // 防止使用者改副檔名
    if (!isImageTypeValid(metadata.format, allowImageTypes)) {
      throw new Error('不支援此圖片格式');
    }

    // 有指定 changeType 就轉檔，沒有就用原始格式壓縮
    const format = changeType || metadata.format;

    const outputFilename = `${filename}.${format}`;
    const outputPath = path.posix.join(outputDir, outputFilename);
    let result;

    switch (format) {
      case 'jpeg':
      case 'jpg':
        result = await image
          .jpeg({ quality, chromaSubsampling: '4:2:0', mozjpeg: true })
          .toFile(outputPath);
        break;
      case 'png':
        result = await image
          .png({ quality, compressionLevel: 9 })
          .toFile(outputPath);
        break;
      case 'webp':
        result = await image
          .webp({ quality, reductionEffort: 6 })
          .toFile(outputPath);
        break;
      default:
        // sharp支援但不符合規格(例如gif)
        throw new Error('不支援此圖片格式');
    }

    return { ...result, filename: outputFilename, filePath: outputPath };
  } catch (err) {
    // sharp不支援的格式(例如pdf)
    if (err.message.includes('unsupported image format')) {
      throw new Error('不支援此圖片格式');
    }
    throw err;
  }
};

module.exports = processImage;
