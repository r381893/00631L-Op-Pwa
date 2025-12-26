import React, { useState } from 'react';
import { Upload, X, Check, AlertCircle } from 'lucide-react';

/**
 * 快速匯入部位功能
 * 支援 CSV 格式的文字貼上
 * 格式: 類型,方向,Call/Put,履約價,權利金,口數
 */
function QuickImport({ isOpen, onClose, onImport }) {
    const [inputText, setInputText] = useState('');
    const [parseResult, setParseResult] = useState(null);
    const [error, setError] = useState(null);
    const [replaceMode, setReplaceMode] = useState(true); // 預設為覆蓋模式

    // 解析輸入的文字
    const parseInput = (text) => {
        setError(null);

        if (!text.trim()) {
            setParseResult(null);
            return;
        }

        try {
            const lines = text.trim().split('\n');
            const positions = [];

            for (const line of lines) {
                // 跳過標題行
                if (line.toLowerCase().includes('類型') || line.toLowerCase().includes('type')) {
                    continue;
                }

                // 跳過空行
                if (!line.trim()) continue;

                const parts = line.split(',').map(p => p.trim());

                if (parts.length < 6) {
                    throw new Error(`格式錯誤: "${line}" - 需要 6 個欄位`);
                }

                const [type, side, callPut, strike, premium, qty] = parts;

                // 驗證資料
                if (!['option', 'future', '選擇權', '期貨'].includes(type.toLowerCase())) {
                    throw new Error(`類型錯誤: "${type}" - 請使用 option 或 future`);
                }
                if (!['buy', 'sell', '買', '賣', '買進', '賣出'].includes(side.toLowerCase())) {
                    throw new Error(`方向錯誤: "${side}" - 請使用 buy 或 sell`);
                }

                const isOption = ['option', '選擇權'].includes(type.toLowerCase());
                const isBuy = ['buy', '買', '買進'].includes(side.toLowerCase());
                const isCall = ['call', 'c', '買權'].includes(callPut.toLowerCase());

                positions.push({
                    id: `import-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    type: isOption ? 'option' : 'future',
                    side: isBuy ? 'buy' : 'sell',
                    callPut: isCall ? 'call' : 'put',
                    strike: parseInt(strike) || 0,
                    premium: parseFloat(premium) || 0,
                    price: parseFloat(premium) || 0,
                    multiplier: 50,
                    qty: parseInt(qty) || 0
                });
            }

            if (positions.length === 0) {
                throw new Error('沒有找到有效的部位資料');
            }

            setParseResult(positions);
        } catch (e) {
            setError(e.message);
            setParseResult(null);
        }
    };

    const handleTextChange = (e) => {
        const text = e.target.value;
        setInputText(text);
        parseInput(text);
    };

    const handleImport = () => {
        if (parseResult && parseResult.length > 0) {
            onImport(parseResult, replaceMode);
            setInputText('');
            setParseResult(null);
            onClose();
        }
    };

    const handleClear = () => {
        setInputText('');
        setParseResult(null);
        setError(null);
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()} style={{
                maxWidth: '500px',
                maxHeight: '85vh',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <div className="modal-header">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Upload size={20} />
                        快速匯入部位
                    </h3>
                    <button className="modal-close" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-body" style={{ flex: 1, overflowY: 'auto' }}>
                    <div style={{ marginBottom: '12px' }}>
                        <label className="input-label">貼上部位資料 (CSV 格式)</label>
                        <textarea
                            className="input"
                            style={{
                                minHeight: '100px',
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.75rem',
                                resize: 'vertical'
                            }}
                            placeholder="類型,方向,Call/Put,履約價,權利金,口數
option,buy,put,27900,45.5,2
option,sell,call,28600,64.25,4"
                            value={inputText}
                            onChange={handleTextChange}
                        />
                    </div>

                    {/* 格式說明 */}
                    <div style={{
                        padding: '8px',
                        background: 'var(--bg-tertiary)',
                        borderRadius: '8px',
                        fontSize: '0.7rem',
                        color: 'var(--text-muted)',
                        marginBottom: '12px'
                    }}>
                        <strong>格式說明:</strong><br />
                        類型: option/future | 方向: buy/sell | Call/Put: call/put<br />
                        履約價: 數字 | 權利金: 數字 | 口數: 數字
                    </div>

                    {/* 匯入模式選擇 */}
                    <div style={{
                        display: 'flex',
                        gap: '16px',
                        marginBottom: '12px',
                        fontSize: '0.8rem'
                    }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                            <input
                                type="radio"
                                name="importMode"
                                checked={replaceMode}
                                onChange={() => setReplaceMode(true)}
                            />
                            <span>覆蓋（清除舊部位）</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                            <input
                                type="radio"
                                name="importMode"
                                checked={!replaceMode}
                                onChange={() => setReplaceMode(false)}
                            />
                            <span>新增（保留舊部位）</span>
                        </label>
                    </div>

                    {/* 錯誤訊息 */}
                    {error && (
                        <div style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '8px',
                            padding: '8px 12px',
                            marginBottom: '12px',
                            background: 'rgba(239, 68, 68, 0.1)',
                            borderRadius: '8px',
                            fontSize: '0.75rem',
                            color: 'var(--color-danger)'
                        }}>
                            <AlertCircle size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
                            {error}
                        </div>
                    )}

                    {/* 解析結果預覽 */}
                    {parseResult && parseResult.length > 0 && (
                        <div style={{
                            padding: '8px 12px',
                            marginBottom: '12px',
                            background: 'rgba(16, 185, 129, 0.1)',
                            borderRadius: '8px',
                            fontSize: '0.75rem',
                            color: 'var(--color-profit)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
                                <Check size={14} />
                                <strong>解析成功！將匯入 {parseResult.length} 筆部位:</strong>
                            </div>
                            <div style={{ maxHeight: '100px', overflowY: 'auto' }}>
                                {parseResult.map((pos, i) => (
                                    <div key={i} style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>
                                        {pos.side === 'buy' ? '買' : '賣'} {pos.callPut === 'call' ? 'Call' : 'Put'} @{pos.strike} ×{pos.qty}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={handleClear}>
                        清除
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={handleImport}
                        disabled={!parseResult || parseResult.length === 0}
                    >
                        <Check size={16} />
                        匯入 {parseResult ? parseResult.length : 0} 筆
                    </button>
                </div>
            </div>
        </div>
    );
}

export default QuickImport;
