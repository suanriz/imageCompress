// 圖片轉檔：MVP 固定輸出 WebP

// 圖片處理失敗	500	圖片處理失敗，請稍後再試
const sharp = require('sharp');

function bytesToMegabytes(bytes) {
  return bytes / 1024 / 1024;
}

function megabytesToBytes(megabytes) {
  return megabytes * 1024 * 1024;
}

function isMimeTypeValid(mimetype, allowImageTypes) {
  const allowMimeTypes = allowImageTypes.map((type) => {
    if (type.toLowerCase() === 'jpg') {
      type = 'jpeg';
    }
    return `image/${type.toLowerCase()}`;
  });
  return allowMimeTypes.includes(mimetype);
}

function isQualityValid(quality, qualityRange) {
  if (
    Number.isNaN(quality) ||
    quality < qualityRange.min ||
    quality > qualityRange.max
  ) {
    return false;
  }
  return true;
}

module.exports = {
  bytesToMegabytes,
  megabytesToBytes,
  isMimeTypeValid,
  isQualityValid
};
