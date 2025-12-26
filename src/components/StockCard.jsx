import React, { useState } from 'react';
import { TrendingUp, RefreshCw, Loader, AlertCircle, Wallet } from 'lucide-react';
import { formatCurrency, formatPercent, getPLClass } from '../utils/formatters';
import { calculateStockPL, calculateStockReturn } from '../utils/calculations';
import { fetchAllPrices } from '../utils/api';

/**
 * 00631L 持股管理卡片
 * @param {Object} props
 * @param {Object} props.stock - 持股資料
 * @param {Function} props.onStockChange - 持股資料變更回調
 * @param {Object} props.cash - 現金資料
 * @param {Function} props.onCashChange - 現金資料變更回調
 * @param {number} props.marketIndex - 大盤指數
 * @param {Function} props.onMarketIndexChange - 大盤指數變更回調
 * @param {number} props.totalHedgePL - 避險部位總損益
 */
function StockCard({ stock, onStockChange, cash, onCashChange, marketIndex, onMarketIndexChange, totalHedgePL }) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lastUpdate, setLastUpdate] = useState(null);

    // 股票損益計算
    const stockPL = calculateStockPL(stock);
    const stockReturn = calculateStockReturn(stock);

    // 現金損益計算
    const cashPL = (cash?.currentCash || 0) - (cash?.initialCash || 0);

    // 總成本（股票成本 + 初始現金）
    const totalCost = (stock.shares * stock.avgCost) + (cash?.initialCash || 0);

    // 總現值（股票現值 + 目前現金）
    const totalCurrentValue = (stock.shares * stock.currentPrice) + (cash?.currentCash || 0);

    // 整體損益（股票損益 + 現金損益 + 避險損益）
    const totalPL = stockPL + cashPL + totalHedgePL;

    // 整體報酬率
    const totalReturn = totalCost > 0 ? totalPL / totalCost : 0;

    const handleStockChange = (field, value) => {
        const numValue = parseFloat(value) || 0;
        onStockChange({ ...stock, [field]: numValue });
    };

    const handleCashChange = (field, value) => {
        const numValue = parseFloat(value) || 0;
        onCashChange({ ...cash, [field]: numValue });
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
                <div className="grid grid-4 grid-2-mobile" style={{ textAlign: 'center' }}>
                    <div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>00631L 損益</p>
                        <p className={`stat-value ${getPLClass(stockPL)}`} style={{ fontSize: '1rem' }}>
                            {formatCurrency(stockPL)}
                        </p>
                        <p className="stat-label">{formatPercent(stockReturn)}</p>
                    </div>
                    <div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>現金損益</p>
                        <p className={`stat-value ${getPLClass(cashPL)}`} style={{ fontSize: '1rem' }}>
                            {formatCurrency(cashPL)}
                        </p>
                        <p className="stat-label">現金: {formatCurrency(cash?.currentCash || 0)}</p>
                    </div>
                    <div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>避險損益</p>
                        <p className={`stat-value ${getPLClass(totalHedgePL)}`} style={{ fontSize: '1rem' }}>
                            {formatCurrency(totalHedgePL)}
                        </p>
                        <p className="stat-label">大盤: {marketIndex.toLocaleString()}</p>
                    </div>
                    <div className="stat-highlight">
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>整體損益</p>
                        <p className={`stat-value ${getPLClass(totalPL)}`} style={{ fontSize: '1.25rem' }}>
                            {formatCurrency(totalPL)}
                        </p>
                        <p className="stat-label">{formatPercent(totalReturn)}</p>
                    </div>
                </div>
                <div style={{ marginTop: '12px', padding: '8px', background: 'var(--bg-tertiary)', borderRadius: '8px', fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                    <span>總成本: {formatCurrency(totalCost)}</span>
                    <span>總現值: {formatCurrency(totalCurrentValue)}</span>
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
                            onChange={(e) => handleStockChange('shares', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="input-label">平均成本</label>
                        <input
                            type="number"
                            className="input"
                            step="0.1"
                            value={stock.avgCost}
                            onChange={(e) => handleStockChange('avgCost', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="input-label">目前市價</label>
                        <input
                            type="number"
                            className="input input-highlight"
                            step="0.1"
                            value={stock.currentPrice}
                            onChange={(e) => handleStockChange('currentPrice', e.target.value)}
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

            {/* 現金設定卡片 */}
            <section className="card">
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.125rem', fontWeight: 700, marginBottom: '16px' }}>
                    <Wallet size={20} style={{ color: 'var(--color-warning)' }} />
                    現金帳戶
                </h2>
                <div className="grid grid-2">
                    <div>
                        <label className="input-label">初始現金成本</label>
                        <input
                            type="number"
                            className="input"
                            value={cash?.initialCash || 0}
                            onChange={(e) => handleCashChange('initialCash', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="input-label">目前現金餘額</label>
                        <input
                            type="number"
                            className="input input-highlight"
                            value={cash?.currentCash || 0}
                            onChange={(e) => handleCashChange('currentCash', e.target.value)}
                        />
                    </div>
                </div>
                <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>現金損益:</span>
                    <span className={getPLClass(cashPL)} style={{ fontWeight: 600 }}>
                        {formatCurrency(cashPL)}
                    </span>
                </div>
            </section>
        </>
    );
}

export default StockCard;
