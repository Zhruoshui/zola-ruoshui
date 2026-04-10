## Why

博客缺少按时间线浏览所有文章的入口，用户只能通过 /posts 分页或 /tags 分类访问，无法一览全局。/archive 页面提供按年份聚合的时间线视图，满足回顾历史文章的需求。

## What Changes

- 在 `config.toml` 的 `[extra].menu` 中，于 `/tags`（weight=2）之后插入 `/archive`（weight=3），同时将 `/projects` 和 `/talks` 的 weight 分别调整为 4 和 5
- 新建 `content/archive/_index.md`，声明 `/archive` section 并指定 `template = "archive.html"`
- 新建 `templates/archive.html`，继承 `base.html`，通过 `get_section(path="posts/_index.md")` 获取全部文章，按年份分组渲染时间线，每条记录显示月-日和文章标题链接，CSS 样式内嵌于模板

## Capabilities

### New Capabilities

- `archive-page`: 归档页面，路径 `/archive`，按年份时间线展示 `content/posts/` 下的所有文章

### Modified Capabilities

（无现有 spec 需要变更）

## Impact

- `config.toml`：menu 数组修改
- `content/archive/_index.md`：新增文件
- `templates/archive.html`：新增文件
- 无破坏性变更，不影响现有页面和功能
