import React from 'react';
import { TrendingUp, Plus, Upload } from 'lucide-react';

/**
 * 手機版底部導航列
 * @param {Object} props
 * @param {Function} props.onAddClick - 新增按鈕點擊回調
 * @param {Function} props.onQuickImportClick - 快速匯入按鈕點擊回調
 */
function BottomNav({ onAddClick, onQuickImportClick }) {
    return (
        <div className="bottom-nav">
            <button className="bottom-nav-item active">
                <TrendingUp size={20} />
                <span>損益</span>
            </button>

            <button className="bottom-nav-fab" onClick={onAddClick}>
                <Plus size={24} />
            </button>

            <button className="bottom-nav-item" onClick={onQuickImportClick}>
                <Upload size={20} />
                <span>匯入</span>
            </button>
        </div>
    );
}

export default BottomNav;
