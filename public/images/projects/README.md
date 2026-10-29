# 客戶專案圖片

此目錄存放各客戶專案的圖片，每個專案一個資料夾。

## 資料夾結構

```
/public/images/projects/
├── README.md
├── sunshine-kindergarten/   ← 該校所有照片放此
└── {project-slug}/          ← 其他專案依 slug 建立
```

## 專案 slug

與 `content/projects/{slug}.md` 的 `slug` 欄位一致，例如：

- `sunshine-kindergarten` → `/public/images/projects/sunshine-kindergarten/`

## Markdown 圖片路徑

在專案頁或相關 Markdown 中引用時，使用絕對路徑：

```
/images/projects/{project-slug}/image-name.jpg
```

範例：

- `/images/projects/sunshine-kindergarten/group-photo.jpg`
- `/images/projects/sunshine-kindergarten/class-2026.jpg`
