import React from 'react';
import { Shield, Smartphone } from 'lucide-react';

/**
 * 頂部導航列組件
 */
function Header() {
    return (
        <header className="header">
            <div className="header-content">
                <div className="header-title">
                    <Shield size={24} />
                    <span>00631L 避險戰情室</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Smartphone size={14} style={{ color: 'var(--text-muted)' }} />
                    <span className="header-badge">PWA</span>
                </div>
            </div>
        </header>
    );
}

export default Header;
