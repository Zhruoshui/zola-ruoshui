## ADDED Requirements

### Requirement: Pagefind 搜索替换 elasticlunr
站点 SHALL 使用 Pagefind 静态索引替代 Zola 内置的 elasticlunr 搜索，以支持中文分词检索。
当 `config.extra.search = true` 时，系统 SHALL 在所有页面 `<head>` 中加载 `/pagefind/pagefind-ui.css`、`/pagefind/pagefind-ui.js` 和 `search-pagefind.js`。
系统 SHALL 不再加载 `searchElasticlunr.min.js`。

#### Scenario: 搜索资源加载
- **WHEN** `config.extra.search = true` 且页面加载
- **THEN** `<head>` 中存在 `/pagefind/pagefind-ui.css` 的 `<link>` 标签
- **THEN** `<head>` 中存在 `/pagefind/pagefind-ui.js` 的 `<script>` 标签

#### Scenario: elasticlunr 不再加载
- **WHEN** `config.extra.search = true`
- **THEN** 页面中不存在 `searchElasticlunr.min.js` 的 `<script>` 标签

### Requirement: Pagefind UI 挂载点
Apollo nav 中 SHALL 保留原有 `#search-button` 按钮，点击后 SHALL 展示/隐藏 `#search-container`（内含 `#pagefind-search` 挂载点）。
原有的 `#searchModal`（elasticlunr 弹窗）SHALL 被移除。
`#search-button` 的 HTML 结构和 CSS class SHALL 与 Apollo 原版完全一致。

#### Scenario: 搜索按钮触发 Pagefind 容器
- **WHEN** 用户点击 `#search-button`
- **THEN** `#search-container` 切换 `.active` 状态（显示/隐藏）
- **THEN** Pagefind UI 已挂载到 `#pagefind-search` 元素上

#### Scenario: 点击外部关闭
- **WHEN** `#search-container` 处于 `.active` 状态且用户点击容器外部
- **THEN** `#search-container` 移除 `.active` 状态

#### Scenario: ESC 键关闭
- **WHEN** `#search-container` 处于 `.active` 状态且用户按 `Escape`
- **THEN** `#search-container` 移除 `.active` 状态

### Requirement: nav 结构完整性
覆盖的 `templates/partials/nav.html` SHALL 保留 Apollo 原有的所有其他内容，包括：Logo/站名链接、社交链接、菜单项、主题切换按钮。

#### Scenario: 非搜索 nav 元素不受影响
- **WHEN** 页面加载
- **THEN** Apollo 主题的 Logo、社交链接、菜单、主题切换按钮均正常渲染
