# 客戶專屬頁面

此資料夾放置各學校專屬頁的 Markdown 來源檔。

## 新增一間學校

1. 複製 `_template.md` 並重新命名（英文 slug，例如 `forest-school.md`）。
2. 填寫 front matter，必填：`slug`、`school`、`title`。`project_password` 為可選：有填則須在密碼輸入頁驗證後進入；不填則僅能由直接網址 `/projects/<slug>.html` 進入。
3. 在專案根目錄執行：**`npm run build:projects`**。
4. 建置後會更新 `projects/projects-index.json`（僅含已填 `project_password` 的專案）並產生 `projects/<slug>.html`。

## 專案圖片

- **實體位置**：`public/images/projects/{project-slug}/`（與 front matter 的 `slug` 一致）
- **Markdown 路徑**：`/images/projects/{project-slug}/image-name.jpg`

範例：陽光幼兒園（slug: `sunshine-kindergarten`）的照片放在 `public/images/projects/sunshine-kindergarten/`，文中引用為 `/images/projects/sunshine-kindergarten/group-photo.jpg`。

## 欄位說明

見 `_template.md` 內註解。有資料的欄位才會顯示在頁面上。
