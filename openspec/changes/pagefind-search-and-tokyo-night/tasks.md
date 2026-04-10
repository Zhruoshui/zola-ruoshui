## 1. config.toml 修改

- [x] 1.1 将 `build_search_index` 改为 `false`
- [x] 1.2 在 `[extra]` 中添加 `search = true`
- [x] 1.3 在 `[markdown]` 中添加 `extra_syntaxes_and_themes = ["syntax_themes"]`
- [x] 1.4 将 `highlight_themes_css` 改为 `tokyonight_storm → syntax-theme-dark.css`、`tokyonight_day → syntax-theme-light.css`

## 2. Tokyo-Night 主题文件

- [x] 2.1 创建 `syntax_themes/` 目录
- [x] 2.2 从 `/usr/share/omarchy-nvim/data/lazy/tokyonight.nvim/extras/sublime/tokyonight_storm.tmTheme` 复制到 `syntax_themes/tokyonight_storm.tmTheme`
- [x] 2.3 从 `/usr/share/omarchy-nvim/data/lazy/tokyonight.nvim/extras/sublime/tokyonight_day.tmTheme` 复制到 `syntax_themes/tokyonight_day.tmTheme`

## 3. 模板覆盖：header.html

- [x] 3.1 新建 `templates/partials/header.html`，内容基于 `themes/apollo/templates/partials/header.html`
- [x] 3.2 移除 elasticlunr 相关 JS 加载块（`{%- if config.build_search_index -%}` … `{%- endif -%}`）
- [x] 3.3 在 stylesheets 循环之后，添加 Pagefind 资源加载块：当 `config.extra.search` 为 true 时，加载 `/pagefind/pagefind-ui.css`（link）和 `/pagefind/pagefind-ui.js`、`search-pagefind.js`（script defer）

## 4. 模板覆盖：nav.html

- [x] 4.1 新建 `templates/partials/nav.html`，内容基于 `themes/apollo/templates/partials/nav.html`
- [x] 4.2 将搜索触发条件从 `config.build_search_index` 改为 `config.extra.search`
- [x] 4.3 删除 `#searchModal` 整个 div 块
- [x] 4.4 在 `</nav>` 之后、`</div class="right-nav">` 关闭之前，添加 `#search-container` div，内含 `#pagefind-search` 挂载点

## 5. Pagefind JS 逻辑

- [x] 5.1 新建 `static/search-pagefind.js`：初始化 `PagefindUI`（挂载到 `#pagefind-search`），实现 `#search-button` 点击切换 `#search-container` 的 `.active` 状态
- [x] 5.2 添加点击外部关闭逻辑
- [x] 5.3 添加 ESC 键关闭逻辑

## 6. Pagefind CSS 样式

- [x] 6.1 新建 `static/pagefind-search.css`：覆盖 Pagefind UI 默认样式，使用 Apollo CSS 变量（`--bg-0`, `--bg-1`, `--text-0`, `--text-1`, `--primary-color`）
- [x] 6.2 在 `config.toml` `[extra]` 的 `stylesheets` 列表中取消注释或添加 `"pagefind-search.css"`

## 7. 构建验证

- [x] 7.1 执行 `zola build`，确认 `public/syntax-theme-dark.css` 包含 tokyonight_storm 颜色（`#24283b` 背景）
- [x] 7.2 执行 `pagefind --site public/`（需安装 pagefind），确认 `public/pagefind/` 目录生成
- [ ] 7.3 启动本地预览，验证搜索 UI 正常展示（需先完成步骤 7.2）
