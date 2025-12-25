import React from 'react';
import { TrendingUp, RefreshCw } from 'lucide-react';
import { formatCurrency, formatPercent, getPLClass } from '../utils/formatters';
import { calculateStockPL, calculateStockReturn } from '../utils/calculations';

/**
 * 00631L 持股管理卡片
 * @param {Object} props
 * @param {Object} props.stock - 持股資料
 * @param {Function} props.onStockChange - 持股資料變更回調
 * @param {number} props.marketIndex - 大盤指數
 * @param {Function} props.onMarketIndexChange - 大盤指數變更回調
 * @param {number} props.totalHedgePL - 避險部位總損益
 */
function StockCard({ stock, onStockChange, marketIndex, onMarketIndexChange, totalHedgePL }) {
    const stockPL = calculateStockPL(stock);
    const stockReturn = calculateStockReturn(stock);
    const netPL = stockPL + totalHedgePL;

    const handleChange = (field, value) => {
        const numValue = parseFloat(value) || 0;
        onStockChange({ ...stock, [field]: numValue });
    };

    return (
        <>
            {/* 總覽卡片 */}
            <section className="card">
                <h2 className="card-title">即時損益概況</h2>
                <div className="grid grid-3" style={{ textAlign: 'center' }}>
                    <div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>00631L 現貨損益</p>
                        <p className={`stat-value ${getPLClass(stockPL)}`}>
                            {formatCurrency(stockPL)}
                        </p>
                        <p className="stat-label">報酬率: {formatPercent(stockReturn)}</p>
                    </div>
                    <div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>避險部位損益</p>
                        <p className={`stat-value ${getPLClass(totalHedgePL)}`}>
                            {formatCurrency(totalHedgePL)}
                        </p>
                        <p className="stat-label">基於大盤: {marketIndex.toLocaleString()}</p>
                    </div>
                    <div className="stat-highlight">
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>淨損益 (Net P/L)</p>
                        <p className={`stat-value xl ${getPLClass(netPL)}`}>
                            {formatCurrency(netPL)}
                        </p>
                    </div>
                </div>
            </section>

            {/* 持股設定卡片 */}
            <section className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.125rem', fontWeight: 700 }}>
                        <TrendingUp size={20} style={{ color: 'var(--color-profit)' }} />
                        持股設定 (00631L)
                    </h2>
                    <button className="btn btn-secondary" style={{ fontSize: '0.75rem' }}>
                        <RefreshCw size={12} /> Yahoo同步
                    </button>
                </div>

                <div className="grid grid-4 grid-2-mobile">
                    <div>
                        <label className="input-label">持有股數</label>
                        <input
                            type="number"
                            className="input"
                            value={stock.shares}
                            onChange={(e) => handleChange('shares', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="input-label">平均成本</label>
                        <input
                            type="number"
                            className="input"
                            step="0.1"
                            value={stock.avgCost}
                            onChange={(e) => handleChange('avgCost', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="input-label">目前市價 (模擬)</label>
                        <input
                            type="number"
                            className="input input-highlight"
                            step="0.1"
                            value={stock.currentPrice}
                            onChange={(e) => handleChange('currentPrice', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="input-label">參考大盤指數</label>
                        <input
                            type="number"
                            className="input"
                            value={marketIndex}
                            onChange={(e) => onMarketIndexChange(parseFloat(e.target.value) || 0)}
                        />
                    </div>
                </div>
            </section>
        </>
    );
}

export default StockCard;
