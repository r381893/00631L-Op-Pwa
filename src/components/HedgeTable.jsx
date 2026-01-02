import React, { useMemo } from 'react';
import { Shield, Plus, Trash2, Link, Upload } from 'lucide-react';
import { formatCurrency, getPLClass } from '../utils/formatters';
import { calculatePositionPL } from '../utils/calculations';

// 價差組合的顏色
const SPREAD_COLORS = [
    '#6366f1', // indigo
    '#14b8a6', // teal
    '#f59e0b', // amber
    '#ec4899', // pink
    '#8b5cf6', // purple
];

/**
 * 自動識別複式單（價差組合）
 * 規則：同類型(call/put)、相鄰履約價、一買一賣、口數相同
 */
function identifySpreads(positions) {
    const optionPositions = positions.filter(p => p.type === 'option');
    const spreads = [];
    const usedIds = new Set();

    // 按履約價排序
    const sortedOptions = [...optionPositions].sort((a, b) => a.strike - b.strike);

    for (let i = 0; i < sortedOptions.length; i++) {
        const pos1 = sortedOptions[i];
        if (usedIds.has(pos1.id)) continue;

        // 找配對
        for (let j = i + 1; j < sortedOptions.length; j++) {
            const pos2 = sortedOptions[j];
            if (usedIds.has(pos2.id)) continue;

            // 檢查是否為複式單
            const isSameType = pos1.callPut === pos2.callPut;
            const isOppositeSide = pos1.side !== pos2.side;
            const isSameQty = pos1.qty === pos2.qty;
            const isAdjacentStrike = Math.abs(pos1.strike - pos2.strike) <= 500; // 500 點內視為相鄰

            if (isSameType && isOppositeSide && isSameQty && isAdjacentStrike) {
                spreads.push({
                    id: `spread-${pos1.id}-${pos2.id}`,
                    positions: [pos1.id, pos2.id],
                    type: pos1.callPut === 'call' ? 'Call 價差' : 'Put 價差',
                    buyStrike: pos1.side === 'buy' ? pos1.strike : pos2.strike,
                    sellStrike: pos1.side === 'sell' ? pos1.strike : pos2.strike,
                });
                usedIds.add(pos1.id);
                usedIds.add(pos2.id);
                break;
            }
        }
    }

    return { spreads, usedIds };
}

/**
 * 避險部位表格
 * @param {Object} props
 * @param {Array} props.positions - 避險部位陣列
 * @param {number} props.marketIndex - 大盤指數
 * @param {Function} props.onAddClick - 新增按鈕點擊回調
 * @param {Function} props.onQuickImportClick - 快速匯入按鈕點擊回調
 * @param {Function} props.onRemove - 移除部位回調
 */
function HedgeTable({ positions, marketIndex, onAddClick, onQuickImportClick, onRemove }) {
    // 識別複式單
    const { spreads, usedIds } = useMemo(() => identifySpreads(positions), [positions]);

    // 為每個部位分配顏色
    const positionColorMap = useMemo(() => {
        const map = {};
        spreads.forEach((spread, index) => {
            const color = SPREAD_COLORS[index % SPREAD_COLORS.length];
            spread.positions.forEach(posId => {
                map[posId] = { color, spreadName: spread.type, index: index + 1 };
            });
        });
        return map;
    }, [spreads]);

    return (
        <section className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.125rem', fontWeight: 700 }}>
                    <Shield size={20} style={{ color: 'var(--color-primary)' }} />
                    避險策略 (複式單/期貨)
                </h2>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-secondary" onClick={onQuickImportClick}>
                        <Upload size={16} /> 快速匯入
                    </button>
                    <button className="btn btn-primary" onClick={onAddClick}>
                        <Plus size={16} /> 新增部位
                    </button>
                </div>
            </div>

            {/* 複式單圖例 */}
            {spreads.length > 0 && (
                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px',
                    marginBottom: '12px',
                    padding: '8px',
                    background: 'var(--bg-tertiary)',
                    borderRadius: '8px',
                    fontSize: '0.75rem'
                }}>
                    <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Link size={12} /> 複式單:
                    </span>
                    {spreads.map((spread, index) => (
                        <span
                            key={spread.id}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                background: `${SPREAD_COLORS[index % SPREAD_COLORS.length]}20`,
                                border: `1px solid ${SPREAD_COLORS[index % SPREAD_COLORS.length]}`,
                                color: SPREAD_COLORS[index % SPREAD_COLORS.length]
                            }}
                        >
                            {spread.type} ({spread.buyStrike}/{spread.sellStrike})
                        </span>
                    ))}
                </div>
            )}

            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th style={{ width: '30px' }}></th>
                            <th>類型</th>
                            <th>方向</th>
                            <th>內容</th>
                            <th className="table-right">成本/價格</th>
                            <th className="table-right">口數</th>
                            <th className="table-right">預估損益</th>
                            <th className="table-center">操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        {positions.map(pos => {
                            const pl = calculatePositionPL(pos, marketIndex);
                            const spreadInfo = positionColorMap[pos.id];
                            return (
                                <tr
                                    key={pos.id}
                                    style={spreadInfo ? {
                                        borderLeft: `3px solid ${spreadInfo.color}`,
                                        background: `${spreadInfo.color}08`
                                    } : {}}
                                >
                                    <td style={{ padding: '4px 8px' }}>
                                        {spreadInfo && (
                                            <span
                                                style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    width: '18px',
                                                    height: '18px',
                                                    borderRadius: '50%',
                                                    background: spreadInfo.color,
                                                    color: 'white',
                                                    fontSize: '0.65rem',
                                                    fontWeight: 700
                                                }}
                                                title={spreadInfo.spreadName}
                                            >
                                                {spreadInfo.index}
                                            </span>
                                        )}
                                    </td>
                                    <td style={{ fontWeight: 500 }}>
                                        {pos.type === 'option' ? '選擇權' : '期貨(微台)'}
                                    </td>
                                    <td>
                                        <span className={`badge ${pos.side === 'buy' ? 'badge-buy' : 'badge-sell'}`}>
                                            {pos.side === 'buy' ? '買進' : '賣出'}
                                        </span>
                                    </td>
                                    <td style={{ color: 'var(--text-secondary)' }}>
                                        {pos.type === 'option' ? (
                                            <>
                                                {pos.callPut === 'call' ? 'Call' : 'Put'} @{' '}
                                                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                                                    {pos.strike.toLocaleString()}
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                微台指 @{' '}
                                                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                                                    {pos.price.toLocaleString()}
                                                </span>
                                            </>
                                        )}
                                    </td>
                                    <td className="table-right" style={{ fontFamily: 'var(--font-mono)' }}>
                                        {pos.type === 'option' ? pos.premium : pos.price}
                                    </td>
                                    <td className="table-right" style={{ fontFamily: 'var(--font-mono)' }}>
                                        {pos.qty}
                                    </td>
                                    <td className={`table-right ${getPLClass(pl)}`} style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                                        {formatCurrency(pl)}
                                    </td>
                                    <td className="table-center">
                                        <button
                                            className="btn btn-danger"
                                            onClick={() => onRemove(pos.id)}
                                            title="刪除"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                        {positions.length === 0 && (
                            <tr>
                                <td colSpan="8" className="empty-state">
                                    <Shield size={32} />
                                    <p>目前沒有避險部位，請點擊「新增部位」</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    );
}

export default HedgeTable;
