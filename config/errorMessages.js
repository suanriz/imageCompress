const {
  allowImageTypes,
  maxImageMegabytes,
  qualityRange,
  maxBatchCount
} = require('./constants');

module.exports = {
  NO_FILES: '請至少選擇一張圖片',
  TOO_MANY_FILES: `一次最多上傳 ${maxBatchCount} 張圖片`,
  UNSUPPORTED_FORMAT: `目前只支援 ${allowImageTypes.join('、')} 格式`,
  FILE_TOO_LARGE: `圖片大小不可超過 ${maxImageMegabytes}MB`,
  INVALID_IMAGE: '無法讀取圖片，請重新選擇',
  INVALID_QUALITY: `圖片品質必須設定在 ${qualityRange.min} 到 ${qualityRange.max} 之間`,
  PROCESSING_FAILED: '圖片處理失敗，請稍後再試',
  NETWORK_ERROR: '無法連線至伺服器，請稍後再試',
  SERVER_ERROR: '系統發生錯誤，請稍後再試'
};
