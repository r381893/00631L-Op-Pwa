import React, { useState } from 'react';
import { TrendingUp, RefreshCw, Loader, AlertCircle } from 'lucide-react';
import { formatCurrency, formatPercent, getPLClass } from '../utils/formatters';
import { calculateStockPL, calculateStockReturn } from '../utils/calculations';
import { fetchAllPrices } from '../utils/api';

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
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lastUpdate, setLastUpdate] = useState(null);

    const stockPL = calculateStockPL(stock);
    const stockReturn = calculateStockReturn(stock);
    const netPL = stockPL + totalHedgePL;

    const handleChange = (field, value) => {
        const numValue = parseFloat(value) || 0;
        onStockChange({ ...stock, [field]: numValue });
    };

    // Yahoo Finance 同步功能
    const handleYahooSync = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const data = await fetchAllPrices();

            // 更新股價
            if (data.stock && data.stock.price) {
                onStockChange({ ...stock, currentPrice: data.stock.price });
            }

            // 更新大盤指數
            if (data.taiex && data.taiex.price) {
                onMarketIndexChange(data.taiex.price);
            }

            setLastUpdate(new Date().toLocaleTimeString('zh-TW'));
        } catch (err) {
            console.error('Yahoo sync error:', err);
            setError('同步失敗，請確認後端服務是否運作中');
        } finally {
            setIsLoading(false);
        }
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {lastUpdate && (
                            <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>
                                更新: {lastUpdate}
                            </span>
                        )}
                        <button
                            className="btn btn-secondary"
                            style={{ fontSize: '0.75rem' }}
                            onClick={handleYahooSync}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <Loader size={12} className="spin" />
                            ) : (
                                <RefreshCw size={12} />
                            )}
                            {isLoading ? '同步中...' : 'Yahoo同步'}
                        </button>
                    </div>
                </div>

                {/* 錯誤訊息 */}
                {error && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 12px',
                        marginBottom: '16px',
                        background: 'rgba(239, 68, 68, 0.1)',
                        borderRadius: '8px',
                        fontSize: '0.75rem',
                        color: 'var(--color-danger)'
                    }}>
                        <AlertCircle size={14} />
                        {error}
                    </div>
                )}

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
                        <label className="input-label">目前市價</label>
                        <input
                            type="number"
                            className="input input-highlight"
                            step="0.1"
                            value={stock.currentPrice}
                            onChange={(e) => handleChange('currentPrice', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="input-label">加權指數</label>
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
