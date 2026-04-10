## Why

在 `zola serve` 开发环境下，每次页面导航都会出现自定义字体闪烁（FOUT）：文字先以系统回退字体渲染，字体文件加载完成后再切换为 MapleMono NF CN，造成明显的视觉跳变。根因是 `font-display: swap` + 14 个 TTF 变体声明（每个 20-21MB）+ 无 preload 提示三者叠加。

## What Changes

- **`themes/apollo/sass/fonts.scss`**：删除 MapleMono NF CN 的 12 个未使用字体变体（保留 weight:400 normal 和 weight:700 normal），将 MapleMono 的 `font-display` 从 `swap` 改为 `block`
- **`templates/partials/header.html`**：在 `fonts.css` 的 `<link>` 之前添加两条 `<link rel="preload" as="font">` 指向 `MapleMonoNormal-NF-CN-Regular.ttf` 和 `MapleMonoNormal-NF-CN-Bold.ttf`

## Capabilities

### New Capabilities

- `font-loading`: 控制字体加载行为的策略——减少声明的字体变体数量、通过 preload 提前加载关键字体文件、使用 `font-display: block` 避免可见的字体切换

### Modified Capabilities

（无 spec 层级的需求变更）

## Impact

- `themes/apollo/sass/fonts.scss`：MapleMono NF CN 从 14 个 @font-face 声明缩减至 2 个
- `templates/partials/header.html`：新增 2 条 preload link，不影响现有任何功能
- `public/fonts.css`（构建产物）：随 SASS 编译自动更新
- 不影响 JetBrains Mono、Space Grotesk、Zed Fonts 的现有声明
