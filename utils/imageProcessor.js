const sharp = require('sharp');

/**
 * 處理圖片格式轉換與品質壓縮
 *
 * @async
 * @function processImage
 * @param {string|Buffer} originalImage - 原始圖片的路徑（String）或二進位資料（Buffer）
 * @param {string} outputPath - 處理完成後的圖片輸出儲存路徑，例:"./upload/新檔案名稱"
 * @param {Object} [options={}] - 選項設定
 * @param {string} [options.changeType=''] - 目標轉換格式（例如：'jpeg', 'png', 'webp'），留空則維持原格式
 * @param {number} [options.quality=80] - 圖片壓縮品質，範圍為 1-100（對 PNG 來說是品質參考值）
 * @returns {Promise<Object>} 回傳 sharp 的 info 物件，包含 size, width, height 等資訊
 */
const processImage = async (originalImage, outputPath, options = {changeType: '', quality: 80}) => {
  const { quality, changeType } = options

  try {
    const image = sharp(originalImage)
    const metadata = await image.metadata()
    console.log(metadata)
    // 有指定 changeType 就轉檔，沒有就用原始格式壓縮
    const format = changeType || metadata.format

    switch (format) {
      case 'jpeg':
      case 'jpg':
        return await image.jpeg({ quality, chromaSubsampling: '4:2:0', mozjpeg: true, }).toFile(outputPath)
      case 'png':
        return await image.png({ quality, compressionLevel: 9 }).toFile(outputPath)
      case 'webp':
        return await image.webp({ quality, reductionEffort: 6 }).toFile(outputPath)
      default:
        throw new Error('不支援此圖片格式')
    }
  } catch (err) {
    throw err
  }
}