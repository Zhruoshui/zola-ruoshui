## Context

博客基于 Zola + Apollo 主题。`zola serve` 开发服务器不设置长期 Cache-Control 头，导致每次页面导航都会重新触发字体请求。`fonts.scss` 对 MapleMono NF CN 声明了 14 个 TTF 变体（每个 20-21MB），全部使用 `font-display: swap`，造成每次导航可见的字体切换（FOUT）。

关键约束：
- Apollo 主题不直接修改（通过本地文件覆盖）；`themes/apollo/sass/fonts.scss` 在此项目中可直接编辑
- `templates/partials/header.html` 已是本地覆盖文件
- 只有 TTF 格式，无 WOFF2
- 只需要 Regular(400) 和 Bold(700) 两个字重

## Goals / Non-Goals

**Goals:**
- 消除页面导航时 MapleMono 字体的可见闪烁
- 减少 `@font-face` 声明数量（14 → 2）
- 通过 preload 提前触发关键字体下载

**Non-Goals:**
- 修改 JetBrains Mono、Space Grotesk、Zed Fonts 的任何设置
- 将 TTF 转换为 WOFF2 格式
- 修改生产环境的 HTTP 缓存头配置

## Decisions

### D1：font-display: block 替代 swap（仅针对 MapleMono）

**决策**：将 MapleMono NF CN 的 `font-display` 从 `swap` 改为 `block`。

**理由**：`swap` 在字体未缓存时必然显示系统回退字体然后切换——这就是用户看到的闪烁。`block` 在字体加载期间保持文字不可见（最长 3s 的 block period），加载完直接显示自定义字体，无视觉切换。在本地 dev 环境（文件系统访问），block period 实际极短（<200ms），对可用性无影响。

**替代方案**：`font-display: optional`——不可见切换，但首次加载可能完全看不到自定义字体；用户明确要求使用自定义字体，故拒绝。

### D2：preload 仅针对 Regular + Bold

**决策**：只在 `header.html` 中 preload `Regular.ttf` 和 `Bold.ttf`，不 preload Italic（未保留）及其他字体。

**理由**：Preload 是高优先级资源提示，过度使用反而与其他关键资源竞争带宽。只有声明且实际使用的 2 个文件值得 preload。

## Risks / Trade-offs

- **[风险] 首次加载文字短暂不可见** → `block` 策略固有行为。本地 dev 字体从文件系统加载极快，生产环境第二次访问起字体已缓存，不可见期仅存在于真正的首次加载。可接受。
- **[风险] Apollo 主题升级覆盖 fonts.scss** → 需要手动重新应用此修改。缓解：在 diff 记录中保留变更说明。
- **[Trade-off] 不转换 WOFF2** → TTF 文件体积保持 20-21MB。用户当前只有 TTF，接受此限制。

## Migration Plan

1. 编辑 `themes/apollo/sass/fonts.scss`：删除 12 个未使用变体，修改 `font-display`
2. 编辑 `templates/partials/header.html`：添加 2 条 preload link
3. 执行 `zola build` 验证 `public/fonts.css` 生成正确
4. 执行 `zola serve` 验证导航时无字体闪烁

**回滚**：还原两个文件的修改，重新执行 `zola build`。
