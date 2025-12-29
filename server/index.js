/**
 * 00631L 避險系統 - 後端 API
 * 用於代理 Yahoo Finance 股價查詢，解決 CORS 問題
 * 
 * 部署到 Render.com
 */

import express from 'express';
import cors from 'cors';
import yahooFinance from 'yahoo-finance2';
import { GoogleGenerativeAI } from '@google/generative-ai';

const app = express();

// Gemini AI 設定
const genAI = process.env.GEMINI_API_KEY
    ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    : null;
const PORT = process.env.PORT || 3001;

// CORS 設定
app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:3000',
        /\.github\.io$/,  // 允許 GitHub Pages
        /\.onrender\.com$/  // 允許 Render 部署的前端
    ],
    methods: ['GET', 'POST'],
    optionsSuccessStatus: 200
}));

// 增加 JSON body 大小限制（圖片 base64 需要較大空間）
app.use(express.json({ limit: '10mb' }));

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

/**
 * 圖片 OCR 辨識交易部位
 * POST /api/ocr-image
 * Body: { image: "base64 encoded image data" }
 */
app.post('/api/ocr-image', async (req, res) => {
    if (!genAI) {
        return res.status(500).json({
            error: 'Gemini API not configured',
            message: '請在環境變數設定 GEMINI_API_KEY'
        });
    }

    const { image } = req.body;

    if (!image) {
        return res.status(400).json({ error: 'Missing image data' });
    }

    try {
        // 移除 data URL prefix (如果有的話)
        const base64Data = image.replace(/^data:image\/\w+;base64,/, '');

        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

        const prompt = `請辨識這張圖片中的交易部位資料，並轉換成 CSV 格式。

格式規則：
- 第一行是標題：類型,方向,Call/Put,履約價,權利金,口數
- 類型：選擇權用 option，期貨用 future
- 方向：買進用 buy，賣出用 sell
- Call/Put：買權用 call，賣權用 put，期貨用 -
- 履約價：數字
- 權利金：數字（期貨則填成交價）
- 口數：數字

注意事項：
- 請仔細辨識圖片中的每一筆交易部位
- 如果是複式單（價差單），請拆成兩筆個別的選擇權部位
- 如果無法辨識，請回傳 "ERROR: 無法辨識圖片內容"
- 只回傳 CSV 格式的資料，不要加其他說明文字

範例輸出：
類型,方向,Call/Put,履約價,權利金,口數
option,buy,put,22000,150,2
option,sell,call,23000,80,1`;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    mimeType: 'image/png',
                    data: base64Data
                }
            }
        ]);

        const response = await result.response;
        const csvText = response.text();

        // 檢查是否辨識失敗
        if (csvText.includes('ERROR:')) {
            return res.status(400).json({
                error: 'OCR failed',
                message: csvText
            });
        }

        res.json({
            success: true,
            csv: csvText.trim()
        });

    } catch (error) {
        console.error('OCR Error:', error.message);
        res.status(500).json({
            error: 'OCR processing failed',
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
    console.log(`   POST /api/ocr-image`);
    console.log(`🤖 Gemini AI: ${genAI ? 'Configured' : 'Not configured'}`);
});
