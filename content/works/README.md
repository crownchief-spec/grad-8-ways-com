# 攝影作品文章

此資料夾放置「攝影作品文章」的 Markdown 來源檔。

## 新增一篇作品

1. 複製 `_template.md` 並重新命名（建議用英文與日期，例如 `sunshine-kinder-2024-06.md`）。
2. 填寫 front matter 與內文。
3. 封面與 gallery 圖片請放在 `assets/images/works/`，路徑使用 `/assets/images/works/檔名.jpg`。
4. 在專案根目錄執行：**`npm run build:works`**。
5. 建置後會更新 `assets/data/works.json` 並產生 `pages/work/<slug>.html`。

## 欄位說明

| 欄位 | 必填 | 說明 |
|------|------|------|
| title | ✓ | 作品標題 |
| date | ✓ | 日期，格式 YYYY-MM-DD |
| category | ✓ | 主類別：graduation-photo / graduation-ceremony / school-event / family-photo |
| subcategory | 選 | 次類別：kindergarten / primary-school / school / family / group-family / outdoor / campus-life / event |
| cover | ✓ | 封面圖路徑 |
| excerpt | 選 | 摘要（列表與 SEO 用） |
| gallery | 選 | 圖片陣列，可多張 |
| video | 選 | 影片連結（例如 YouTube 網址） |
| tags | 選 | 標籤陣列 |
| draft | 選 | true 時不會被建置 |

未填的選填欄位在單篇頁面不會顯示該區塊。
