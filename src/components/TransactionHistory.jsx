import React from 'react';
import { History, Trash2, TrendingUp, TrendingDown } from 'lucide-react';

/**
 * 交易明細歷史紀錄
 * @param {Object} props
 * @param {Array} props.transactions - 交易記錄陣列
 * @param {Function} props.onClear - 清除所有記錄的回調
 */
function TransactionHistory({ transactions, onClear }) {
    // 格式化日期
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-TW', {
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // 格式化交易類型
    const formatType = (tx) => {
        if (tx.positionType === 'option') {
            return `${tx.callPut === 'call' ? 'Call' : 'Put'} ${tx.strike}`;
        } else if (tx.positionType === 'future') {
            return '期貨';
        }
        return tx.positionType;
    };

    // 取得動作顏色
    const getActionClass = (action, side) => {
        if (action === 'open') {
            return side === 'buy' ? 'profit' : 'loss';
        } else {
            return side === 'buy' ? 'loss' : 'profit';
        }
    };

    // 取得動作文字
    const getActionText = (action, side) => {
        if (action === 'open') {
            return side === 'buy' ? '買進建倉' : '賣出建倉';
        } else {
            return side === 'buy' ? '平倉賣出' : '平倉買回';
        }
    };

    return (
        <section className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.125rem', fontWeight: 700 }}>
                    <History size={20} style={{ color: 'var(--color-primary)' }} />
                    交易明細
                </h2>
                {transactions.length > 0 && (
                    <button
                        className="btn btn-danger"
                        style={{ fontSize: '0.75rem' }}
                        onClick={onClear}
                    >
                        <Trash2 size={12} /> 清除
                    </button>
                )}
            </div>

            {transactions.length === 0 ? (
                <div className="empty-state">
                    <History size={40} />
                    <p style={{ marginTop: '8px' }}>尚無交易記錄</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        新增或移除部位時會自動記錄
                    </p>
                </div>
            ) : (
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>時間</th>
                                <th>類型</th>
                                <th>動作</th>
                                <th className="table-right">數量</th>
                                <th className="table-right">價格</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.slice().reverse().map((tx, index) => (
                                <tr key={tx.id || index}>
                                    <td style={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                                        {formatDate(tx.timestamp)}
                                    </td>
                                    <td>
                                        <span style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            fontSize: '0.875rem'
                                        }}>
                                            {tx.action === 'open' ? (
                                                <TrendingUp size={14} className="profit" />
                                            ) : (
                                                <TrendingDown size={14} className="loss" />
                                            )}
                                            {formatType(tx)}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`badge badge-${tx.side === 'buy' ? 'buy' : 'sell'}`}>
                                            {getActionText(tx.action, tx.side)}
                                        </span>
                                    </td>
                                    <td className="table-right" style={{ fontFamily: 'var(--font-mono)' }}>
                                        {tx.qty}
                                    </td>
                                    <td className="table-right" style={{ fontFamily: 'var(--font-mono)' }}>
                                        {tx.price ? tx.price.toLocaleString() : '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}

export default TransactionHistory;
