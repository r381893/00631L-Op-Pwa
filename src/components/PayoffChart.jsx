import React, { useMemo } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
    Legend
} from 'recharts';
import { Calculator } from 'lucide-react';
import { generateScenarioData } from '../utils/calculations';
import { formatCurrency } from '../utils/formatters';

/**
 * 損益情境分析圖表
 * @param {Object} props
 * @param {Object} props.stock - 持股資料
 * @param {Array} props.positions - 避險部位陣列
 * @param {number} props.marketIndex - 基準大盤指數
 */
function PayoffChart({ stock, positions, marketIndex }) {
    const data = useMemo(() => {
        return generateScenarioData(stock, positions, marketIndex, 0.05, 10);
    }, [stock, positions, marketIndex]);

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
                    <p style={{ color: 'var(--text-muted)', marginBottom: '8px', fontSize: '0.875rem' }}>
                        大盤指數: <strong>{label?.toLocaleString()}</strong>
                    </p>
                    {payload.map((entry, index) => (
                        <p key={index} style={{ color: entry.color, fontSize: '0.875rem', margin: '4px 0' }}>
                            {entry.name}: {formatCurrency(entry.value)}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <section className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.125rem', fontWeight: 700 }}>
                    <Calculator size={20} style={{ color: '#a855f7' }} />
                    損益情境模擬 (Payoff Analysis)
                </h2>
            </div>

            <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                        <XAxis
                            dataKey="index"
                            tick={{ fontSize: 12, fill: 'var(--text-muted)' }}
                            tickFormatter={(value) => (value / 1000).toFixed(1) + 'k'}
                            axisLine={{ stroke: 'var(--border-color)' }}
                        />
                        <YAxis
                            tick={{ fontSize: 12, fill: 'var(--text-muted)' }}
                            tickFormatter={(value) => `${value / 1000}k`}
                            axisLine={{ stroke: 'var(--border-color)' }}
                            width={50}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            verticalAlign="top"
                            height={36}
                            wrapperStyle={{ fontSize: '0.75rem' }}
                        />
                        <ReferenceLine y={0} stroke="var(--text-muted)" strokeDasharray="3 3" />

                        <Line
                            type="monotone"
                            dataKey="netPL"
                            name="淨損益 (Net)"
                            stroke="#6366f1"
                            strokeWidth={3}
                            dot={false}
                            activeDot={{ r: 6 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="stockPL"
                            name="00631L 損益"
                            stroke="#ef4444"
                            strokeWidth={2}
                            dot={false}
                            strokeDasharray="5 5"
                        />
                        <Line
                            type="monotone"
                            dataKey="hedgePL"
                            name="避險損益"
                            stroke="#10b981"
                            strokeWidth={2}
                            dot={false}
                            strokeDasharray="5 5"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <p style={{ fontSize: '0.75rem', textAlign: 'center', color: 'var(--text-muted)', marginTop: '12px' }}>
                * 模擬假設 00631L 波動幅度為大盤的 2 倍。實際情況可能因溢價或追蹤誤差有所不同。
            </p>
        </section>
    );
}

export default PayoffChart;
