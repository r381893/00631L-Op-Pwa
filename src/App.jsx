import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import Header from './components/Header';
import StockCard from './components/StockCard';
import HedgeTable from './components/HedgeTable';
import AddPositionModal from './components/AddPositionModal';
import PayoffChart from './components/PayoffChart';
import BottomNav from './components/BottomNav';
import TransactionHistory from './components/TransactionHistory';
import { calculatePositionPL } from './utils/calculations';
import { saveToFirebase, loadFromFirebase, subscribeToFirebase } from './utils/firebase';

// LocalStorage 鍵名 (作為離線備份)
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

    // 現金追蹤
    const [cash, setCash] = useState({
        initialCash: 0,      // 初始現金
        currentCash: 0       // 目前現金
    });

    // 避險部位
    const [positions, setPositions] = useState([]);

    // 交易明細記錄
    const [transactions, setTransactions] = useState([]);

    // 大盤指數
    const [marketIndex, setMarketIndex] = useState(22800);

    // Modal 狀態
    const [showAddModal, setShowAddModal] = useState(false);

    // 同步狀態
    const [syncStatus, setSyncStatus] = useState('idle'); // idle, syncing, synced, error
    const [lastSyncTime, setLastSyncTime] = useState(null);

    // 防止重複同步
    const isInitialLoad = useRef(true);
    const isSyncing = useRef(false);

    // 從 Firebase 載入資料
    useEffect(() => {
        async function initData() {
            setSyncStatus('syncing');

            // 先嘗試從 Firebase 載入
            const cloudData = await loadFromFirebase();

            if (cloudData) {
                if (cloudData.stock) setStock(cloudData.stock);
                if (cloudData.cash) setCash(cloudData.cash);
                if (cloudData.positions) setPositions(cloudData.positions);
                if (cloudData.marketIndex) setMarketIndex(cloudData.marketIndex);
                if (cloudData.transactions) setTransactions(cloudData.transactions);
                setSyncStatus('synced');
                setLastSyncTime(new Date().toLocaleTimeString('zh-TW'));
                console.log('✅ 從雲端載入資料');
            } else {
                // 如果雲端沒資料，從 LocalStorage 載入
                const localData = loadData();
                if (localData) {
                    if (localData.stock) setStock(localData.stock);
                    if (localData.cash) setCash(localData.cash);
                    if (localData.positions) setPositions(localData.positions);
                    if (localData.marketIndex) setMarketIndex(localData.marketIndex);
                    if (localData.transactions) setTransactions(localData.transactions);
                }
                setSyncStatus('idle');
            }

            isInitialLoad.current = false;
        }

        initData();

        // 監聽 Firebase 即時更新
        const unsubscribe = subscribeToFirebase((data) => {
            if (!isSyncing.current && data) {
                console.log('🔄 收到雲端更新');
                if (data.stock) setStock(data.stock);
                if (data.cash) setCash(data.cash);
                if (data.positions) setPositions(data.positions);
                if (data.marketIndex) setMarketIndex(data.marketIndex);
                if (data.transactions) setTransactions(data.transactions);
                setLastSyncTime(new Date().toLocaleTimeString('zh-TW'));
            }
        });

        return () => unsubscribe();
    }, []);

    // 同步資料到 Firebase 和 LocalStorage
    const syncData = useCallback(async (data) => {
        if (isInitialLoad.current) return;

        isSyncing.current = true;
        setSyncStatus('syncing');

        // 儲存到 LocalStorage (離線備份)
        saveData(data);

        // 同步到 Firebase
        const success = await saveToFirebase(data);

        if (success) {
            setSyncStatus('synced');
            setLastSyncTime(new Date().toLocaleTimeString('zh-TW'));
        } else {
            setSyncStatus('error');
        }

        isSyncing.current = false;
    }, []);

    // 資料變化時自動同步
    useEffect(() => {
        const data = { stock, cash, positions, marketIndex, transactions };
        syncData(data);
    }, [stock, cash, positions, marketIndex, transactions, syncData]);

    // 計算總避險損益
    const totalHedgePL = useMemo(() => {
        return positions.reduce((acc, pos) => acc + calculatePositionPL(pos, marketIndex), 0);
    }, [positions, marketIndex]);

    // 新增部位（並記錄交易）
    const handleAddPosition = (newPosition) => {
        setPositions(prev => [...prev, newPosition]);

        // 記錄交易明細
        const transaction = {
            id: `tx-${Date.now()}`,
            timestamp: new Date().toISOString(),
            action: 'open',
            positionType: newPosition.type,
            side: newPosition.side,
            qty: newPosition.qty,
            price: newPosition.type === 'option' ? newPosition.premium : newPosition.price,
            callPut: newPosition.callPut,
            strike: newPosition.strike,
            positionId: newPosition.id
        };
        setTransactions(prev => [...prev, transaction]);
    };

    // 移除部位（並記錄平倉交易）
    const handleRemovePosition = (id) => {
        const position = positions.find(p => p.id === id);
        if (position) {
            const transaction = {
                id: `tx-${Date.now()}`,
                timestamp: new Date().toISOString(),
                action: 'close',
                positionType: position.type,
                side: position.side,
                qty: position.qty,
                price: position.type === 'option' ? position.premium : position.price,
                callPut: position.callPut,
                strike: position.strike,
                positionId: position.id
            };
            setTransactions(prev => [...prev, transaction]);
        }
        setPositions(prev => prev.filter(p => p.id !== id));
    };

    // 清除所有交易記錄
    const handleClearTransactions = () => {
        if (window.confirm('確定要清除所有交易記錄嗎？')) {
            setTransactions([]);
        }
    };

    return (
        <div className="app">
            <Header syncStatus={syncStatus} lastSyncTime={lastSyncTime} />

            <main className="main-content">
                <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '16px' }}>
                    <StockCard
                        stock={stock}
                        onStockChange={setStock}
                        cash={cash}
                        onCashChange={setCash}
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

                    <TransactionHistory
                        transactions={transactions}
                        onClear={handleClearTransactions}
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
