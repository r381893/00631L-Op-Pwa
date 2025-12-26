import React from 'react';
import { Shield, Cloud, CloudOff, Loader, Check } from 'lucide-react';

/**
 * 頂部導航列組件
 * @param {Object} props
 * @param {string} props.syncStatus - 同步狀態 (idle, syncing, synced, error)
 * @param {string} props.lastSyncTime - 最後同步時間
 */
function Header({ syncStatus, lastSyncTime }) {
    // 根據同步狀態顯示不同圖示
    const renderSyncIcon = () => {
        switch (syncStatus) {
            case 'syncing':
                return <Loader size={14} className="spin" style={{ color: 'var(--color-warning)' }} />;
            case 'synced':
                return <Cloud size={14} style={{ color: 'var(--color-profit)' }} />;
            case 'error':
                return <CloudOff size={14} style={{ color: 'var(--color-danger)' }} />;
            default:
                return <Cloud size={14} style={{ color: 'var(--text-muted)' }} />;
        }
    };

    const getSyncText = () => {
        switch (syncStatus) {
            case 'syncing':
                return '同步中...';
            case 'synced':
                return lastSyncTime ? `已同步 ${lastSyncTime}` : '已同步';
            case 'error':
                return '同步失敗';
            default:
                return '離線';
        }
    };

    return (
        <header className="header">
            <div className="header-content">
                <div className="header-title">
                    <Shield size={24} />
                    <span>00631L 避險戰情室</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {renderSyncIcon()}
                    <span style={{
                        fontSize: '0.625rem',
                        color: syncStatus === 'error' ? 'var(--color-danger)' : 'var(--text-muted)'
                    }}>
                        {getSyncText()}
                    </span>
                </div>
            </div>
        </header>
    );
}

export default Header;

