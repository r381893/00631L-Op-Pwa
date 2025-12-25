import React, { useState, useMemo, useEffect } from 'react';
import Header from './components/Header';
import StockCard from './components/StockCard';
import HedgeTable from './components/HedgeTable';
import AddPositionModal from './components/AddPositionModal';
import PayoffChart from './components/PayoffChart';
import BottomNav from './components/BottomNav';
import { calculatePositionPL } from './utils/calculations';

// LocalStorage 鍵名
const STORAGE_KEY = '00631l-hedge-data';

/**
 * 從 LocalStorage 讀取資料
 */
function loadData() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            return JSON.parse(saved);
        }
    } catch (e) {
        console.error('Failed to load data:', e);
    }
    return null;
}

/**
 * 儲存資料到 LocalStorage
 */
function saveData(data) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
        console.error('Failed to save data:', e);
    }
}

/**
 * 主應用組件
 */
function App() {
    // 持股資料
    const [stock, setStock] = useState({
        symbol: '00631L',
        shares: 5000,
        avgCost: 180.0,
        currentPrice: 245.5
    });

    // 避險部位
    const [positions, setPositions] = useState([
        {
            id: 'demo-1',
            type: 'option',
            side: 'buy',
            callPut: 'put',
            strike: 22000,
            premium: 150,
            multiplier: 50,
            qty: 2
        },
        {
            id: 'demo-2',
            type: 'future',
            side: 'sell',
            price: 22500,
            multiplier: 50,
            qty: 1
        }
    ]);

    // 大盤指數
    const [marketIndex, setMarketIndex] = useState(22800);

    // Modal 狀態
    const [showAddModal, setShowAddModal] = useState(false);

    // 載入儲存的資料
    useEffect(() => {
        const saved = loadData();
        if (saved) {
            if (saved.stock) setStock(saved.stock);
            if (saved.positions) setPositions(saved.positions);
            if (saved.marketIndex) setMarketIndex(saved.marketIndex);
        }
    }, []);

    // 自動儲存
    useEffect(() => {
        saveData({ stock, positions, marketIndex });
    }, [stock, positions, marketIndex]);

    // 計算總避險損益
    const totalHedgePL = useMemo(() => {
        return positions.reduce((acc, pos) => acc + calculatePositionPL(pos, marketIndex), 0);
    }, [positions, marketIndex]);

    // 新增部位
    const handleAddPosition = (newPosition) => {
        setPositions(prev => [...prev, newPosition]);
    };

    // 移除部位
    const handleRemovePosition = (id) => {
        setPositions(prev => prev.filter(p => p.id !== id));
    };

    return (
        <div className="app">
            <Header />

            <main className="main-content">
                <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '16px' }}>
                    <StockCard
                        stock={stock}
                        onStockChange={setStock}
                        marketIndex={marketIndex}
                        onMarketIndexChange={setMarketIndex}
                        totalHedgePL={totalHedgePL}
                    />

                    <HedgeTable
                        positions={positions}
                        marketIndex={marketIndex}
                        onAddClick={() => setShowAddModal(true)}
                        onRemove={handleRemovePosition}
                    />

                    <PayoffChart
                        stock={stock}
                        positions={positions}
                        marketIndex={marketIndex}
                    />
                </div>
            </main>

            <AddPositionModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onAdd={handleAddPosition}
            />

            <BottomNav onAddClick={() => setShowAddModal(true)} />
        </div>
    );
}

export default App;
