# 開發記錄

## 2026-01-02 複式單識別修復

### 問題
複式單（價差策略）沒有被正確識別並顯示在 UI 上。

### 原因分析
1. 原本的識別邏輯有履約價差距限制（200 點），太嚴格
2. **最關鍵**：修改程式碼後沒有執行 `npm run build`，所以 `/docs` 資料夾的 production build 沒更新

### 解決方案

#### 1. 修改複式單識別邏輯
檔案：`src/components/HedgeTable.jsx`

- 移除履約價差距限制（原本只允許 200 點內）
- 現在只要符合以下條件就會識別為複式單：
  - 同類型（都是 Call 或都是 Put）
  - 一買一賣
  - 口數相同

#### 2. 重新編譯並部署

```bash
# 安裝依賴（如果未安裝）
npm install

# 編譯生產版本（會更新 /docs 資料夾）
npm run build

# 推送到 GitHub
git add -A
git commit -m "更新說明"
git push
```

### 重要提醒 ⚠️

**每次修改 `src/` 程式碼後，必須執行：**

```bash
npm run build
git add -A && git commit -m "更新說明" && git push
```

否則線上版本不會更新！因為 GitHub Pages 是讀取 `/docs` 資料夾的內容。

### 複式單識別規則

| 條件 | 說明 |
|------|------|
| 同類型 | 都是 Call 或都是 Put |
| 一買一賣 | 一個買進、一個賣出 |
| 口數相同 | 例如都是 1 口 |

不符合上述規則的會顯示為獨立部位。

---

## 部署流程備忘

1. 修改 `src/` 下的程式碼
2. 本地測試：`npm run dev`
3. 編譯：`npm run build`
4. 推送：`git add -A && git commit -m "說明" && git push`
5. 等待 1-2 分鐘後，強制刷新瀏覽器（Cmd+Shift+R）
