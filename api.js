/**
 * Google AI Studio API（Gemini）を使用して
 * 画像と文章を送信し、レスポンスを得る処理
 */

const GEMINI_API_KEY = 'AIzaSyChgAKIODww1dvQJlMoVMBGb90jVY1paoM';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent';

/**
 * Google Gemini APIへ画像とテキストを送信
 * @param {File|Blob} imageFile - 送信する画像ファイル
 * @param {string} text - 送信するプロンプト文章
 * @returns {Promise<{text: string}>} Geminiからのレスポンステキスト
 */
async function sendImageAndTextToGemini(imageFile, text) {
  try {
    // 画像をBase64に変換
    const base64Image = await fileToBase64(imageFile);
    
    // Base64データから前置詞を除去 (data:image/png;base64, など)
    const base64Data = base64Image.split(',')[1];
    
    // 画像のMIMEタイプを取得
    const mimeType = imageFile.type || 'image/jpeg';

    // Gemini APIへのリクエストボディを構築
    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: text
            },
            {
              inlineData: {
                mimeType: mimeType,
                data: base64Data
              }
            }
          ]
        }
      ]
    };

    // APIへリクエストを送信
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    // レスポンスの確認
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Gemini API Error: ${response.status} - ${errorData.error?.message || response.statusText}`);
    }

    // JSONレスポンスを取得
    const result = await response.json();
    
    // レスポンステキストを抽出
    const responseText = result.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    return {
      text: responseText,
      fullResponse: result // 完全なレスポンスオブジェクト
    };

  } catch (error) {
    console.error('Gemini API呼び出しエラー:', error);
    throw error;
  }
}


/**
 * 画像ファイルを選択してGemini APIに送信する例
 */
async function handleImageUpload(imageInput, textInput) {
  const imageFile = imageInput.files[0];
  const text = textInput.value;

  if (!imageFile) {
    alert('画像を選択してください');
    return;
  }

  if (!text.trim()) {
    alert('テキストを入力してください');
    return;
  }

  try {
    const result = await sendImageAndTextToGemini(imageFile, text);
    console.log('Geminiからのレスポンス:', result);
    
    // 戻り値を表示
    displayResult(result);

  } catch (error) {
    console.error('処理に失敗しました:', error);
    displayError(error.message);
  }
}

/**
 * 戻り値をページに表示する関数
 */
function displayResult(result) {
  // テキスト結果を表示
  const textElement = document.getElementById('responseText');
  if (textElement) {
    textElement.textContent = result.text;
  }
}

/**
 * エラーメッセージを表示する関数
 */
function displayError(message) {
  const errorElement = document.getElementById('error');
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.classList.add('show');
  }
}

/**
 * ファイルをBase64形式で読み込む関数
 * @param {File} file - 読み込むファイル
 * @returns {Promise<string>} Base64文字列（Data URL形式）
 */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

// CommonJS用のエクスポート（必要に応じて）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    sendImageAndTextToGemini,
    handleImageUpload,
    displayResult,
    displayError,
    fileToBase64,
    GEMINI_API_KEY,
    GEMINI_API_URL
  };
}
