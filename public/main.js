// 緩存 DOM 元素引用
const uploadForm = document.getElementById('uploadForm');
const imageInput = document.getElementById('imageInput');
const qualityInput = document.getElementById('qualityInput');
const qualityValue = document.getElementById('qualityValue');
const submitBtn = document.getElementById('submitBtn');
const resultArea = document.getElementById('resultArea');
const resultList = document.getElementById('resultList');
const batchTotalCount = document.getElementById('batchTotalCount');
const batchSuccessCount = document.getElementById('batchSuccessCount');
const batchFailCount = document.getElementById('batchFailCount');
const batchStatusText = document.getElementById('batchStatusText');
const clearResultsBtn = document.getElementById('clearResultsBtn');
const container = document.querySelector('.container');
const feedbackModalElement = document.getElementById('feedbackModal');
const feedbackModalLabel = document.getElementById('feedbackModalLabel');
const feedbackModalBody = document.getElementById('feedbackModalBody');
const feedbackModalHeader = feedbackModalElement.querySelector('.modal-header');
const feedbackModalCloseBtn = feedbackModalElement.querySelector('.btn-close');
const resultAreaClass = 'hidden-section';
const feedbackModal = new bootstrap.Modal(feedbackModalElement);
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
    batchStatusText.innerText = 'Ready';
    return;
  }

  batchStatusText.innerText =
    batchStats.fail > 0 ? 'Partial Success' : 'All Success';
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

function appendResultCards(results) {
  const cardsHtml = results
    .map((item) =>
      item.success ? buildSuccessCard(item) : buildFailureCard(item)
    )
    .join('');

  resultList.insertAdjacentHTML('beforeend', cardsHtml);
}

function buildRemoveActionButton() {
  return `
    <button
      type="button"
      class="result-card-action result-card-action--remove"
      aria-label="移除這張結果卡"
      title="移除"
    >
      <span aria-hidden="true">×</span>
    </button>
  `;
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

  return `
    <div class="${actionsClass}">
      ${downloadUrl ? buildDownloadActionLink(downloadUrl) : ''}
      ${buildRemoveActionButton()}
    </div>
  `;
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
    <article class="surface-card result-card result-card--error" data-result-type="fail">
      <div class="result-error-top">
        <span class="section-kicker">Failed</span>
        <h3>${escapeHtml(item.originalName || '未知檔案')}</h3>
      </div>
      <div class="result-error-inline">
        <span class="result-error-message">${escapeHtml(item.message || '處理失敗')}</span>
        <span class="result-error-code">${escapeHtml(item.errorCode || 'UNKNOWN_ERROR')}</span>
      </div>

      ${buildResultActions({ single: true })}
    </article>
  `;
}

function renderBatchResults(apiResult) {
  const results = Array.isArray(apiResult.results) ? apiResult.results : [];

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

// 質量滑塊實時更新
qualityInput.addEventListener('input', (e) => {
  qualityValue.innerText = e.target.value;
});

uploadForm.addEventListener('submit', async function (event) {
  event.preventDefault();

  if (!imageInput.files || imageInput.files.length === 0) {
    showFeedbackModal('❌ 錯誤', '請至少選擇一張圖片');
    return;
  }

  const formData = new FormData();
  Array.from(imageInput.files).forEach((file) => {
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
      errorMsg = `[${result.errorCode}] ${result.message}`;
    }

    showFeedbackModal('❌ 錯誤', errorMsg);
    container.classList.remove('has-result');
  } finally {
    // 恢復按鈕狀態
    setSubmitLoading(false);
  }
});

resultList.addEventListener('click', (event) => {
  const closeButton = event.target.closest('.result-card-action--remove');

  if (!closeButton) {
    return;
  }

  const card = closeButton.closest('.result-card');
  if (!card) {
    return;
  }

  const resultType = card.dataset.resultType;
  if (resultType === 'success') {
    batchStats.success = Math.max(0, batchStats.success - 1);
  } else {
    batchStats.fail = Math.max(0, batchStats.fail - 1);
  }

  batchStats.total = Math.max(0, batchStats.total - 1);
  card.remove();

  if (batchStats.total === 0) {
    resultArea.classList.add(resultAreaClass);
    container.classList.remove('has-result');
  }

  refreshBatchSummary();
});

clearResultsBtn.addEventListener('click', () => {
  resetBatchResults();
});
