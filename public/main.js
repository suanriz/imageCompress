// 緩存 DOM 元素引用
const uploadForm = document.getElementById('uploadForm');
const imageInput = document.getElementById('imageInput');
const fileDropzone = document.getElementById('fileDropzone');
const dropzoneTitle = document.getElementById('dropzoneTitle');
const dropzoneHint = document.getElementById('dropzoneHint');
const selectedFilesList = document.getElementById('selectedFilesList');
const qualityInput = document.getElementById('qualityInput');
const qualityValue = document.getElementById('qualityValue');
const submitBtn = document.getElementById('submitBtn');
const resultArea = document.getElementById('resultArea');
const resultList = document.getElementById('resultList');
const batchTotalCount = document.getElementById('batchTotalCount');
const batchSuccessCount = document.getElementById('batchSuccessCount');
const batchFailCount = document.getElementById('batchFailCount');
const batchStatusText = document.getElementById('batchStatusText');
const resetResultsBtn = document.getElementById('resetResultsBtn');
const clearResultsBtn = document.getElementById('clearResultsBtn');
const container = document.querySelector('.container');
const feedbackModalElement = document.getElementById('feedbackModal');
const feedbackModalLabel = document.getElementById('feedbackModalLabel');
const feedbackModalBody = document.getElementById('feedbackModalBody');
const feedbackModalHeader = feedbackModalElement.querySelector('.modal-header');
const feedbackModalCloseBtn = feedbackModalElement.querySelector('.btn-close');
const resultAreaClass = 'hidden-section';
const feedbackModal = new bootstrap.Modal(feedbackModalElement);
const fileRules = {
  maxBatchCount: 10,
  maxImageMegabytes: 5,
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  mimeToExtensions: {
    'image/jpeg': ['jpg', 'jpeg'],
    'image/png': ['png'],
    'image/webp': ['webp']
  }
};
const batchStatusLabel = {
  ready: 'Ready',
  partialSuccess: 'Partial Success',
  allSuccess: 'All Success'
};
const supportedExtensions = Object.values(fileRules.mimeToExtensions).flat();
let selectedImageFiles = [];
const batchStats = {
  total: 0,
  success: 0,
  fail: 0
};

function escapeHtml(text = '') {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function getFileExtension(filename = '') {
  const parts = String(filename).toLowerCase().split('.');
  return parts.length > 1 ? parts[parts.length - 1] : '';
}

function isSupportedExtension(extension = '') {
  return supportedExtensions.includes(extension);
}

function isJpegSignature(bytes) {
  return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
}

function isPngSignature(bytes) {
  return (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  );
}

function isWebpSignature(bytes) {
  return (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  );
}

async function detectTypeByMagicNumber(file) {
  const headerBuffer = await file.slice(0, 12).arrayBuffer();
  const bytes = new Uint8Array(headerBuffer);

  if (bytes.length < 12) {
    return null;
  }

  if (isJpegSignature(bytes)) {
    return 'image/jpeg';
  }

  if (isPngSignature(bytes)) {
    return 'image/png';
  }

  if (isWebpSignature(bytes)) {
    return 'image/webp';
  }

  return null;
}

function isFileSizeAllowed(file) {
  const maxBytes = fileRules.maxImageMegabytes * 1024 * 1024;
  return file.size <= maxBytes;
}

function buildLimitedNamesSummary(names) {
  const maxNamesInMessage = 5;
  const shown = names.slice(0, maxNamesInMessage);
  const hiddenCount = names.length - shown.length;

  return hiddenCount > 0
    ? `${shown.join('、')}（另 ${hiddenCount} 個）`
    : shown.join('、');
}

async function validateSelectedFiles(files) {
  const incomingFiles = Array.from(files || []);
  const filesByCount = incomingFiles.slice(0, fileRules.maxBatchCount);
  const ignoredByCount = incomingFiles.slice(fileRules.maxBatchCount);
  const invalidTypeFiles = [];
  const invalidSizeFiles = [];
  const validFiles = [];

  for (const file of filesByCount) {
    const extension = getFileExtension(file.name);
    const detectedType = await detectTypeByMagicNumber(file);

    if (!detectedType || !fileRules.allowedMimeTypes.includes(detectedType)) {
      invalidTypeFiles.push(file.name);
      continue;
    }

    if (file.type && file.type !== detectedType) {
      invalidTypeFiles.push(file.name);
      continue;
    }

    // 沒有副檔名時可接受，但若有副檔名需與可支援格式相符
    if (extension && !isSupportedExtension(extension)) {
      invalidTypeFiles.push(file.name);
      continue;
    }

    if (!isFileSizeAllowed(file)) {
      invalidSizeFiles.push(file.name);
      continue;
    }

    validFiles.push(file);
  }

  return {
    validFiles,
    invalidTypeFiles,
    invalidSizeFiles,
    ignoredByCount
  };
}

function buildValidationModalMessage(validation) {
  const messages = [];

  if (validation.ignoredByCount.length > 0) {
    messages.push(
      `張數超過限制：一次最多 ${fileRules.maxBatchCount} 張，已略過 ${validation.ignoredByCount.length} 張（${buildLimitedNamesSummary(validation.ignoredByCount.map((file) => file.name))}）`
    );
  }

  if (validation.invalidTypeFiles.length > 0) {
    messages.push(
      `格式不符合限制：僅支援 JPG、PNG、WebP（${buildLimitedNamesSummary(validation.invalidTypeFiles)}）`
    );
  }

  if (validation.invalidSizeFiles.length > 0) {
    messages.push(
      `檔案大小不符合限制：單檔不可超過 ${fileRules.maxImageMegabytes}MB（${buildLimitedNamesSummary(validation.invalidSizeFiles)}）`
    );
  }

  if (messages.length === 0) {
    return '';
  }

  return `${messages.join('；')}。\n\n系統已保留符合限制的檔案。`;
}

function toReadableSize(bytes) {
  return `${Number(bytes).toLocaleString()} bytes`;
}

function getSelectedFormat() {
  const selectedFormat = document.querySelector(
    'input[name="changeType"]:checked'
  );

  return selectedFormat ? selectedFormat.value : '';
}

function setSubmitLoading(isLoading) {
  submitBtn.disabled = isLoading;
  submitBtn.innerText = isLoading ? '⏳ 處理中...' : '開始壓縮圖片';
}

function recordErrorCode(context, errorCode, extra = {}) {
  if (!errorCode) {
    return;
  }

  console.warn('[ImageCompress][ErrorCode]', {
    context,
    errorCode,
    ...extra
  });
}

function resetDropzoneState() {
  fileDropzone.classList.remove('has-files', 'is-dragover');
  dropzoneTitle.innerText = '拖曳圖片到這裡，或點擊挑選檔案';
  dropzoneHint.innerText = '支援 JPEG、PNG、WebP';
  selectedFilesList.innerHTML = '';
  selectedFilesList.classList.add('hidden');
}

function syncImageInputFiles(files) {
  const dataTransfer = new DataTransfer();
  files.forEach((file) => dataTransfer.items.add(file));
  imageInput.files = dataTransfer.files;
}

function refreshSelectedFilesDisplay() {
  const files = selectedImageFiles;

  if (!files.length) {
    resetDropzoneState();
    return;
  }

  fileDropzone.classList.add('has-files');
  dropzoneTitle.innerText = `已選擇 ${files.length} 張圖片`;
  dropzoneHint.innerText = '可點擊檔名右側 x 移除單一檔案';
  selectedFilesList.innerHTML = files
    .map(
      (file, index) => `
        <span class="dropzone-file-pill">
          <span class="dropzone-file-pill-text">${escapeHtml(file.name)}</span>
          <button
            type="button"
            class="dropzone-file-pill-remove"
            data-file-index="${index}"
            aria-label="移除 ${escapeHtml(file.name)}"
            title="移除"
          >x</button>
        </span>
      `
    )
    .join('');
  selectedFilesList.classList.remove('hidden');
}

async function setSelectedFiles(files) {
  const incomingFiles = Array.from(files || []);
  const validation = await validateSelectedFiles([
    ...selectedImageFiles,
    ...incomingFiles
  ]);
  selectedImageFiles = validation.validFiles;
  syncImageInputFiles(selectedImageFiles);
  refreshSelectedFilesDisplay();

  const validationMessage = buildValidationModalMessage(validation);
  if (validationMessage) {
    showFeedbackModal('⚠️ 選檔檢查提醒', validationMessage);
  }
}

function removeSelectedFileByIndex(index) {
  if (Number.isNaN(index) || index < 0 || index >= selectedImageFiles.length) {
    return;
  }

  selectedImageFiles = selectedImageFiles.filter(
    (_, itemIndex) => itemIndex !== index
  );
  syncImageInputFiles(selectedImageFiles);
  refreshSelectedFilesDisplay();
}

function clearSelectedFiles() {
  selectedImageFiles = [];
  syncImageInputFiles(selectedImageFiles);
  resetDropzoneState();
}

function updateBatchSummary(resultCount, successCount, failCount) {
  batchStats.total += resultCount;
  batchStats.success += successCount;
  batchStats.fail += failCount;

  refreshBatchSummary();
}

function refreshBatchSummary() {
  batchTotalCount.innerText = String(batchStats.total);
  batchSuccessCount.innerText = String(batchStats.success);
  batchFailCount.innerText = String(batchStats.fail);

  if (batchStats.total === 0) {
    batchStatusText.innerText = batchStatusLabel.ready;
    return;
  }

  batchStatusText.innerText =
    batchStats.fail > 0
      ? batchStatusLabel.partialSuccess
      : batchStatusLabel.allSuccess;
}

function resetBatchResults() {
  batchStats.total = 0;
  batchStats.success = 0;
  batchStats.fail = 0;

  resultList.innerHTML = '';
  resultArea.classList.add(resultAreaClass);
  container.classList.remove('has-result');
  refreshBatchSummary();
}

function downloadAllSuccessfulResults() {
  const successLinks = Array.from(
    resultList.querySelectorAll(
      '.result-card[data-result-type="success"] .result-card-action--download'
    )
  );

  if (successLinks.length === 0) {
    showFeedbackModal('ℹ️ 提示', '目前沒有可下載的成功結果');
    return;
  }

  successLinks.forEach((link, index) => {
    setTimeout(() => {
      const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
      });
      link.dispatchEvent(clickEvent);
    }, index * 120);
  });
}

function appendResultCards(results) {
  const cardsHtml = results
    .map((item) =>
      item.success ? buildSuccessCard(item) : buildFailureCard(item)
    )
    .join('');

  resultList.insertAdjacentHTML('beforeend', cardsHtml);
}

function buildDownloadActionLink(downloadUrl) {
  return `
    <a
      class="result-card-action result-card-action--download"
      href="${escapeHtml(downloadUrl)}"
      download
      aria-label="下載壓縮檔案"
      title="下載"
    >
      <svg
        class="result-card-action-icon"
        viewBox="0 0 24 24"
        aria-hidden="true"
        focusable="false"
      >
        <path
          d="M5 20h14a1 1 0 0 0 1-1v-4h-2v3H6v-3H4v4a1 1 0 0 0 1 1Zm6-3 5-5h-3V4h-4v8H6l5 5Z"
        />
      </svg>
    </a>
  `;
}

function buildResultActions({ downloadUrl = null, single = false } = {}) {
  const actionsClass = single
    ? 'result-card-actions result-card-actions--single'
    : 'result-card-actions';

  return downloadUrl
    ? `
      <div class="${actionsClass}">
        ${buildDownloadActionLink(downloadUrl)}
      </div>
    `
    : '';
}

function buildSuccessCard(item) {
  const { data, originalName } = item;
  const previewUrl = data.previewUrl || data.downloadUrl;
  const displaySource = originalName || data.filename;

  return `
    <article class="surface-card result-card" data-result-type="success">
      <div class="result-header">
        <div>
          <span class="section-kicker">Done</span>
          <h3>${escapeHtml(data.filename)}</h3>
          <p class="result-filename">${escapeHtml(displaySource)}</p>
        </div>
      </div>

      <div class="result-hero">
        <div class="hero-score">
          <span class="hero-score-value">${data.savedPercent}</span>
          <span class="hero-score-label">% SAVED</span>
        </div>
      </div>

      <div class="metric-grid">
        <div class="metric-card">
          <span class="metric-label">原始</span>
          <span class="metric-value">${toReadableSize(data.originalSize)}</span>
        </div>
        <div class="metric-card">
          <span class="metric-label">輸出</span>
          <span class="metric-value">${toReadableSize(data.outputSize)}</span>
        </div>
        <div class="metric-card">
          <span class="metric-label">格式</span>
          <span class="metric-value">${escapeHtml(data.format)}</span>
        </div>
      </div>

      <div class="preview-panel">
        <img
          class="preview-image"
          src="${escapeHtml(previewUrl)}"
          alt="${escapeHtml(data.filename)} 預覽"
          loading="lazy"
        />
      </div>

      ${buildResultActions({ downloadUrl: data.downloadUrl })}
    </article>
  `;
}

function buildFailureCard(item) {
  return `
    <article class="surface-card result-card result-card--error" data-result-type="fail" data-error-code="${escapeHtml(item.errorCode || 'UNKNOWN_ERROR')}">
      <div class="result-error-top">
        <span class="section-kicker">Failed</span>
        <h3>${escapeHtml(item.originalName || '未知檔案')}</h3>
      </div>
      <div class="result-error-inline">
        <span class="result-error-message">${escapeHtml(item.message || '處理失敗')}</span>
      </div>

      ${buildResultActions({ single: true })}
    </article>
  `;
}

function renderBatchResults(apiResult) {
  const results = Array.isArray(apiResult.results) ? apiResult.results : [];

  results
    .filter((item) => !item.success)
    .forEach((item) => {
      recordErrorCode('batch-result', item.errorCode, {
        fileName: item.originalName,
        message: item.message
      });
    });

  const successCount = results.filter((item) => item.success).length;
  const failCount = results.length - successCount;

  updateBatchSummary(results.length, successCount, failCount);

  if (results.length === 0) {
    return;
  }

  appendResultCards(results);
}

function showFeedbackModal(title, message) {
  feedbackModalLabel.innerText = title;
  feedbackModalBody.textContent = message;

  feedbackModalHeader.classList.remove('text-bg-success', 'text-bg-danger');
  feedbackModalHeader.classList.add('modal-header-brand');
  feedbackModalCloseBtn.classList.remove('btn-close-white');

  feedbackModalCloseBtn.classList.add('btn-close-white');
  feedbackModal.show();
}

imageInput.addEventListener('change', () => {
  void setSelectedFiles(imageInput.files);
});

['dragenter', 'dragover'].forEach((eventName) => {
  fileDropzone.addEventListener(eventName, (event) => {
    event.preventDefault();
    fileDropzone.classList.add('is-dragover');
  });
});

['dragleave', 'dragend', 'drop'].forEach((eventName) => {
  fileDropzone.addEventListener(eventName, (event) => {
    event.preventDefault();
    fileDropzone.classList.remove('is-dragover');
  });
});

fileDropzone.addEventListener('drop', (event) => {
  const droppedFiles = event.dataTransfer?.files;

  if (!droppedFiles || droppedFiles.length === 0) {
    return;
  }

  void setSelectedFiles(droppedFiles);
});

fileDropzone.addEventListener('click', (event) => {
  if (event.target === imageInput) {
    return;
  }

  if (event.target.closest('.dropzone-file-pill-remove')) {
    return;
  }

  imageInput.click();
});

selectedFilesList.addEventListener('click', (event) => {
  const removeBtn = event.target.closest('.dropzone-file-pill-remove');

  if (!removeBtn) {
    return;
  }

  event.preventDefault();
  event.stopPropagation();

  const fileIndex = Number.parseInt(removeBtn.dataset.fileIndex || '', 10);
  removeSelectedFileByIndex(fileIndex);
});

// 質量滑塊實時更新
qualityInput.addEventListener('input', (e) => {
  qualityValue.innerText = e.target.value;
});

uploadForm.addEventListener('submit', async function (event) {
  event.preventDefault();

  if (!selectedImageFiles.length) {
    showFeedbackModal('❌ 錯誤', '請至少選擇一張圖片');
    return;
  }

  const formData = new FormData();
  selectedImageFiles.forEach((file) => {
    formData.append('images', file);
  });
  formData.append('changeType', getSelectedFormat());
  formData.append('quality', qualityInput.value);

  // 禁用按鈕並顯示 loading
  setSubmitLoading(true);

  try {
    const response = await axios.post('/images/process', formData);

    const result = response.data;

    if (result.success) {
      renderBatchResults(result);
      resultArea.classList.remove(resultAreaClass);
      clearSelectedFiles();

      if (Number(result.successCount) > 0) {
        showFeedbackModal(
          '✅ 圖片處理完成',
          `成功 ${result.successCount} 張，失敗 ${result.failCount} 張`
        );
        container.classList.add('has-result');
      } else {
        showFeedbackModal(
          '❌ 圖片處理失敗',
          `全部 ${result.failCount} 張都失敗，請確認圖片格式與內容`
        );
        container.classList.remove('has-result');
      }
    }
  } catch (error) {
    let errorMsg = '無法連線至伺服器，請稍後再試';

    if (error.response && error.response.data) {
      const result = error.response.data;
      errorMsg = result.message || errorMsg;
      recordErrorCode('upload-submit', result.errorCode, {
        status: error.response.status,
        message: result.message
      });
    }

    showFeedbackModal('❌ 錯誤', errorMsg);
    container.classList.remove('has-result');
  } finally {
    // 恢復按鈕狀態
    setSubmitLoading(false);
  }
});

clearResultsBtn.addEventListener('click', () => {
  downloadAllSuccessfulResults();
});

resetResultsBtn.addEventListener('click', () => {
  resetBatchResults();
});
