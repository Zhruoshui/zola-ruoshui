## 1. 配置修改

- [x] 1.1 修改 `config.toml`：在 menu 数组中 `/tags`（weight=2）后插入 `{ name = "/archive", url = "/archive", weight = 3 }`，并将 `/projects` weight 改为 4，`/talks` weight 改为 5

## 2. 内容 Section

- [x] 2.1 新建 `content/archive/_index.md`：设置 `title = "Archive"`，`template = "archive.html"`

## 3. 模板实现

- [x] 3.1 新建 `templates/archive.html`：继承 `base.html`，通过 `get_section(path="posts/_index.md")` 获取全部文章，按年份分组渲染时间线（年份倒序，同年按日期倒序），每条记录含 `<time>`（MM-DD）和文章标题链接，内嵌必要 CSS 样式
