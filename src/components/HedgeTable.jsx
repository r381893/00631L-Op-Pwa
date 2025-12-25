import React from 'react';
import { Shield, Plus, Trash2 } from 'lucide-react';
import { formatCurrency, getPLClass } from '../utils/formatters';
import { calculatePositionPL } from '../utils/calculations';

/**
 * 避險部位表格
 * @param {Object} props
 * @param {Array} props.positions - 避險部位陣列
 * @param {number} props.marketIndex - 大盤指數
 * @param {Function} props.onAddClick - 新增按鈕點擊回調
 * @param {Function} props.onRemove - 移除部位回調
 */
function HedgeTable({ positions, marketIndex, onAddClick, onRemove }) {
    return (
        <section className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.125rem', fontWeight: 700 }}>
                    <Shield size={20} style={{ color: 'var(--color-primary)' }} />
                    避險策略 (複試單/期貨)
                </h2>
                <button className="btn btn-primary" onClick={onAddClick}>
                    <Plus size={16} /> 新增部位
                </button>
            </div>

            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
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
                            return (
                                <tr key={pos.id}>
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
                                                {pos.callPut === 'call' ? '買權 Call' : '賣權 Put'} @{' '}
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
                                <td colSpan="7" className="empty-state">
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
