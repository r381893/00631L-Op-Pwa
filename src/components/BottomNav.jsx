import React from 'react';
import { TrendingUp, Plus, Menu } from 'lucide-react';

/**
 * 手機版底部導航列
 * @param {Object} props
 * @param {Function} props.onAddClick - 新增按鈕點擊回調
 */
function BottomNav({ onAddClick }) {
    return (
        <div className="bottom-nav">
            <button className="bottom-nav-item active">
                <TrendingUp size={20} />
                <span>損益</span>
            </button>

            <button className="bottom-nav-fab" onClick={onAddClick}>
                <Plus size={24} />
            </button>

            <button className="bottom-nav-item">
                <Menu size={20} />
                <span>更多</span>
            </button>
        </div>
    );
}

export default BottomNav;
