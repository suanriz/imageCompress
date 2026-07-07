const sharp = require('sharp');

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

function isImageTypeValid(imageType, allowImageTypes) {
  const allowTypes = allowImageTypes.map((type) => {
    if (type.toLowerCase() === 'jpg') {
      type = 'jpeg';
    }
    return `${type.toLowerCase()}`;
  });
  return allowTypes.includes(imageType);
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

function calculateSavedPercent(originalSize, outputSize) {
  const percent = (1 - outputSize / originalSize) * 100;
  // 小數點一位
  return Math.round(percent * 10) / 10;
}

module.exports = {
  megabytesToBytes,
  isMimeTypeValid,
  isImageTypeValid,
  isQualityValid,
  calculateSavedPercent
};
