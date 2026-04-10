### Requirement: Only used font variants are declared
`fonts.scss` 中 MapleMono NF CN 的 `@font-face` 声明 SHALL 仅包含实际使用的字重：Regular（weight:400，normal）和 Bold（weight:700，normal）。其余 12 个变体（weight 100/200/300/500/600/800，以及所有 italic）MUST 被移除。

#### Scenario: Unused variants removed
- **WHEN** 构建产物 `public/fonts.css` 生成后
- **THEN** 其中 MapleMono NF CN 的 `@font-face` 声明数量为 2（400 normal + 700 normal）

### Requirement: MapleMono uses font-display swap
MapleMono NF CN 的所有 `@font-face` 声明 SHALL 使用 `font-display: swap`。
（背景：字体文件 ~20MB/个，云服务器首次加载期间 `block` 导致内容完全不可见，`swap` 允许系统字体立即显示内容，用户体验更佳。）

#### Scenario: font-display is swap
- **WHEN** `public/fonts.css` 中 MapleMono NF CN 的 `@font-face` 被解析
- **THEN** 每条声明的 `font-display` 值为 `swap`

### Requirement: Critical fonts are preloaded
`templates/partials/header.html` SHALL 在加载 `fonts.css` 的 `<link>` 之前，声明对 `MapleMonoNormal-NF-CN-Regular.ttf` 和 `MapleMonoNormal-NF-CN-Bold.ttf` 的 `<link rel="preload" as="font" type="font/ttf" crossorigin>`。

#### Scenario: Preload links precede fonts.css link
- **WHEN** 任意页面的 `<head>` 被解析
- **THEN** 两条 preload link 出现在 `fonts.css` stylesheet link 之前
