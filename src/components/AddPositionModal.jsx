import React, { useState } from 'react';
import { generateId } from '../utils/formatters';

/**
 * 新增避險部位彈窗
 * @param {Object} props
 * @param {boolean} props.isOpen - 是否顯示
 * @param {Function} props.onClose - 關閉回調
 * @param {Function} props.onAdd - 新增部位回調
 */
function AddPositionModal({ isOpen, onClose, onAdd }) {
    const [formData, setFormData] = useState({
        type: 'option',
        side: 'buy',
        callPut: 'put',
        strike: 22000,
        premium: 0,
        price: 22500,
        qty: 1,
        multiplier: 50
    });

    if (!isOpen) return null;

    const handleSubmit = () => {
        const position = {
            id: generateId(),
            ...formData
        };
        onAdd(position);
        onClose();
        // 重設表單
        setFormData({
            type: 'option',
            side: 'buy',
            callPut: 'put',
            strike: 22000,
            premium: 0,
            price: 22500,
            qty: 1,
            multiplier: 50
        });
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>新增避險部位</h3>
                    <button className="modal-close" onClick={onClose}>&times;</button>
                </div>

                <div className="modal-body">
                    {/* 商品選擇 */}
                    <div className="toggle-group" style={{ marginBottom: '16px' }}>
                        <button
                            className={`toggle-btn ${formData.type === 'option' ? 'active' : ''}`}
                            onClick={() => handleChange('type', 'option')}
                        >
                            選擇權 (TXO)
                        </button>
                        <button
                            className={`toggle-btn ${formData.type === 'future' ? 'active' : ''}`}
                            onClick={() => handleChange('type', 'future')}
                        >
                            期貨 (微台/小台)
                        </button>
                    </div>

                    {/* 買賣方向與口數 */}
                    <div className="grid grid-2" style={{ marginBottom: '16px' }}>
                        <div>
                            <label className="input-label">方向</label>
                            <select
                                className="select"
                                value={formData.side}
                                onChange={(e) => handleChange('side', e.target.value)}
                            >
                                <option value="buy">買進 (Buy)</option>
                                <option value="sell">賣出 (Sell)</option>
                            </select>
                        </div>
                        <div>
                            <label className="input-label">口數</label>
                            <input
                                type="number"
                                className="input"
                                min="1"
                                value={formData.qty}
                                onChange={(e) => handleChange('qty', parseInt(e.target.value) || 1)}
                            />
                        </div>
                    </div>

                    {/* 選擇權專屬欄位 */}
                    {formData.type === 'option' && (
                        <div className="grid grid-2" style={{ gap: '16px' }}>
                            <div>
                                <label className="input-label">權利 (C/P)</label>
                                <select
                                    className="select"
                                    value={formData.callPut}
                                    onChange={(e) => handleChange('callPut', e.target.value)}
                                >
                                    <option value="call">買權 (Call)</option>
                                    <option value="put">賣權 (Put)</option>
                                </select>
                            </div>
                            <div>
                                <label className="input-label">履約價</label>
                                <input
                                    type="number"
                                    className="input"
                                    placeholder="例如 23000"
                                    step="100"
                                    value={formData.strike}
                                    onChange={(e) => handleChange('strike', parseInt(e.target.value) || 0)}
                                />
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label className="input-label">權利金 (點數)</label>
                                <input
                                    type="number"
                                    className="input"
                                    placeholder="例如 150"
                                    value={formData.premium}
                                    onChange={(e) => handleChange('premium', parseFloat(e.target.value) || 0)}
                                />
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label className="input-label">乘數</label>
                                <div className="toggle-group">
                                    <button
                                        className={`toggle-btn ${formData.multiplier === 50 ? 'active' : ''}`}
                                        onClick={() => handleChange('multiplier', 50)}
                                    >
                                        一般 (50)
                                    </button>
                                    <button
                                        className={`toggle-btn ${formData.multiplier === 10 ? 'active' : ''}`}
                                        onClick={() => handleChange('multiplier', 10)}
                                    >
                                        微選 (10)
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 期貨專屬欄位 */}
                    {formData.type === 'future' && (
                        <div>
                            <div style={{ marginBottom: '16px' }}>
                                <label className="input-label">成交價格</label>
                                <input
                                    type="number"
                                    className="input"
                                    placeholder="例如 22500"
                                    value={formData.price}
                                    onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
                                />
                            </div>
                            <div>
                                <label className="input-label">合約類型</label>
                                <div className="toggle-group">
                                    <button
                                        className={`toggle-btn ${formData.multiplier === 50 ? 'active' : ''}`}
                                        onClick={() => handleChange('multiplier', 50)}
                                    >
                                        微台 (50)
                                    </button>
                                    <button
                                        className={`toggle-btn ${formData.multiplier === 200 ? 'active' : ''}`}
                                        onClick={() => handleChange('multiplier', 200)}
                                    >
                                        小台 (200)
                                    </button>
                                </div>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                                    微台: 1點50元 / 小台: 1點200元
                                </p>
                            </div>
                        </div>
                    )}

                    <button
                        className="btn btn-primary btn-lg"
                        style={{ width: '100%', marginTop: '24px' }}
                        onClick={handleSubmit}
                    >
                        確認新增
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AddPositionModal;
