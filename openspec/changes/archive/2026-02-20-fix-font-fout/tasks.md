## 1. 修改 fonts.scss

- [x] 1.1 删除 MapleMono NF CN 的 12 个未使用 `@font-face` 变体（保留 weight:400 normal 和 weight:700 normal）
- [x] 1.2 将保留的 2 条 MapleMono `@font-face` 声明的 `font-display` 从 `swap` 改为 `block`

## 2. 修改 header.html

- [x] 2.1 在 `fonts.css` 的 `<link>` 之前添加 `MapleMonoNormal-NF-CN-Regular.ttf` 的 preload link
- [x] 2.2 在 `fonts.css` 的 `<link>` 之前添加 `MapleMonoNormal-NF-CN-Bold.ttf` 的 preload link

## 3. 验证

- [x] 3.1 执行 `zola build`，确认 `public/fonts.css` 中 MapleMono NF CN 只有 2 条 `@font-face` 声明且 `font-display: block`
- [ ] 3.2 执行 `zola serve`，在浏览器中导航多个页面，确认无字体闪烁
