document
  .getElementById("uploadForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    // 每次送出前先重置畫面
    document.getElementById("resultArea").style.display = "none";
    document.getElementById("errorArea").style.display = "none";

    const fileInput = document.getElementById("imageInput");
    const qualityInput = document.getElementById("qualityInput");

    const formData = new FormData();
    formData.append("image", fileInput.files[0]); // 修正：精準抓取單張檔案本體
    formData.append("quality", qualityInput.value);

    try {
      const response = await axios.post(
        "http://localhost:3000/images/process",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      const result = response.data;

      // 判斷後端是成功還是失敗
      if (result.success) {
        document.getElementById("origSize").innerText =
          `${result.data.originalSize.toLocaleString()} bytes`;
        document.getElementById("outSize").innerText =
          `${result.data.outputSize.toLocaleString()} bytes`;
        document.getElementById("savedPercent").innerText =
          result.data.savedPercent;
        document.getElementById("downloadLink").href = result.data.downloadUrl;

        document.getElementById("resultArea").style.display = "block";
      }
    } catch (error) {
      if (error.response && error.response.data) {
        const result = error.response.data; // 這裡就是後端回傳的錯誤 JSON
        document.getElementById("errorMessage").innerText =
          `[${result.errorCode}] ${result.message}`;
      } else {
        // 真正的網路斷線
        document.getElementById("errorMessage").innerText =
          "無法連線至伺服器，請稍後再試";
      }
      document.getElementById("errorArea").style.display = "block";
    }
  });
