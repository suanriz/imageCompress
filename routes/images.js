const express = require("express");
const fs = require("fs");
const path = require("path"); // Node.js 內建處理路徑的工具
const checkSingleImageAvailable = require("../middleware/checkSingleImageAvailable");
const { defaultQuality } = require("../config/constants");

//  引入圖片壓縮核心引擎
const { processImage } = require("../utils/imageProcessor");

const router = express.Router();

// 呼叫非同步的 processImage，路由函式前面加上 async
router.post("/process", checkSingleImageAvailable, async (req, res) => {
  try {
    // 取得合法的quality參數
    const quality = req.body.quality
      ? parseInt(req.body.quality, 10)
      : defaultQuality;

    // 設定壓縮後的新圖片名稱與路徑
    // 預設輸出為 webp 將新圖存放在與原圖相同的目錄下
    const ext = ".webp";
    const outputFilename = `compressed_${Date.now()}${ext}`; // 用時間戳記命名，防止檔名重複
    const outputPath = path.join(path.dirname(req.file.path), outputFilename);

    // 圖片壓縮(因為是 Promise，前面加 await)
    // 傳入參數對齊規格：(原始圖片路徑, 輸出路徑, { 目標格式, 品質 })
    const info = await processImage(req.file.path, outputPath, {
      changeType: "webp",
      quality: quality,
    });

    // 包裝符合規格書要求的數據
    const successResponse = {
      success: true,
      message: "圖片處理完成",
      data: {
        originalSize: req.file.size, // 原始檔案大小
        outputSize: info.size, // sharp 引擎回傳的真實大小
        savedPercent: Number(
          (((req.file.size - info.size) / req.file.size) * 100).toFixed(1),
        ), // 計算真實節省 %
        downloadUrl: `/uploads/${outputFilename}`, // 新圖片的"下載"路徑
      },
    };

    // 處理完畢，把原始暫存檔刪除，只留下壓縮後的 webp
    fs.unlink(req.file.path, () => {});

    //回傳 200 成功
    return res.status(200).json(successResponse);
  } catch (error) {
    console.error("圖片壓縮過程中發生未預期錯誤:", error);

    // 壓縮失敗要把原始暫存檔清掉
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, () => {});
    }

    return res.status(500).json({
      success: false,
      errorCode: "PROCESSING_FAILED",
      message: "圖片處理失敗，請稍後再試",
    });
  }
});

module.exports = router;
