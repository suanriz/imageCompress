const express = require("express");
const fs = require("fs");
const checkSingleImageAvailable = require("../middleware/checkSingleImageAvailable");
const errorMessage = require("../config/errorMessages");
const { defaultQuality } = require("../config/constants");

const router = express.Router();

router.post("/process", checkSingleImageAvailable, (req, res) => {
  try {
    //  取得絕對安全的 quality 參數（若前端沒傳，就用常數預設值）
    const quality = req.body.quality
      ? parseInt(req.body.quality, 10)
      : defaultQuality;

    // 符合標準成功 JSON 回應格式
    const successResponse = {
      success: true,
      message: "圖片處理完成",
      data: {
        originalSize: req.file.size, // 原始圖片大小 (bytes)
        outputSize: Math.floor(req.file.size * 0.45), // 模擬處理後大小（目前先寫死）
        savedPercent: 55.3, // 模擬減少的檔案大小比例
        downloadUrl: "/output/result.webp", // 模擬處理後圖片的下載網址
      },
    };

    // 暫存檔清理邏輯（避免未壓縮前的檔案爆硬碟）
    fs.unlink(req.file.path, () => {});

    //正式回應 200 成功
    return res.status(200).json(successResponse);
  } catch (error) {
    console.error("API 路由發生未預期錯誤:", error);
    return res.status(500).json({
      success: false,
      errorCode: "PROCESSING_FAILED",
      message: "圖片處理失敗，請稍後再試",
    });
  }
});

module.exports = router;
