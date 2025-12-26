import React, { useMemo, useState } from 'react';
import { Table, ChevronDown, ChevronUp } from 'lucide-react';
import { calculatePositionPL, calculateStockPL } from '../utils/calculations';
import { formatCurrency, getPLClass } from '../utils/formatters';

/**
 * 損益情境模擬表格
 * 顯示不同指數價位下的損益狀況
 * @param {Object} props
 * @param {Object} props.stock - 持股資料
 * @param {Array} props.positions - 避險部位陣列
 * @param {number} props.marketIndex - 基準大盤指數
 */
function PnLSimulationTable({ stock, positions, marketIndex }) {
    const [isExpanded, setIsExpanded] = useState(false);

    // 生成情境資料 (±1500 點，每 100 點一格)
    const scenarios = useMemo(() => {
        const result = [];
        const step = 100;
        const range = 1500;

        for (let delta = -range; delta <= range; delta += step) {
            const scenarioIndex = marketIndex + delta;

            // 計算 00631L 損益 (假設 2 倍槓桿)
            const indexChangePercent = delta / marketIndex;
            const stockChangePercent = indexChangePercent * 2;
            const scenarioStockPrice = stock.currentPrice * (1 + stockChangePercent);
            const stockPL = (scenarioStockPrice - stock.avgCost) * stock.shares;

            // 計算只有 00631L 的損益 (不含避險)
            const stockOnlyPL = stockPL;

            // 計算避險部位損益
            const hedgePL = positions.reduce((acc, pos) =>
                acc + calculatePositionPL(pos, scenarioIndex), 0);

            // 計算總損益 (含避險)
            const totalPL = stockPL + hedgePL;

            result.push({
                delta,
                index: scenarioIndex,
                stockPL,
                hedgePL,
                totalPL,
                stockOnlyPL,
                isCurrent: delta === 0
            });
        }

        return result;
    }, [stock, positions, marketIndex]);

    // 只顯示前後幾筆，除非展開
    const displayData = isExpanded ? scenarios : scenarios.filter(s =>
        Math.abs(s.delta) <= 500 || s.delta % 500 === 0
    );

    return (
        <section className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.125rem', fontWeight: 700 }}>
                    <Table size={20} style={{ color: '#14b8a6' }} />
                    損益情境表
                </h2>
                <button
                    className="btn btn-secondary"
                    style={{ fontSize: '0.75rem' }}
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    {isExpanded ? '收合' : '展開全部'}
                </button>
            </div>

            <div className="table-container" style={{ maxHeight: isExpanded ? '400px' : '300px', overflowY: 'auto' }}>
                <table className="table" style={{ fontSize: '0.75rem' }}>
                    <thead>
                        <tr>
                            <th style={{ position: 'sticky', top: 0, background: 'var(--bg-card)', zIndex: 1 }}>變動</th>
                            <th style={{ position: 'sticky', top: 0, background: 'var(--bg-card)', zIndex: 1 }}>指數</th>
                            <th className="table-right" style={{ position: 'sticky', top: 0, background: 'var(--bg-card)', zIndex: 1 }}>純00631L</th>
                            <th className="table-right" style={{ position: 'sticky', top: 0, background: 'var(--bg-card)', zIndex: 1 }}>避險損益</th>
                            <th className="table-right" style={{ position: 'sticky', top: 0, background: 'var(--bg-card)', zIndex: 1 }}>總損益</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayData.map((scenario) => (
                            <tr
                                key={scenario.delta}
                                style={{
                                    background: scenario.isCurrent ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                                    fontWeight: scenario.isCurrent ? 700 : 400
                                }}
                            >
                                <td style={{ whiteSpace: 'nowrap' }}>
                                    <span style={{
                                        color: scenario.delta > 0 ? 'var(--color-profit)' :
                                            scenario.delta < 0 ? 'var(--color-loss)' : 'var(--text-primary)'
                                    }}>
                                        {scenario.delta > 0 ? '+' : ''}{scenario.delta}
                                    </span>
                                </td>
                                <td>{scenario.index.toLocaleString()}</td>
                                <td className={`table-right ${getPLClass(scenario.stockOnlyPL)}`}>
                                    {formatCurrency(scenario.stockOnlyPL)}
                                </td>
                                <td className={`table-right ${getPLClass(scenario.hedgePL)}`}>
                                    {formatCurrency(scenario.hedgePL)}
                                </td>
                                <td className={`table-right ${getPLClass(scenario.totalPL)}`} style={{ fontWeight: 600 }}>
                                    {formatCurrency(scenario.totalPL)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div style={{ marginTop: '12px', fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                <span>* 假設 00631L 2 倍槓桿追蹤大盤</span>
                <span>目前指數: {marketIndex.toLocaleString()}</span>
            </div>
        </section>
    );
}

export default PnLSimulationTable;
