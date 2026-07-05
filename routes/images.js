const express = require("express");
const router = express.Router();

// 測試用
const multer = require("multer");
// 測試用設定 multer：上傳的圖片要暫存到 uploads 資料夾
const upload = multer({ dest: "uploads/" });

router.post("/process", upload.single("image"), (req, res) => {
  // 防呆：檢查有沒有上傳檔案 (對應 NO_FILE)
  if (!req.file) {
    return res.status(400).json({
      success: false,
      errorCode: "NO_FILE",
      message: "請先選擇圖片",
    });
  }

  // 防呆：檢查圖片是否超過 5MB (對應 FILE_TOO_LARGE)

  const maxSize = 5 * 1024 * 1024; // 5MB 轉成位元組 (Bytes)
  if (req.file.size > maxSize) {
    return res.status(400).json({
      success: false,
      errorCode: "FILE_TOO_LARGE",
      message: "圖片大小不可超過 5MB",
    });
  }

  // 防呆：檢查圖片品質
  //  從前端的請求主體 (req.body) 中，把 quality 拿出來
  // 因為 app.js 有寫 app.use(express.json())，所以直接用 req.body 抓資料

  const quality = req.body.quality ? parseInt(req.body.quality, 10) : 80;
  // 防呆驗證：檢查 quality 是不是在 1~100 之間
  if (isNaN(quality) || quality < 1 || quality > 100) {
    return res.status(400).json({
      success: false,
      errorCode: "INVALID_QUALITY", // 錯誤代碼
      message: "圖片品質必須設定在 1 到 100 之間", // 提示訊息
    });
  }

  //  如果檢查沒問題，就順利過關
  res.json({
    success: true,
    message: "圖片與參數皆成功通過 API 驗證！",
    debugInfo: {
      originalname: req.file.originalname, // 圖片原名
      mimetype: req.file.mimetype, // 檔案格式
      sizeBytes: req.file.size, // 檔案大小
      qualitySetting: quality, // 品質設定
    },
  });
});

module.exports = router;
