## Context

当前博客基于 Zola + Apollo 主题，使用 elasticlunr 作为搜索引擎。elasticlunr 依赖前端 JS 加载完整索引，不支持中文分词，导致中文内容检索失效。代码高亮使用 Zola 内置的 ayu-dark/ayu-light 主题，通过 `highlight_theme = "css"` + `highlight_themes_css` 生成静态 CSS 文件。

关键约束：
- Apollo 主题不可直接修改（子模块），通过 Zola 模板覆盖机制（本地 `templates/` 优先）实现定制
- Pagefind 静态索引（`/pagefind/` 目录）是 `pagefind --site public/` 的构建产物，开发时不存在
- Tokyo-Night 不是 Zola 内置高亮主题，需通过 `extra_syntaxes_and_themes` 加载 `.tmTheme` 文件

## Goals / Non-Goals

**Goals:**
- 用 Pagefind 替换 elasticlunr，支持中文分词搜索
- 保持 Apollo 所有现有 UI 结构和功能完全不变（仅替换搜索 modal 部分）
- 代码块深色使用 tokyonight_storm，亮色使用 tokyonight_day

**Non-Goals:**
- 修改 Apollo 主题本身的任何文件
- 改变博客其他功能（TOC、MathJax、主题切换、社交链接等）
- 修改 Pagefind UI 的默认交互行为

## Decisions

### D1：模板覆盖策略

**决策**：仅覆盖 `templates/partials/header.html` 和 `templates/partials/nav.html`，其余模板不动。

**理由**：Zola 的模板查找顺序是本地 `templates/` 优先于主题 `templates/`。只需覆盖包含搜索逻辑的两个 partial，其他模板（`base.html`、`page.html` 等）继续继承 Apollo 的实现。这样改动最小，对 Apollo 未来升级的影响降到最低。

**替代方案**：覆盖 `base.html` 并修改 block 内容 → 拒绝，因为需要维护整个 base 模板，升级成本高。

### D2：搜索开关 Flag

**决策**：使用 `config.extra.search = true` 作为 Pagefind 开关，而非继续使用 `build_search_index`。

**理由**：`build_search_index` 控制 Zola 的 elasticlunr 索引生成；Pagefind 不需要 Zola 的索引，两者完全独立。用 `extra.search` 可以在模板中独立控制 Pagefind 资源的加载，同时将 `build_search_index` 设为 `false` 避免生成无用的 elasticlunr 索引。

### D3：Pagefind CSS 样式来源

**决策**：新建 `static/pagefind-search.css`，通过 `config.extra.stylesheets` 引入，而非在 `header.html` 中硬编码。

**理由**：Apollo 的 `header.html` 已有 `stylesheets` 循环加载机制，复用更干净。`pagefind-ui.css`（Pagefind 官方基础样式）从 `/pagefind/pagefind-ui.css` 加载（构建产物），`pagefind-search.css`（覆盖样式）从 `static/` 加载。

**替代方案**：全部内嵌到 `header.html` → 拒绝，CSS 应与 HTML 分离。

### D4：Tokyo-Night tmTheme 文件来源

**决策**：从系统路径 `/usr/share/omarchy-nvim/data/lazy/tokyonight.nvim/extras/sublime/` 复制 `.tmTheme` 文件到项目的 `syntax_themes/` 目录，纳入版本控制。

**理由**：系统路径依赖 omarchy-nvim 安装，不可移植。将文件复制到项目中确保构建可复现，不依赖本机环境。

## Risks / Trade-offs

- **[风险] Pagefind 索引在开发时不存在** → 开发时搜索功能报错（`/pagefind/pagefind-ui.js` 404）。缓解：在 `header.html` 中对 Pagefind 脚本加 `onerror` 处理，或接受开发时搜索不可用（生产构建后正常）。
- **[风险] Apollo 主题升级导致 nav.html 覆盖文件过时** → 需要手动 diff 更新本地覆盖文件。缓解：在文件顶部注释标注基于的 Apollo commit。
- **[Trade-off] `build_search_index = false`** → Zola 不再生成 `search_index.en.json`，若未来想切回 elasticlunr 需要重新开启。可接受，因为 Pagefind 更优。

## Migration Plan

1. 修改 `config.toml`（关键开关）
2. 新建本地模板覆盖文件（header.html, nav.html）
3. 新建 `static/search-pagefind.js` 和 `static/pagefind-search.css`
4. 复制 `.tmTheme` 文件到 `syntax_themes/`
5. 执行 `zola build && pagefind --site public/` 验证搜索索引生成
6. 执行 `zola build` 验证代码高亮 CSS 生成正确

**回滚**：删除本地覆盖文件，恢复 `config.toml` 中 `build_search_index = true`、移除 `extra.search`、还原 `highlight_themes_css`。
