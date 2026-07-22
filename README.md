# ImageCompress

ImageCompress 是一個圖片壓縮與轉檔工具，使用者可以上傳圖片，並設定壓縮品質，系統會協助處理圖片壓縮與格式轉換。

目前專案仍在開發中，功能、畫面與 API 回應格式會依照團隊進度持續調整。

## 功能介紹

- 支援批次上傳圖片
- 支援 JPG、PNG、WebP 圖片格式
- 可設定圖片壓縮品質
- 顯示圖片處理結果
- 顯示處理成功與失敗數量
- 提供處理後圖片下載
- 顯示成功與錯誤提示訊息

## 支援格式與限制

| 項目 | 規格 |
| --- | --- |
| 支援格式 | JPG、PNG、WebP |
| 單張圖片大小上限 | 5MB |
| 一次最多上傳張數 | 10 張 |
| quality 範圍 | 1～100 |
| 預設 quality | 80 |

## 使用技術

- Node.js
- Express
- Multer
- Sharp
- HTML
- CSS
- JavaScript
- Axios

## 安裝方式

請先確認電腦已安裝 Node.js。

下載專案後，在專案資料夾中安裝套件：

```bash
npm install
```

## 啟動方式

```bash
npm start
```

啟動成功後，終端機會顯示：

```text
Server listening on http://localhost:3000
```

接著可開啟以下網址查看前台畫面：

```text
http://localhost:3000
```

## 前台操作方式

1. 開啟首頁
2. 選擇一張或多張圖片
3. 設定圖片壓縮品質
4. 點擊「開始壓縮圖片」
5. 查看圖片處理結果
6. 下載處理後的圖片

## API 說明

### 圖片批次處理

```text
POST /images/process
```

### 請求格式

使用 `multipart/form-data`。

| Key | Type | 說明 |
| --- | --- | --- |
| images | File | 要上傳的圖片，可一次上傳多張 |
| quality | Text | 圖片品質，範圍 1～100 |

## 成功回應範例

```json
{
  "success": true,
  "message": "圖片處理完成！",
  "total": 2,
  "successCount": 2,
  "failCount": 0,
  "results": [
    {
      "originalName": "example-1.jpg",
      "success": true,
      "data": {
        "filename": "result-1.webp",
        "originalSize": 340992,
        "outputSize": 152576,
        "savedPercent": 55.3,
        "format": "webp",
        "downloadUrl": "/downloads/result-1.webp"
      }
    },
    {
      "originalName": "example-2.png",
      "success": true,
      "data": {
        "filename": "result-2.webp",
        "originalSize": 420000,
        "outputSize": 210000,
        "savedPercent": 50,
        "format": "webp",
        "downloadUrl": "/downloads/result-2.webp"
      }
    }
  ]
}
```

## 錯誤回應範例

```json
{
  "success": false,
  "errorCode": "NO_FILES",
  "message": "請至少選擇一張圖片"
}
```

更多成功與錯誤訊息整理請參考：[docs/ERROR_MESSAGES.md](docs/ERROR_MESSAGES.md)

## 測試項目

### 成功情境

- 上傳 1 張 JPG 圖片
- 上傳 1 張 PNG 圖片
- 上傳 1 張 WebP 圖片
- 一次上傳多張圖片
- quality 設定為 80
- quality 設定為 50
- 確認處理結果是否顯示成功數量、失敗數量與下載資訊

### 錯誤情境

- 未選擇圖片直接送出
- 上傳不支援格式，例如 GIF
- 上傳超過 5MB 的圖片
- 一次上傳超過 10 張圖片
- quality 設定為 0
- quality 設定為 101
- quality 設定為非數字，例如 abc

## Demo 流程

Demo 時可依照以下流程展示：

1. 開啟首頁
2. 選擇多張圖片
3. 調整圖片品質設定
4. 點擊「開始壓縮圖片」
5. 顯示圖片處理結果
6. 說明成功處理數量與失敗數量
7. 下載處理後圖片
8. 示範錯誤情境，例如未選圖片或上傳不支援格式
9. 說明錯誤提示如何協助使用者理解問題

## 產品打磨重點

本專案除了圖片處理功能外，也重視使用者操作時的理解成本與錯誤提示體驗。

目前產品打磨重點包含：

- 前台操作流程是否清楚
- 結果區是否能清楚顯示圖片處理狀態
- 錯誤訊息是否能讓使用者理解原因
- 前後端顯示訊息是否一致
- README 是否能讓其他人順利安裝與測試專案
- Demo 流程是否能完整展示專案功能

## 目前開發狀態

- 圖片批次上傳功能持續調整中
- 前台結果區持續調整中
- 錯誤訊息與回應格式持續整理中
- README 與 Demo 流程持續補充中

## AI 協作說明

本專案在開發與文件整理過程中，有使用 AI 工具協助理解技術內容、檢查程式問題與整理文件架構。

AI 工具主要作為輔助工具，協助團隊成員釐清問題、分析錯誤原因與整理說明文字，最終內容仍由團隊成員依照實際專案狀況確認與修改。

### 使用情境

| 成員 | AI 協助內容 |
| --- | --- |
| 君 | 使用 AI（Claude Code）針對圖片驗證機制進行潛在漏洞分析，協助檢查不當操作或惡意攻擊可能造成的問題。 |
| 阿幹 | 使用 AI 協助了解套件使用方式、分析程式碼錯誤，並協助建立 Demo 前端畫面的初步功能。 |
| Satsuki | 使用 AI 協助整理 README 架構、錯誤訊息文件、測試項目與 Demo 流程草稿。 |

### AI 協作範圍

- 協助理解套件與程式邏輯
- 協助分析錯誤訊息與可能原因
- 協助檢查圖片驗證流程是否有潛在問題
- 協助整理 README、錯誤訊息與測試項目
- 協助規劃 Demo 流程與前台畫面說明

### 注意事項

AI 產出的內容僅作為開發輔助與討論參考，實際程式碼、功能規格、錯誤訊息與文件內容，皆由團隊成員依照專案需求進行確認、測試與調整。
