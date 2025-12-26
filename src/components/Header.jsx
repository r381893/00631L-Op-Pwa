import React from 'react';
import { Shield, Cloud, CloudOff, Loader, RefreshCw } from 'lucide-react';

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
                return lastSyncTime ? `${lastSyncTime}` : '已同步';
            case 'error':
                return '同步失敗';
            default:
                return '離線';
        }
    };

    // 強制更新：清除 Service Worker 快取並重新載入
    const handleForceUpdate = async () => {
        if (window.confirm('確定要強制更新嗎？這會清除快取並重新載入最新版本。')) {
            try {
                // 清除 Service Worker 快取
                if ('caches' in window) {
                    const cacheNames = await caches.keys();
                    await Promise.all(cacheNames.map(name => caches.delete(name)));
                }

                // 註銷 Service Worker
                if ('serviceWorker' in navigator) {
                    const registrations = await navigator.serviceWorker.getRegistrations();
                    await Promise.all(registrations.map(r => r.unregister()));
                }

                // 強制重新載入
                window.location.reload(true);
            } catch (error) {
                console.error('強制更新失敗:', error);
                window.location.reload(true);
            }
        }
    };

    return (
        <header className="header">
            <div className="header-content">
                <div className="header-title">
                    <Shield size={24} />
                    <span>00631L 避險戰情室</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                        style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                        onClick={handleForceUpdate}
                        title="點擊強制更新"
                    >
                        {renderSyncIcon()}
                        <span style={{
                            fontSize: '0.625rem',
                            color: syncStatus === 'error' ? 'var(--color-danger)' : 'var(--text-muted)'
                        }}>
                            {getSyncText()}
                        </span>
                    </div>
                    <button
                        onClick={handleForceUpdate}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            padding: '4px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            color: 'var(--text-muted)'
                        }}
                        title="強制更新"
                    >
                        <RefreshCw size={14} />
                    </button>
                </div>
            </div>
        </header>
    );
}

export default Header;

