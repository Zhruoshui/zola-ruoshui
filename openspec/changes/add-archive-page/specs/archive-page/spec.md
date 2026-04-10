## ADDED Requirements

### Requirement: Archive page renders at /archive
站点 SHALL 在 `/archive` 路径提供归档页面，展示所有 `posts` section 下的文章。

#### Scenario: 访问 /archive
- **WHEN** 用户访问 `/archive`
- **THEN** 页面返回 200，标题显示 "Archive"，内容按年份分组列出所有文章

### Requirement: 文章按年份时间线分组
归档页面 SHALL 将文章按发布年份分组，年份倒序排列（最新年份在上），同年内文章按日期倒序排列。

#### Scenario: 多年份文章展示
- **WHEN** posts section 包含多个不同年份的文章
- **THEN** 页面为每个年份渲染一个分组标题（`<h2>`），其下列出该年所有文章

#### Scenario: 单年份文章展示
- **WHEN** posts section 所有文章均在同一年份
- **THEN** 页面渲染一个年份分组，列出全部文章，无多余标题

### Requirement: 每条记录显示日期和标题链接
每篇文章的归档条目 SHALL 显示月-日（MM-DD 格式）和可点击的文章标题，标题链接指向文章 permalink。

#### Scenario: 文章条目渲染
- **WHEN** 归档页面列出一篇文章
- **THEN** 该条目包含 `<time>` 标签（内容为 MM-DD）和 `<a>` 标签（文本为文章标题，href 为 permalink）

### Requirement: /archive 出现在 nav 导航中
导航栏 SHALL 在 `/tags` 之后、`/projects` 之前显示 `/archive` 链接。

#### Scenario: 导航栏顺序
- **WHEN** 用户查看任意页面的导航栏
- **THEN** 导航链接顺序为 /posts → /tags → /archive → /projects → /talks
