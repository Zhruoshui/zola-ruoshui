## Context

Zola 静态博客，使用 Apollo 主题，项目级 `templates/` 可覆盖主题模板。Nav 菜单由 `config.toml [extra].menu` 数组驱动，权重决定顺序。`content/posts/` 为主文章 section，`sort_by = "date"`，`paginate_by = 10`。

## Goals / Non-Goals

**Goals:**
- 在 `/archive` 路由提供按年份分组的文章时间线
- nav 中 `/tags` 后新增 `/archive` 入口

**Non-Goals:**
- 不支持分页（归档页展示全部文章）
- 不引入新的外部依赖或构建工具

## Decisions

**D1：使用独立 section 而非 page**
`content/archive/_index.md` 声明 section，指定 `template = "archive.html"`。这与项目中 `projects`、`talks` 的实现方式一致，路由自动为 `/archive`。

**D2：模板内用 `get_section()` 跨 section 读取文章**
`get_section(path="posts/_index.md")` 在模板中返回完整 `.pages` 列表（不受 paginator 限制），无需修改 posts section 配置。备选方案（section_path extra）更复杂，不采用。

**D3：年份分组通过 Tera loop 比对实现**
Tera 无原生 `group_by` 对 DateTime 生效，采用 `loop.first` 和与前一项年份比对的方式输出年份标题。无需额外过滤器插件。

**D4：CSS 内嵌于模板**
归档页样式仅限本页，内嵌 `<style>` 块避免影响其他页面，且无需修改 `config.toml stylesheets` 或新建静态文件。

## Risks / Trade-offs

- [风险] `get_section()` 若 posts section 路径变更则模板失效 → 路径 `posts/_index.md` 为项目约定，稳定
- [取舍] CSS 内嵌不可复用 → 归档页样式简单，无复用必要
