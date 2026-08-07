# ImageCompress

ImageCompress 是一個圖片壓縮與轉檔工具，使用者可以批次上傳圖片，並設定壓縮品質與輸出格式，系統會協助處理圖片壓縮與格式轉換。

目前專案仍在開發中，功能、畫面與 API 回應格式會依照團隊進度持續調整。

## 功能介紹

- 支援批次上傳圖片
- 支援 JPG、PNG、WebP 圖片格式
- 可設定圖片壓縮品質
- 可選擇輸出格式：壓縮、JPG、PNG、WebP
- 顯示批量圖片處理結果
- 顯示處理總數、成功數量與失敗數量
- 顯示每張圖片的處理結果
- 提供處理後圖片預覽與下載
- 支援一鍵下載成功處理的圖片
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
- Bootstrap

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
3. 選擇輸出格式
   - 壓縮：維持原圖片格式並進行壓縮
   - JPG：轉換為 JPG
   - PNG：轉換為 PNG
   - WebP：轉換為 WebP
4. 設定圖片壓縮品質
5. 點擊「開始壓縮圖片」
6. 查看批量處理結果
7. 確認總數、成功數量與失敗數量
8. 預覽或下載處理後圖片
9. 可使用「一鍵下載」下載所有成功處理的圖片

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
| changeType | Text | 輸出格式，可填 `jpeg`、`png`、`webp`，留空則維持原格式壓縮 |
| quality | Text | 圖片品質，範圍 1～100 |

## 成功回應範例

```json
{
  "success": true,
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
        "downloadUrl": "/downloads/result-1.webp",
        "previewUrl": "/downloads/result-1.webp"
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
        "downloadUrl": "/downloads/result-2.webp",
        "previewUrl": "/downloads/result-2.webp"
      }
    }
  ]
}
```

## 部分成功回應範例

批次上傳時，若部分圖片成功、部分圖片失敗，後端仍會回傳本次批次處理結果，並在 `results` 中標示每張圖片的處理狀態。

```json
{
  "success": true,
  "total": 2,
  "successCount": 1,
  "failCount": 1,
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
        "downloadUrl": "/downloads/result-1.webp",
        "previewUrl": "/downloads/result-1.webp"
      }
    },
    {
      "originalName": "example-2.gif",
      "success": false,
      "errorCode": "UNSUPPORTED_FORMAT",
      "message": "目前只支援 JPG、PNG、WebP 格式"
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
- 選擇「壓縮」並維持原格式
- 選擇輸出為 JPG
- 選擇輸出為 PNG
- 選擇輸出為 WebP
- quality 設定為 80
- quality 設定為 50
- 確認處理結果是否顯示總數、成功數量與失敗數量
- 確認每張成功圖片是否顯示原始大小、輸出大小、節省比例、格式、預覽與下載按鈕
- 確認「一鍵下載」是否能下載所有成功處理的圖片

### 錯誤情境

- 未選擇圖片直接送出
- 上傳不支援格式，例如 GIF
- 上傳超過 5MB 的圖片
- 一次上傳超過 10 張圖片
- quality 設定為 0
- quality 設定為 101
- quality 設定為非數字，例如 abc
- 全部圖片處理失敗時，確認畫面提示是否清楚
- 沒有成功結果時點擊「一鍵下載」，確認是否顯示提示訊息

## Demo 流程

Demo 時可依照以下流程展示：

1. 開啟首頁
2. 選擇多張圖片
3. 選擇輸出格式，例如 WebP
4. 調整圖片品質設定
5. 點擊「開始壓縮圖片」
6. 顯示批量處理結果
7. 說明總數、成功數量與失敗數量
8. 查看單張圖片的處理結果、預覽圖與節省比例
9. 下載單張處理後圖片
10. 使用「一鍵下載」下載所有成功處理的圖片
11. 示範錯誤情境，例如未選圖片或上傳不支援格式
12. 說明錯誤提示如何協助使用者理解問題

## 產品打磨重點

本專案除了圖片處理功能外，也重視使用者操作時的理解成本與錯誤提示體驗。

目前產品打磨重點包含：

- 前台操作流程是否清楚
- 輸出格式選項是否容易理解
- 結果區是否能清楚顯示批次圖片處理狀態
- 成功與失敗結果是否容易分辨
- 單張圖片的預覽、下載與壓縮結果是否清楚
- 一鍵下載功能是否符合使用者期待
- 錯誤訊息是否能讓使用者理解原因
- 前後端顯示訊息是否一致
- README 是否能讓其他人順利安裝與測試專案
- Demo 流程是否能完整展示專案功能

## 目前開發狀態

- 圖片批次上傳功能持續調整中
- 輸出格式選擇功能持續調整中
- 前台結果區持續調整中
- 一鍵下載功能持續調整中
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
| satsuki | 使用 AI 協助整理 README 架構、錯誤訊息文件、測試項目與 Demo 流程草稿。 |

### AI 協作範圍

- 協助理解套件與程式邏輯
- 協助分析錯誤訊息與可能原因
- 協助檢查圖片驗證流程是否有潛在問題
- 協助整理 README、錯誤訊息與測試項目
- 協助規劃 Demo 流程與前台畫面說明

### 注意事項

AI 產出的內容僅作為開發輔助與討論參考，實際程式碼、功能規格、錯誤訊息與文件內容，皆由團隊成員依照專案需求進行確認、測試與調整。