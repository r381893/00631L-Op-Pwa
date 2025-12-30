import React, { useState, useMemo } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine
} from 'recharts';
import { TrendingUp, ChevronDown, ChevronUp, Calendar, Trash2 } from 'lucide-react';
import { formatCurrency, formatPercent, getPLClass } from '../utils/formatters';

/**
 * 每日損益追蹤卡片
 * @param {Object} props
 * @param {Array} props.dailyRecords - 每日記錄陣列 [{date, maxPL, maxReturn, marketIndex, totalCost}]
 * @param {number} props.currentPL - 當前整體損益
 * @param {number} props.currentReturn - 當前整體報酬率
 * @param {Function} props.onClearRecords - 清除全部記錄回調
 * @param {Function} props.onDeleteRecord - 刪除單筆記錄回調
 */
function DailyPnLTracker({ dailyRecords = [], currentPL, currentReturn, onClearRecords, onDeleteRecord }) {
    const [isExpanded, setIsExpanded] = useState(false);

    // 準備圖表資料（最近 30 天）
    const chartData = useMemo(() => {
        const last30 = dailyRecords.slice(-30);
        return last30.map(record => ({
            date: record.date,
            displayDate: record.date.slice(5), // 只顯示 MM-DD
            maxPL: record.maxPL,
            maxReturn: record.maxReturn
        }));
    }, [dailyRecords]);

    // 統計數據
    const stats = useMemo(() => {
        if (dailyRecords.length === 0) {
            return { todayMax: 0, monthTotal: 0, avgDaily: 0 };
        }

        const today = new Date().toISOString().slice(0, 10);
        const todayRecord = dailyRecords.find(r => r.date === today);

        // 本月資料
        const currentMonth = today.slice(0, 7);
        const monthRecords = dailyRecords.filter(r => r.date.startsWith(currentMonth));

        // 計算本月損益變化（最後一天 - 第一天）
        let monthChange = 0;
        if (monthRecords.length >= 2) {
            monthChange = monthRecords[monthRecords.length - 1].maxPL - monthRecords[0].maxPL;
        } else if (monthRecords.length === 1) {
            monthChange = monthRecords[0].maxPL;
        }

        // 平均每日損益
        const avgDaily = dailyRecords.length > 1
            ? dailyRecords.reduce((sum, r) => sum + r.maxPL, 0) / dailyRecords.length
            : 0;

        return {
            todayMax: todayRecord?.maxPL || currentPL,
            monthChange,
            avgDaily
        };
    }, [dailyRecords, currentPL]);

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '12px',
                    boxShadow: 'var(--shadow-lg)'
                }}>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '4px', fontSize: '0.75rem' }}>
                        {label}
                    </p>
                    <p className={getPLClass(payload[0].value)} style={{ fontSize: '1rem', fontWeight: 600 }}>
                        {formatCurrency(payload[0].value)}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <section className="card">
            {/* 標題 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.125rem', fontWeight: 700 }}>
                    <Calendar size={20} style={{ color: '#f59e0b' }} />
                    每日損益追蹤
                </h2>
                {dailyRecords.length > 0 && (
                    <button
                        className="btn btn-secondary"
                        style={{ fontSize: '0.625rem', padding: '4px 8px' }}
                        onClick={onClearRecords}
                    >
                        <Trash2 size={12} />
                        清除記錄
                    </button>
                )}
            </div>

            {/* 統計摘要 */}
            <div className="grid grid-3 grid-1-mobile" style={{ marginBottom: '16px', textAlign: 'center' }}>
                <div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>今日最高</p>
                    <p className={`stat-value ${getPLClass(stats.todayMax)}`} style={{ fontSize: '1.25rem' }}>
                        {formatCurrency(stats.todayMax)}
                    </p>
                </div>
                <div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>本月變化</p>
                    <p className={`stat-value ${getPLClass(stats.monthChange)}`} style={{ fontSize: '1.25rem' }}>
                        {formatCurrency(stats.monthChange)}
                    </p>
                </div>
                <div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>平均每日</p>
                    <p className={`stat-value ${getPLClass(stats.avgDaily)}`} style={{ fontSize: '1.25rem' }}>
                        {formatCurrency(stats.avgDaily)}
                    </p>
                </div>
            </div>

            {/* 損益曲線圖 */}
            {chartData.length > 0 ? (
                <div style={{ height: '200px', marginBottom: '16px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                            <defs>
                                <linearGradient id="colorPL" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                            <XAxis
                                dataKey="displayDate"
                                tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
                                axisLine={{ stroke: 'var(--border-color)' }}
                                interval="preserveStartEnd"
                            />
                            <YAxis
                                tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
                                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                                axisLine={{ stroke: 'var(--border-color)' }}
                                width={45}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <ReferenceLine y={0} stroke="var(--text-muted)" strokeDasharray="3 3" />
                            <Area
                                type="monotone"
                                dataKey="maxPL"
                                stroke="#6366f1"
                                strokeWidth={2}
                                fill="url(#colorPL)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                <div style={{
                    height: '120px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-muted)',
                    fontSize: '0.875rem',
                    background: 'var(--bg-tertiary)',
                    borderRadius: '8px',
                    marginBottom: '16px'
                }}>
                    <TrendingUp size={20} style={{ marginRight: '8px', opacity: 0.5 }} />
                    尚無歷史記錄，每日首次開啟 APP 會自動記錄
                </div>
            )}

            {/* 可收折的歷史表格 */}
            {dailyRecords.length > 0 && (
                <>
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            padding: '8px',
                            background: 'var(--bg-tertiary)',
                            border: 'none',
                            borderRadius: '8px',
                            color: 'var(--text-secondary)',
                            cursor: 'pointer',
                            fontSize: '0.875rem'
                        }}
                    >
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        {isExpanded ? '收合歷史記錄' : `展開歷史記錄 (${dailyRecords.length} 筆)`}
                    </button>

                    {isExpanded && (
                        <div style={{ marginTop: '12px', overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                        <th style={{ padding: '8px', textAlign: 'left', color: 'var(--text-muted)' }}>日期</th>
                                        <th style={{ padding: '8px', textAlign: 'right', color: 'var(--text-muted)' }}>最高損益</th>
                                        <th style={{ padding: '8px', textAlign: 'right', color: 'var(--text-muted)' }}>報酬率</th>
                                        <th style={{ padding: '8px', textAlign: 'right', color: 'var(--text-muted)' }}>大盤指數</th>
                                        <th style={{ padding: '8px', textAlign: 'center', color: 'var(--text-muted)', width: '50px' }}>刪除</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[...dailyRecords].reverse().map((record, index) => (
                                        <tr key={record.date} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                            <td style={{ padding: '8px' }}>{record.date}</td>
                                            <td style={{ padding: '8px', textAlign: 'right' }}>
                                                <span className={getPLClass(record.maxPL)}>
                                                    {formatCurrency(record.maxPL)}
                                                </span>
                                            </td>
                                            <td style={{ padding: '8px', textAlign: 'right' }}>
                                                <span className={getPLClass(record.maxReturn)}>
                                                    {formatPercent(record.maxReturn)}
                                                </span>
                                            </td>
                                            <td style={{ padding: '8px', textAlign: 'right', color: 'var(--text-muted)' }}>
                                                {record.marketIndex?.toLocaleString() || '-'}
                                            </td>
                                            <td style={{ padding: '8px', textAlign: 'center' }}>
                                                <button
                                                    onClick={() => onDeleteRecord && onDeleteRecord(record.date)}
                                                    style={{
                                                        background: 'transparent',
                                                        border: 'none',
                                                        color: 'var(--color-danger)',
                                                        cursor: 'pointer',
                                                        padding: '4px',
                                                        borderRadius: '4px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}
                                                    title="刪除此筆記錄"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}
        </section>
    );
}

export default DailyPnLTracker;
