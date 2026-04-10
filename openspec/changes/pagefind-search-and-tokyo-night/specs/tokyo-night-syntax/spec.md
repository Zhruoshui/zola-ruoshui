## ADDED Requirements

### Requirement: Tokyo-Night 代码高亮主题
站点代码块 SHALL 在深色模式下使用 `tokyonight_storm` 配色，在亮色模式下使用 `tokyonight_day` 配色。
`syntax_themes/` 目录 SHALL 包含 `tokyonight_storm.tmTheme` 和 `tokyonight_day.tmTheme`，纳入版本控制。
`config.toml` 的 `[markdown]` 节 SHALL 包含 `extra_syntaxes_and_themes = ["syntax_themes"]`。

#### Scenario: 深色模式代码块颜色
- **WHEN** 系统/用户主题为深色且页面含代码块
- **THEN** `syntax-theme-dark.css` 中 `.z-code` 的背景色为 tokyonight_storm 的深色背景（`#24283b`）
- **THEN** 代码关键字、字符串、注释颜色均来自 tokyonight_storm 调色板

#### Scenario: 亮色模式代码块颜色
- **WHEN** 系统/用户主题为亮色且页面含代码块
- **THEN** `syntax-theme-light.css` 中 `.z-code` 的背景色为 tokyonight_day 的亮色背景（`#e1e2e7`）
- **THEN** 代码关键字、字符串、注释颜色均来自 tokyonight_day 调色板

### Requirement: 主题文件可移植性
项目 SHALL 在 `syntax_themes/` 目录中内置 `.tmTheme` 文件，不依赖系统路径。
`zola build` SHALL 能够在任何安装了 Zola 的环境中自动生成对应的 CSS 文件，无需额外依赖。

#### Scenario: 独立构建
- **WHEN** 在没有 omarchy-nvim 的环境中执行 `zola build`
- **THEN** 构建成功，`public/syntax-theme-dark.css` 和 `public/syntax-theme-light.css` 正确生成
