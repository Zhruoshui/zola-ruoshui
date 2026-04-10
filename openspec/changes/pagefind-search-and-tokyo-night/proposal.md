## Why

Apollo 主题默认的 elasticlunr 搜索不支持中文分词，导致中文内容无法被有效检索；同时默认代码块配色方案（ayu-dark/ayu-light）与个人偏好不符，需要切换为 Tokyo-Night 系列以获得更好的视觉体验。

## What Changes

- 禁用 Zola 内置的 elasticlunr 搜索索引生成（`build_search_index = false`）
- 新增 `config.extra.search = true` 作为 Pagefind 搜索开关
- 新建 `templates/partials/header.html`（本地覆盖 Apollo 的）：移除 elasticlunr JS，当 `extra.search = true` 时加载 `/pagefind/pagefind-ui.css`、`/pagefind/pagefind-ui.js` 及 `search-pagefind.js`
- 新建 `templates/partials/nav.html`（本地覆盖 Apollo 的）：保留所有现有 nav 内容，将 `#searchModal`（elasticlunr 弹窗）替换为 `#search-container` + `#pagefind-search` 挂载点，触发条件改为 `config.extra.search`
- 新建 `static/search-pagefind.js`：Pagefind UI 初始化与 `#search-button` / `#search-container` 开关逻辑
- 新建 `static/pagefind-search.css`：Pagefind UI 样式，使用 Apollo CSS 变量体系（`--bg-0`, `--bg-1`, `--text-0`, `--text-1`, `--primary-color`）
- 新建 `syntax_themes/` 目录，放入 `tokyonight_storm.tmTheme` 和 `tokyonight_day.tmTheme`（从系统路径 `/usr/share/omarchy-nvim/data/lazy/tokyonight.nvim/extras/sublime/` 复制）
- 修改 `config.toml` `[markdown]` 节：加入 `extra_syntaxes_and_themes = ["syntax_themes"]`，`highlight_themes_css` 改为 `tokyonight_storm → syntax-theme-dark.css`、`tokyonight_day → syntax-theme-light.css`
- `static/syntax-theme-dark.css` 和 `static/syntax-theme-light.css` 由 `zola build` 自动重新生成

## Capabilities

### New Capabilities

- `pagefind-search`：通过 Pagefind 静态索引实现中文分词搜索，替换 Apollo 原有 elasticlunr 搜索
- `tokyo-night-syntax`：代码块高亮主题切换为 Tokyo-Night Storm（深色）/ Tokyo-Night Day（亮色）

### Modified Capabilities

（无既有 spec 需要修改）

## Impact

- **文件变更**：
  - `config.toml`：修改 `build_search_index`、`[markdown]`、`[extra]`
  - 新建 `templates/partials/header.html`（本地覆盖）
  - 新建 `templates/partials/nav.html`（本地覆盖）
  - 新建 `static/search-pagefind.js`
  - 新建 `static/pagefind-search.css`
  - 新建 `syntax_themes/tokyonight_storm.tmTheme`
  - 新建 `syntax_themes/tokyonight_day.tmTheme`
  - 覆盖 `static/syntax-theme-dark.css`（构建时自动生成）
  - 覆盖 `static/syntax-theme-light.css`（构建时自动生成）
- **依赖变化**：构建流程新增步骤 `pagefind --site public/`（在 `zola build` 之后执行）
- **不影响**：Apollo 主题其他所有功能（TOC、MathJax、Mermaid、主题切换、社交链接等）
