# 前後端訊息整理

這份文件用來統一圖片壓縮工具的成功訊息與錯誤訊息，實際內容可再依照程式功能調整。

## 成功訊息

| 發生情況 | 顯示給使用者的訊息 |
| --- | --- |
| 圖片處理完成 | 圖片處理完成！ |
| 圖片成功轉換格式 | 圖片已成功轉換為 WebP 格式 |
| 圖片壓縮後有變小 | 圖片壓縮完成，成功減少檔案大小 |
| 圖片壓縮後沒有變小 | 圖片已完成轉換，但檔案大小沒有減少 |
| 圖片下載成功 | 圖片下載完成 |
| 批次圖片全部處理完成 | 所有圖片處理完成！ |
| 批次圖片部分處理成功 | 部分圖片處理完成，請確認失敗項目 |

## 成功回應格式

後端處理成功時，可以統一回傳：

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

### 成功回應欄位說明

* `success`：代表這次批次圖片處理請求是否完成。
* `message`：顯示給使用者看的成功訊息。
* `total`：本次處理的圖片總數。
* `successCount`：處理成功的圖片數量。
* `failCount`：處理失敗的圖片數量。
* `results`：每張圖片的處理結果。
* `originalName`：原始檔案名稱。
* `data`：單張圖片處理完成後的相關資料。
* `filename`：處理後的檔案名稱。
* `originalSize`：原始圖片大小。
* `outputSize`：處理後圖片大小。
* `savedPercent`：減少的檔案大小比例。
* `format`：輸出圖片格式。
* `downloadUrl`：處理後圖片的下載網址。

> 實際回傳欄位可依照後端程式調整。

---

## 錯誤訊息

| 發生情況 | 錯誤代碼 | 顯示給使用者的訊息 |
| --- | --- | --- |
| 沒有選擇任何圖片 | `NO_FILES` | 請至少選擇一張圖片 |
| 一次上傳超過張數限制 | `TOO_MANY_FILES` | 一次最多上傳 10 張圖片 |
| 圖片格式不支援 | `UNSUPPORTED_FORMAT` | 目前只支援 JPG、PNG、WebP 格式 |
| 圖片超過大小限制 | `FILE_TOO_LARGE` | 圖片大小不可超過 5MB |
| 圖片損壞或無法讀取 | `INVALID_IMAGE` | 無法讀取圖片，請重新選擇 |
| 品質不是有效數字或超出 1～100 | `INVALID_QUALITY` | 圖片品質必須設定在 1 到 100 之間 |
| 圖片處理失敗 | `PROCESSING_FAILED` | 圖片處理失敗，請稍後再試 |
| 無法連線到伺服器 | `NETWORK_ERROR` | 無法連線至伺服器，請稍後再試 |
| 系統發生其他錯誤 | `SERVER_ERROR` | 系統發生錯誤，請稍後再試 |

## 錯誤回應格式

後端發生錯誤時，可以統一回傳：

```json
{
  "success": false,
  "errorCode": "FILE_TOO_LARGE",
  "message": "圖片大小不可超過 5MB"
}
```

### 錯誤回應欄位說明

* `success`：錯誤時設定為 `false`。
* `errorCode`：提供程式判斷錯誤類型。
* `message`：顯示給使用者看的錯誤訊息。

前端收到錯誤回應後，建議將 `message` 的內容顯示在畫面上。

---

## 前後端訊息一致性

前台顯示給使用者的訊息，建議盡量與後端回傳的 `message` 保持一致。

例如未選擇圖片時，後端可能回傳：

```json
{
  "success": false,
  "errorCode": "NO_FILES",
  "message": "請至少選擇一張圖片"
}
```

前台建議顯示：

```text
請至少選擇一張圖片
```

不建議前台與後端使用不同文字，例如前台顯示瀏覽器原生提示「請選取一個或多個檔案」，但後端回傳「請至少選擇一張圖片」，以免使用者體驗不一致。

---

## 顯示原則

不要直接將程式的原始錯誤顯示給使用者。

例如，不建議顯示：

```text
MulterError: LIMIT_FILE_SIZE
```

建議改成：

```text
圖片大小不可超過 5MB
```

不建議顯示：

```text
Input buffer contains unsupported image format
```

建議改成：

```text
無法讀取圖片，請重新選擇
```

錯誤訊息應清楚說明發生原因，並讓使用者知道接下來可以怎麼處理。