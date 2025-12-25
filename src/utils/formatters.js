/**
 * 格式化工具
 */

/**
 * 格式化貨幣 (TWD)
 * @param {number} value - 金額
 * @param {boolean} showSign - 是否顯示正負號
 * @returns {string} 格式化後的字串
 */
export function formatCurrency(value, showSign = false) {
    const formatter = new Intl.NumberFormat('zh-TW', {
        style: 'currency',
        currency: 'TWD',
        maximumFractionDigits: 0,
        signDisplay: showSign ? 'exceptZero' : 'auto'
    });
    return formatter.format(value);
}

/**
 * 格式化百分比
 * @param {number} value - 百分比值
 * @param {number} decimals - 小數位數
 * @returns {string} 格式化後的字串
 */
export function formatPercent(value, decimals = 2) {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(decimals)}%`;
}

/**
 * 格式化數字（帶千分位）
 * @param {number} value - 數值
 * @param {number} decimals - 小數位數
 * @returns {string} 格式化後的字串
 */
export function formatNumber(value, decimals = 0) {
    return new Intl.NumberFormat('zh-TW', {
        maximumFractionDigits: decimals,
        minimumFractionDigits: decimals
    }).format(value);
}

/**
 * 取得損益對應的 CSS class
 * @param {number} value - 損益值
 * @returns {string} CSS class 名稱 (profit/loss)
 */
export function getPLClass(value) {
    return value >= 0 ? 'profit' : 'loss';
}

/**
 * 產生唯一 ID
 * @returns {string} 唯一 ID
 */
export function generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
