/**
 * 00631L 避險系統 - 後端 API
 * 用於代理 Yahoo Finance 股價查詢，解決 CORS 問題
 * 
 * 部署到 Render.com
 */

import express from 'express';
import cors from 'cors';
import yahooFinance from 'yahoo-finance2';

const app = express();
const PORT = process.env.PORT || 3001;

// CORS 設定
app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:3000',
        /\.github\.io$/,  // 允許 GitHub Pages
        /\.onrender\.com$/  // 允許 Render 部署的前端
    ],
    methods: ['GET'],
    optionsSuccessStatus: 200
}));

app.use(express.json());

// 健康檢查
app.get('/', (req, res) => {
    res.json({
        status: 'ok',
        message: '00631L 避險系統 API',
        version: '1.0.0',
        endpoints: [
            'GET /api/quote?symbol=00631L.TW',
            'GET /api/quotes?symbols=00631L.TW,2330.TW'
        ]
    });
});

/**
 * 取得單一股票報價
 * GET /api/quote?symbol=00631L.TW
 */
app.get('/api/quote', async (req, res) => {
    const { symbol } = req.query;

    if (!symbol) {
        return res.status(400).json({ error: 'Missing symbol parameter' });
    }

    try {
        const quote = await yahooFinance.quote(symbol);

        res.json({
            symbol: quote.symbol,
            name: quote.shortName || quote.longName,
            price: quote.regularMarketPrice,
            change: quote.regularMarketChange,
            changePercent: quote.regularMarketChangePercent,
            previousClose: quote.regularMarketPreviousClose,
            open: quote.regularMarketOpen,
            high: quote.regularMarketDayHigh,
            low: quote.regularMarketDayLow,
            volume: quote.regularMarketVolume,
            marketTime: quote.regularMarketTime,
            currency: quote.currency
        });
    } catch (error) {
        console.error(`Error fetching quote for ${symbol}:`, error.message);
        res.status(500).json({
            error: 'Failed to fetch quote',
            message: error.message
        });
    }
});

/**
 * 取得多個股票報價
 * GET /api/quotes?symbols=00631L.TW,2330.TW
 */
app.get('/api/quotes', async (req, res) => {
    const { symbols } = req.query;

    if (!symbols) {
        return res.status(400).json({ error: 'Missing symbols parameter' });
    }

    const symbolList = symbols.split(',').map(s => s.trim());

    try {
        const quotes = await Promise.all(
            symbolList.map(async (symbol) => {
                try {
                    const quote = await yahooFinance.quote(symbol);
                    return {
                        symbol: quote.symbol,
                        name: quote.shortName || quote.longName,
                        price: quote.regularMarketPrice,
                        change: quote.regularMarketChange,
                        changePercent: quote.regularMarketChangePercent
                    };
                } catch (e) {
                    return { symbol, error: e.message };
                }
            })
        );

        res.json({ quotes });
    } catch (error) {
        console.error('Error fetching quotes:', error.message);
        res.status(500).json({
            error: 'Failed to fetch quotes',
            message: error.message
        });
    }
});

/**
 * 取得台灣加權指數
 * GET /api/taiex
 */
app.get('/api/taiex', async (req, res) => {
    try {
        // ^TWII 是台灣加權指數
        const quote = await yahooFinance.quote('^TWII');

        res.json({
            symbol: '^TWII',
            name: '台灣加權指數',
            price: quote.regularMarketPrice,
            change: quote.regularMarketChange,
            changePercent: quote.regularMarketChangePercent,
            marketTime: quote.regularMarketTime
        });
    } catch (error) {
        console.error('Error fetching TAIEX:', error.message);
        res.status(500).json({
            error: 'Failed to fetch TAIEX',
            message: error.message
        });
    }
});

// 啟動伺服器
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 API endpoints:`);
    console.log(`   GET /api/quote?symbol=00631L.TW`);
    console.log(`   GET /api/quotes?symbols=00631L.TW,2330.TW`);
    console.log(`   GET /api/taiex`);
});
