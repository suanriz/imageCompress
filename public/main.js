// 緩存 DOM 元素引用
const uploadForm = document.getElementById('uploadForm');
const imageInput = document.getElementById('imageInput');
const qualityInput = document.getElementById('qualityInput');
const qualityValue = document.getElementById('qualityValue');
const submitBtn = document.getElementById('submitBtn');
const resultArea = document.getElementById('resultArea');
const previewArea = document.getElementById('previewArea');
const previewImage = document.getElementById('previewImage');
const container = document.querySelector('.container');
const origSize = document.getElementById('origSize');
const outSize = document.getElementById('outSize');
const savedPercent = document.getElementById('savedPercent');
const downloadLink = document.getElementById('downloadLink');
const resultAreaClass = 'hidden-section';

// 質量滑塊實時更新
qualityInput.addEventListener('input', (e) => {
  qualityValue.innerText = e.target.value;
});

uploadForm.addEventListener('submit', async function (event) {
  event.preventDefault();

  // 避免請求期間殘留上一次預覽
  previewImage.src = '';
  previewArea.classList.add(resultAreaClass);

  const formData = new FormData();
  formData.append('image', imageInput.files[0]);
  formData.append('quality', qualityInput.value);

  // 禁用按鈕並顯示 loading
  submitBtn.disabled = true;
  const originalText = submitBtn.innerText;
  submitBtn.innerText = '⏳ 處理中...';

  try {
    const response = await axios.post('/images/process', formData);

    const result = response.data;

    if (result.success) {
      const originalSizeFormatted = result.data.originalSize.toLocaleString();
      const outputSizeFormatted = result.data.outputSize.toLocaleString();
      const savedPercentValue = result.data.savedPercent;

      alert(
        `✅ 圖片壓縮成功\n\n` +
          `原始大小: ${originalSizeFormatted} bytes\n` +
          `處理後大小: ${outputSizeFormatted} bytes\n` +
          `節省比例: ${savedPercentValue}%`
      );

      // 更新 UI
      origSize.innerText = `${originalSizeFormatted} bytes`;
      outSize.innerText = `${outputSizeFormatted} bytes`;
      savedPercent.innerText = `${savedPercentValue}%`;
      downloadLink.href = result.data.downloadUrl;
      previewImage.src = result.data.previewUrl;
      previewArea.classList.remove(resultAreaClass);

      resultArea.classList.remove(resultAreaClass);
      container.classList.add('has-result');
    }
  } catch (error) {
    let errorMsg = '無法連線至伺服器，請稍後再試';

    if (error.response && error.response.data) {
      const result = error.response.data;
      errorMsg = `[${result.errorCode}] ${result.message}`;
    }

    alert('❌ 錯誤\n\n' + errorMsg);
    resultArea.classList.add(resultAreaClass);
    container.classList.remove('has-result');
  } finally {
    // 恢復按鈕狀態
    submitBtn.disabled = false;
    submitBtn.innerText = originalText;
  }
});
