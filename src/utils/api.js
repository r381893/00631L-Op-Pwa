/**
 * API 工具函數
 * 用於呼叫後端 Yahoo Finance API
 */

// API 基礎 URL - 根據環境決定
// 開發環境使用本地後端，生產環境使用 Render 部署的後端
const API_BASE_URL = import.meta.env.PROD
    ? 'https://zero0631l-hedge-api.onrender.com'
    : 'http://localhost:3001';

/**
 * 取得 00631L 股價
 */
export async function fetch00631LPrice() {
    const response = await fetch(`${API_BASE_URL}/api/quote?symbol=00631L.TW`);
    if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
    }
    return response.json();
}

/**
 * 取得台灣加權指數
 */
export async function fetchTaiexPrice() {
    const response = await fetch(`${API_BASE_URL}/api/taiex`);
    if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
    }
    return response.json();
}

/**
 * 同時取得 00631L 和加權指數
 */
export async function fetchAllPrices() {
    const [stockData, taiexData] = await Promise.all([
        fetch00631LPrice(),
        fetchTaiexPrice()
    ]);
    return { stock: stockData, taiex: taiexData };
}

export { API_BASE_URL };
