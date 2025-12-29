/**
 * OCR 工具模組 - 使用 Tesseract.js
 * 純前端 OCR 辨識，不需要後端 API
 */
import Tesseract from 'tesseract.js';

/**
 * 執行 OCR 辨識
 * @param {string} imageData - Base64 編碼的圖片資料
 * @param {function} onProgress - 進度回調函數 (0-100)
 * @returns {Promise<string>} 辨識結果文字
 */
export async function performOCR(imageData, onProgress = () => { }) {
    try {
        const result = await Tesseract.recognize(
            imageData,
            'chi_tra+eng', // 繁體中文 + 英文
            {
                logger: (info) => {
                    if (info.status === 'recognizing text') {
                        onProgress(Math.round(info.progress * 100));
                    }
                }
            }
        );

        return result.data.text;
    } catch (error) {
        console.error('OCR Error:', error);
        throw new Error('OCR 辨識失敗: ' + error.message);
    }
}

/**
 * 嘗試將 OCR 辨識結果轉換成 CSV 格式
 * 針對選擇權持倉表格的格式進行解析
 * @param {string} text - OCR 辨識的原始文字
 * @returns {string} CSV 格式的文字
 */
export function parseToCSV(text) {
    const lines = text.split('\n').filter(line => line.trim());
    const csvLines = ['類型,方向,Call/Put,履約價,權利金,口數'];

    for (const line of lines) {
        // 嘗試解析台指權格式: 台指權28550 202512W5P
        const optionMatch = line.match(/台指權(\d+)\s*\d+W\d+([CP])/i);
        if (optionMatch) {
            const strike = optionMatch[1];
            const callPut = optionMatch[2].toUpperCase() === 'C' ? 'call' : 'put';

            // 嘗試找到買賣方向
            const isBuy = line.includes('買進') || line.includes('買');
            const isSell = line.includes('賣出') || line.includes('賣');
            const side = isBuy ? 'buy' : (isSell ? 'sell' : 'buy');

            // 嘗試找到數字（口數和價格）
            const numbers = line.match(/\d+\.?\d*/g);
            let premium = 0;
            let qty = 1;

            if (numbers && numbers.length >= 3) {
                // 假設格式: 履約價, 即時價, 成交均價, 口數
                premium = parseFloat(numbers[numbers.length - 2]) || 0;
                qty = parseInt(numbers[numbers.length - 1]) || 1;
            }

            csvLines.push(`option,${side},${callPut},${strike},${premium},${qty}`);
        }
    }

    return csvLines.join('\n');
}
