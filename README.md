# ImageCompress：圖片壓縮與轉檔工具

## 情境與任務描述

在網站開發或內容上架時，常會遇到圖片檔案過大，導致頁面載入速度變慢、圖片管理不方便的情況。

ImageCompress 是一個使用 Node.js 與 Express 製作的圖片壓縮與轉檔工具，使用者可以一次上傳多張圖片，設定壓縮品質，並選擇是否轉換輸出格式。

本專案目前以「批次圖片處理」為主要功能，目標是讓使用者可以快速完成圖片壓縮、查看處理結果，並下載處理後的圖片。

---

## 主要功能

- 批次上傳圖片
- 支援 JPG、PNG、WebP 圖片格式
- 設定圖片壓縮品質
- 選擇輸出格式：壓縮、JPG、PNG、WebP
- 顯示批次處理結果
- 顯示總數、成功數量與失敗數量
- 顯示單張圖片的處理結果
- 預覽處理後圖片
- 下載單張圖片
- 一鍵下載所有成功處理的圖片
- 顯示錯誤提示，協助使用者理解問題

---

## 支援格式與限制

| 項目 | 規格 |
| --- | --- |
| 支援格式 | JPG、PNG、WebP |
| 單張圖片大小上限 | 5MB |
| 一次最多上傳張數 | 10 張 |
| quality 範圍 | 1～100 |
| 預設 quality | 80 |

---

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

---

## 快速開始

### Step 1：安裝環境

請先確認電腦已安裝 Node.js。

建議使用 Node.js 18 以上版本。

### Step 2：下載專案並安裝套件

進入專案資料夾後，執行：

```bash
npm install
```

### Step 3：啟動專案

```bash
npm start
```

啟動成功後，終端機會顯示：

```text
Server listening on http://localhost:3000
```

### Step 4：開啟前台畫面

在瀏覽器開啟：

```text
http://localhost:3000
```

---

## 前台操作方式

1. 開啟首頁
2. 選擇一張或多張圖片
3. 選擇輸出格式
   - 壓縮：維持原格式並進行壓縮
   - JPG：轉換為 JPG
   - PNG：轉換為 PNG
   - WebP：轉換為 WebP
4. 調整圖片品質
5. 點擊「開始壓縮圖片」
6. 查看批量處理結果
7. 確認成功與失敗數量
8. 預覽或下載處理後圖片
9. 可使用「一鍵下載」下載所有成功處理的圖片

---

## API 說明

### 圖片批次處理

```text
POST /images/process
```

此 API 用來接收一張或多張圖片，並依照使用者設定的品質與輸出格式進行處理。

### 請求格式

使用 `multipart/form-data`。

| Key | Type | 必填 | 說明 |
| --- | --- | --- | --- |
| images | File | 是 | 要上傳的圖片，可一次上傳多張 |
| changeType | Text | 否 | 輸出格式，可填 `jpeg`、`png`、`webp`，留空則維持原格式壓縮 |
| quality | Text | 否 | 圖片品質，範圍 1～100，未填時使用預設值 80 |

---

## Postman 範例請求

### 範例 1：上傳單張圖片並轉成 WebP

| Key | Type | Value |
| --- | --- | --- |
| images | File | 選擇一張 JPG、PNG 或 WebP 圖片 |
| changeType | Text | webp |
| quality | Text | 80 |

### 範例 2：批次上傳多張圖片

若要一次上傳多張圖片，請在 Postman 的 `form-data` 中新增多個同名欄位 `images`。

| Key | Type | Value |
| --- | --- | --- |
| images | File | 圖片 1 |
| images | File | 圖片 2 |
| images | File | 圖片 3 |
| changeType | Text | webp |
| quality | Text | 80 |

### 範例 3：維持原格式壓縮

| Key | Type | Value |
| --- | --- | --- |
| images | File | 選擇一張或多張圖片 |
| changeType | Text | 留空 |
| quality | Text | 80 |

---

## 範例回應

### 全部處理成功

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

### 部分圖片處理失敗

批次上傳時，可能會出現部分圖片成功、部分圖片失敗的情況。

例如同時上傳 JPG 與 GIF 時，JPG 可以成功處理，GIF 會被標示為失敗。

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

### 請求錯誤

```json
{
  "success": false,
  "errorCode": "NO_FILES",
  "message": "請至少選擇一張圖片"
}
```

更多成功與錯誤訊息整理請參考：[docs/ERROR_MESSAGES.md](docs/ERROR_MESSAGES.md)

---

## 驗證與測試

### 本機前台測試

啟動專案後，開啟：

```text
http://localhost:3000
```

建議測試以下情境：

| 測試情境 | 預期結果 |
| --- | --- |
| 上傳 1 張 JPG | 顯示處理結果與下載按鈕 |
| 上傳 1 張 PNG | 顯示處理結果與下載按鈕 |
| 上傳 1 張 WebP | 顯示處理結果與下載按鈕 |
| 一次上傳多張圖片 | 顯示總數、成功數量與失敗數量 |
| 選擇輸出 WebP | 成功圖片輸出為 WebP |
| 調整 quality | 圖片依照設定品質處理 |
| 點擊一鍵下載 | 下載所有成功處理的圖片 |
| 未選圖片直接送出 | 顯示「請至少選擇一張圖片」 |
| 上傳不支援格式 | 顯示格式不支援提示 |
| 上傳超過 10 張圖片 | 顯示張數限制提示 |

### Postman 測試

Postman 測試網址：

```text
POST http://localhost:3000/images/process
```

Body 請選擇 `form-data`，並依照測試情境填入 `images`、`changeType`、`quality`。

---

## 常見錯誤

### Q1：沒有選圖片就送出會怎樣？

會回傳或顯示：

```json
{
  "success": false,
  "errorCode": "NO_FILES",
  "message": "請至少選擇一張圖片"
}
```

### Q2：上傳 GIF 可以嗎？

目前不支援 GIF。  
支援格式為 JPG、PNG、WebP。

若上傳 GIF，會顯示：

```json
{
  "success": false,
  "errorCode": "UNSUPPORTED_FORMAT",
  "message": "目前只支援 JPG、PNG、WebP 格式"
}
```

### Q3：一次可以上傳幾張圖片？

一次最多可以上傳 10 張圖片。

若超過限制，會顯示：

```json
{
  "success": false,
  "errorCode": "TOO_MANY_FILES",
  "message": "一次最多上傳 10 張圖片"
}
```

### Q4：quality 可以填多少？

quality 範圍為 1～100。

若超出範圍，會顯示：

```json
{
  "success": false,
  "errorCode": "INVALID_QUALITY",
  "message": "圖片品質必須設定在 1 到 100 之間"
}
```

### Q5：為什麼壓縮後檔案沒有變小？

不同圖片格式與內容會影響壓縮結果。  
有些圖片原本已經壓縮過，再次處理後檔案大小不一定會明顯下降。

---

## Demo 流程

成果展示時可依照以下流程：

1. 開啟首頁
2. 選擇多張 JPG、PNG 或 WebP 圖片
3. 選擇輸出格式，例如 WebP
4. 調整圖片品質
5. 點擊「開始壓縮圖片」
6. 查看批量處理結果
7. 說明總數、成功數量與失敗數量
8. 查看單張圖片的預覽、格式與節省比例
9. 下載單張圖片
10. 使用「一鍵下載」下載所有成功處理的圖片
11. 示範錯誤情境，例如上傳 GIF
12. 說明錯誤提示如何協助使用者理解問題

---

## 目前開發狀態

目前專案仍在開發與打磨中，主要調整方向包含：

- 批次上傳流程
- 輸出格式選擇
- 前台結果區顯示
- 一鍵下載功能
- 錯誤訊息與前後端提示一致性
- README 與 Demo 流程文件

---

## AI 協作紀錄

本專案開發與文件整理過程中，部分成員有使用 AI 工具輔助理解問題、整理文件或分析程式狀況。

| 成員 | AI 協助內容 |
| --- | --- |
| 君 | 使用 Claude Code 協助檢查圖片驗證機制，分析可能的不當操作或安全風險。 |
| 阿幹 | 使用 AI 協助理解套件使用方式、分析程式錯誤，並建立 Demo 前端畫面的初步功能。 |
| Satsuki | 使用 AI 協助整理 README、錯誤訊息文件、測試項目與 Demo 流程草稿。 |

AI 產出的內容僅作為討論與整理參考，實際功能、文件與測試結果仍由團隊成員依照專案狀況確認與調整。