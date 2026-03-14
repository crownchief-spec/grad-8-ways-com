# 客戶專屬頁面

此資料夾放置各學校專屬頁的 Markdown 來源檔。

## 新增一間學校

1. 複製 `_template.md` 並重新命名（英文 slug，例如 `forest-school.md`）。
2. 填寫 front matter，必填：`slug`、`school`、`project_code`（查詢碼）、`title`。
3. 在專案根目錄執行：**`npm run build:projects`**。
4. 建置後會更新 `projects/projects-index.json` 並產生 `projects/<slug>.html`。

查詢時可用「專屬查詢碼」或「學校名稱」進入該校專屬頁。

## 欄位說明

見 `_template.md` 內註解。有資料的欄位才會顯示在頁面上。
