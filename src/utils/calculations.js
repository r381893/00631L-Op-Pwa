/**
 * 損益計算核心邏輯
 */

/**
 * 計算選擇權損益 (到期日價值簡化版)
 * @param {Object} position - 選擇權部位
 * @param {number} currentIndex - 目前大盤指數
 * @returns {number} 損益金額
 */
export function calculateOptionPL(position, currentIndex) {
    const { callPut, side, strike, premium, qty, multiplier = 50 } = position;

    // 計算內含價值
    let intrinsic = 0;
    if (callPut === 'call') {
        intrinsic = Math.max(0, currentIndex - strike);
    } else { // put
        intrinsic = Math.max(0, strike - currentIndex);
    }

    const cost = premium * multiplier * qty;
    const value = intrinsic * multiplier * qty;

    // 買方: 獲利 = 價值 - 成本
    // 賣方: 獲利 = 權利金收入 - 賠付價值
    return side === 'buy' ? value - cost : cost - value;
}

/**
 * 計算期貨損益
 * @param {Object} position - 期貨部位
 * @param {number} currentIndex - 目前大盤指數
 * @returns {number} 損益金額
 */
export function calculateFuturePL(position, currentIndex) {
    const { side, price, qty, multiplier = 50 } = position;
    const diff = currentIndex - price;
    const pl = diff * multiplier * qty;
    return side === 'buy' ? pl : -pl;
}

/**
 * 計算單一部位損益
 * @param {Object} position - 避險部位
 * @param {number} currentIndex - 目前大盤指數
 * @returns {number} 損益金額
 */
export function calculatePositionPL(position, currentIndex) {
    if (position.type === 'option') {
        return calculateOptionPL(position, currentIndex);
    } else if (position.type === 'future') {
        return calculateFuturePL(position, currentIndex);
    }
    return 0;
}

/**
 * 計算現貨損益
 * @param {Object} stock - 股票資料
 * @returns {number} 損益金額
 */
export function calculateStockPL(stock) {
    return (stock.currentPrice - stock.avgCost) * stock.shares;
}

/**
 * 計算現貨報酬率
 * @param {Object} stock - 股票資料
 * @returns {number} 報酬率 (%)
 */
export function calculateStockReturn(stock) {
    if (stock.avgCost === 0) return 0;
    return ((stock.currentPrice - stock.avgCost) / stock.avgCost) * 100;
}

/**
 * 產生情境分析資料
 * @param {Object} stock - 股票資料
 * @param {Array} hedges - 避險部位陣列
 * @param {number} baseIndex - 基準大盤指數
 * @param {number} range - 變動範圍 (0.05 = ±5%)
 * @param {number} steps - 資料點數量
 * @returns {Array} 情境分析資料陣列
 */
export function generateScenarioData(stock, hedges, baseIndex, range = 0.05, steps = 10) {
    const data = [];
    const leverage = 2; // 00631L 2倍槓桿

    for (let i = -steps; i <= steps; i++) {
        const percent = (i / steps) * range;
        const simulatedIndex = baseIndex * (1 + percent);

        // 假設 00631L 是 2倍槓桿
        const simulatedStockPrice = stock.currentPrice * (1 + percent * leverage);
        const stockPL = (simulatedStockPrice - stock.avgCost) * stock.shares;

        // 計算所有避險部位損益
        let hedgePL = 0;
        hedges.forEach(pos => {
            hedgePL += calculatePositionPL(pos, simulatedIndex);
        });

        data.push({
            index: Math.round(simulatedIndex),
            percent: (percent * 100).toFixed(1),
            stockPL: Math.round(stockPL),
            hedgePL: Math.round(hedgePL),
            netPL: Math.round(stockPL + hedgePL)
        });
    }

    return data;
}
