+++
title = "omarchy(四)：个人配置与软件推荐"
date = 2026-03-17 
authors = ["ruoshui"]

[taxonomies]
tags=["个人操作系统"]

[extra]
comment = true
repo_view = true
+++

# 中文及本地化支持

{{ ref_card(title="Locale", url="https://wiki.archlinuxcn.org/wiki/Locale", image="https://image.aruoshui.fun/i/2026/04/08/pqes8m-2.webp") }}

{{ note(header="💡 提示", body="这个locale设置取决于个人，omarchy系统还是多语言友好的。
 
已经装好了输入法底座`fcitx5`、`fcitx5-gtk`、`fcitx5-qt` 

字体覆盖也默认安装了`noto-fonts`、`noto-fonts-cjk`、`noto-fonts-emoji`") }}

## 生成区域设置
使用`locale -a`查询区域设置
```shell
C
C.utf8
en_US.utf8
POSIX
```
启用一个区域设置前，需要先生成它。

在 `sudo /etc/locale.gen` 中取消对应的注释，然后执行 `sudo locale-gen`。

注释掉某行，则会移除对应的区域设置。

> `nvim /etc/locale.gen` 输入`/zh_CN`回车 ，查找下一个结果`n`，查找上一个结果`N`

`sudo locale-gen`执行结果：

```shell 
Generating locales...
  en_US.UTF-8... done
  zh_CN.UTF-8... done
Generation complete.
```

## 设置当前区域
生成完 locale 之后，还需要告诉系统“默认用哪个”。

最直接的方式，是写入 `/etc/locale.conf`：

```ini
LANG=zh_CN.UTF-8
LC_MESSAGES=en_US.UTF-8
```
保留控制程序界面的语言和提示信息为en_US帮助排查及分享报错

检查当前生效状态，一下三种方法都可以：

```shell
cat /etc/locale.conf
locale
localectl list-locales | rg 'zh_CN|en_US'
```

# 字体设置

{{ ref_card(title="字体配置", url="https://wiki.archlinux.org.cn/title/Font_configuration
", image="https://image.aruoshui.fun/i/2026/04/08/pqes8m-2.webp") }}

omarchy默认使用`JetbrainsMono Nerd`字体作为终端和系统字体，由`fontconfig`来统一管理

omarchy也有一套自带的字体管理脚本：
- `omarchy-font-set`
- `omarchy-font-list`
- `omarchy-font-current`

要设置系统字体，可以使用快捷键 `Super+ Alt + Space` 选择 `style` 再选择 `font`，会调用脚本`omarchy-font-list`查询系统可用的字体

要安装其他字体，可以使用快捷键 `Super+ Alt + Space` 选择 `install`、`style`、`font`能看到推荐的字体

## omarchy-font-set

`omarchy-font-set` 命令，用来批量切换终端和系统里使用的等宽字体。

```shell
#!/bin/bash

# Set the system-wide monospace font that should be used by the terminal, hyprlock, waybar, swayosd, etc.
# The font name must be one of the ones returned by omarchy-font-list.

font_name="$1"

if [[ -n $font_name ]]; then
  if fc-list | grep -iq "$font_name"; then
    if [[ -f ~/.config/alacritty/alacritty.toml ]]; then
      sed -i "s/family = \".*\"/family = \"$font_name\"/g" ~/.config/alacritty/alacritty.toml
    fi

    if [[ -f ~/.config/kitty/kitty.conf ]]; then
      sed -i "s/^font_family .*/font_family $font_name/g" ~/.config/kitty/kitty.conf
      pkill -USR1 kitty
    fi

    if [[ -f ~/.config/ghostty/config ]]; then
      sed -i "s/font-family = \".*\"/font-family = \"$font_name\"/g" ~/.config/ghostty/config
      pkill -SIGUSR2 ghostty
    fi

    sed -i "s/font_family = .*/font_family = $font_name/g" ~/.config/hypr/hyprlock.conf
    sed -i "s/font-family: .*/font-family: '$font_name';/g" ~/.config/waybar/style.css
    sed -i "s/font-family: .*/font-family: '$font_name';/g" ~/.config/swayosd/style.css
    xmlstarlet ed -L \
      -u '//match[@target="pattern"][test/string="monospace"]/edit[@name="family"]/string' \
      -v "$font_name" \
      ~/.config/fontconfig/fonts.conf

    omarchy-restart-waybar
    omarchy-restart-swayosd

    if pgrep -x ghostty; then
      notify-send -u low "    You must restart Ghostty to see font change"
    fi

    omarchy-hook font-set "$font_name"
  else
    echo "Font '$font_name' not found."
    exit 1
  fi
else
  echo "Usage: omarchy-font-set <font-name>"
fi
```

1. 先接收一个字体名，例如 `omarchy-font-set "JetBrainsMono Nerd Font"`。
2. 用 `fc-list` 检查系统里是否真的安装了这个字体。
3. 如果字体存在，就批量修改几处配置文件中的字体字段，包括：
   - `~/.config/alacritty/alacritty.toml`
   - `~/.config/kitty/kitty.conf`
   - `~/.config/ghostty/config`
   - `~/.config/hypr/hyprlock.conf`
   - `~/.config/waybar/style.css`
   - `~/.config/swayosd/style.css`
   - `~/.config/fontconfig/fonts.conf`
4. 修改完以后，脚本会重启 Waybar 和 SwayOSD，并给 Kitty、Ghostty 发送重载信号。
5. 最后再触发一次 `font-set` hook，方便用户在切换字体后执行自己的额外动作。

## omarchy-font-current

`omarchy-font-current` 用来查询 Omarchy 当前认定的“正在使用的字体”。

```shell
#!/bin/bash

# Returns the name of the current monospace font being used by extracting it from the Waybar stylesheet.
# This can be changed using omarchy-font-set.

grep -oP 'font-family:\s*["'\'']?\K[^;"'\'']+' ~/.config/waybar/style.css | head -n1
```

它的判断方式其实比较朴素：直接去读取 `~/.config/waybar/style.css` 里的第一条 `font-family`。因此如果你手动改了 Kitty、Alacritty、Ghostty 和 Hyprlock，却没有同步改 Waybar，那么 Omarchy 仍然会认为“当前字体”还是 Waybar 里那一个。

## omarchy-font-list

`omarchy-font-list` 用来列出系统里可供 `omarchy-font-set` 选择的等宽字体。

```shell
#!/bin/bash

# Returns a list of all the monospace fonts available on the system that can be set using omarchy-font-set.

fc-list :spacing=100 -f "%{family[0]}\n" | grep -v -i -E 'emoji|signwriting|omarchy' | sort -u
```

实现方式是通过 `fc-list :spacing=100` 筛出等宽字体，再过滤掉 emoji、signwriting 和 omarchy 自己使用的特殊字体。


## 个人字体分享
其实用惯了JetBrainsMono系列的字体已经习惯了，可以老是觉得中文字体跟他格格不入，于是找到了`MapleMono`这套字体

{{ ref_card(title="MapleMono介绍", url="https://font.subf.dev/zh-cn/", image="https://github.com/subframe7536/maple-font/raw/variable/resources/header.png") }}

**该字体的特色是字形整洁、拥有手写风格的斜体、细粒度配置、内置 Nerd-Font、中英文 2:1 等宽**

![MapleMono](https://font.subf.dev/_astro/2-1.NNPHLjR9_zMfaB.webp)

### MapleMono字体下载
字体下载请前往：[MapleMono字体下载](https://font.subf.dev/zh-cn/download/)

我个人是使用`yay -S maplemono-nf-cn-unhinted`下载的 

下载完成后执行`fc-list ':' file | grep Map`检查，能看到安装的位置：

```shell
/usr/share/fonts/MapleMono-NF-CN-unhinted/MapleMono-NF-CN-ThinItalic.ttf:  # 
/usr/share/fonts/MapleMono-NF-CN-unhinted/MapleMono-NF-CN-ExtraBoldItalic.ttf:
/usr/share/fonts/MapleMono-NF-CN-unhinted/MapleMono-NF-CN-LightItalic.ttf:
/usr/share/fonts/MapleMono-NF-CN-unhinted/MapleMono-NF-CN-Italic.ttf:
/usr/share/fonts/MapleMono-NF-CN-unhinted/MapleMono-NF-CN-ExtraBold.ttf:
/usr/share/fonts/MapleMono-NF-CN-unhinted/MapleMono-NF-CN-SemiBoldItalic.ttf:
/usr/share/fonts/MapleMono-NF-CN-unhinted/MapleMono-NF-CN-Light.ttf:
/usr/share/fonts/MapleMono-NF-CN-unhinted/MapleMono-NF-CN-SemiBold.ttf:
/usr/share/fonts/MapleMono-NF-CN-unhinted/MapleMono-NF-CN-Bold.ttf:
/usr/share/fonts/MapleMono-NF-CN-unhinted/MapleMono-NF-CN-Thin.ttf:
/usr/share/fonts/MapleMono-NF-CN-unhinted/MapleMono-NF-CN-MediumItalic.ttf:
/usr/share/fonts/MapleMono-NF-CN-unhinted/MapleMono-NF-CN-Regular.ttf:
/usr/share/fonts/MapleMono-NF-CN-unhinted/MapleMono-NF-CN-Medium.ttf:
/usr/share/fonts/MapleMono-NF-CN-unhinted/MapleMono-NF-CN-ExtraLightItalic.ttf:
/usr/share/fonts/MapleMono-NF-CN-unhinted/MapleMono-NF-CN-BoldItalic.ttf:
/usr/share/fonts/MapleMono-NF-CN-unhinted/MapleMono-NF-CN-ExtraLight.ttf:
```

`MapleMono` 是字体家族本体，`NF` 表示补上了 Nerd Font 图标，`CN` 表示包含中文字形，`unhinted` 则是无 hinting 版本，通常在高分屏上观感更自然。

后面的文件名表示的是同一套字体的不同字重和斜体样式：

- `Thin`：极细
- `ExtraLight`：特细
- `Light`：细体
- `Regular`：常规
- `Medium`：中等偏粗
- `SemiBold`：半粗
- `Bold`：粗体
- `ExtraBold`：特粗
- `Italic`：斜体

组合起来就很好理解了，例如：

- `MapleMono-NF-CN-Regular.ttf`：常规字重，正常体
- `MapleMono-NF-CN-Italic.ttf`：常规字重，斜体
- `MapleMono-NF-CN-Medium.ttf`：中等偏粗，正常体
- `MapleMono-NF-CN-MediumItalic.ttf`：中等偏粗，斜体
- `MapleMono-NF-CN-Bold.ttf`：粗体，正常体
- `MapleMono-NF-CN-BoldItalic.ttf`：粗体，斜体


### MapleMono字体安装
前边提到了使用系统快捷键来进行字体安装，`Maple`这个系列的字体`spacing=90`不在`omarchy-font-list`查询列表中。

这个不影响使用，只是omarchy默认推荐标准`monospace`

要手动安装的话，执行：`omarchy-font-set "MapleMono NF CN"`即可（这里我使用的是regular字形，其他字形可以自己修改，比如`Medium`字形使用`omarchy-font-set "MapleMono NF CN Medium"`）

# 输入法

{{ ref_card(title="输入法", url="https://wiki.archlinuxcn.org/wiki/%E8%BE%93%E5%85%A5%E6%B3%95
", image="https://image.aruoshui.fun/i/2026/04/08/pqes8m-2.webp") }}

Omarchy 默认安装了 `fcitx5`、`fcitx5-gtk`、`fcitx5-qt` 作为输入法底座，并且会在 Hyprland 会话启动时自动拉起 `fcitx5`。

## 雾凇拼音
我当前实际使用的中文输入方案是：

```text
fcitx5 + fcitx5-rime + 雾凇拼音（rime_ice）
```
你需要从omarchy仓库安装`fcitx5-rime`，然后从AUR仓库安装`rime-ice-git`雾凇拼音，然后启用雾凇拼音的预设：

编辑`~/.local/share/fcitx5/rime/default.custom.yaml`，写入预设：

```yaml
patch:
  __include: rime_ice_suggestion:/
```

更多的设置可以去[rime-ice](https://github.com/iDvel/rime-ice)github库，以及安装词库等。输入法配置工具推荐使用图形工具`fcitx5-configtool`来完成（同样omarchy仓库安装），直观方便。配置完成需要重启fcitx5，你可以点击右上角键盘图标来重启

更多的`rime`主题可以参考[rime-skin](https://github.com/puddinging/rime-skin)，`rime`的配置方法可以参考[rime官网](https://rime.im/)，补充博客：[Rime输入法配置方案](https://xishansnow.github.io/posts/41ac964d)

> 补充：需要rime配置管理的可以下载[东风破](https://github.com/rime/plum)

## 薄荷拼音
是叫作 `oh-my-rime` 的输入法，快速初始化rime
参考： 
1. [文档](https://www.mintimate.cc/zh/guide/)
2. [仓库地址](https://cnb.cool/Mintimate/rime/oh-my-rime)
3. [fcitx5-mint的主题](https://github.com/witt-bit/fcitx5-theme-mint)

# 双系统启动
如果你安装了双系统，我这里以`window + omarchy`为例子

omarchy使用limine来做系统引导管理，在BIOS中设置`limine`优先启动，进入omarchy后

使用`sudo limine-list`能看到limine菜单

```shell
Omarchy
├─ linux
└─ Snapshots
   ├─ 2026-04-06 18:29:23
   ├─ 2026-04-06 18:27:33
   ├─ 2026-04-06 18:21:57
   ├─ 2026-04-06 18:21:06
   └─ 2026-04-06 15:17:02
EFI fallback
```

使用`sudo limine-scan`可以扫描到windows的EFI分区，按照引导设置即可，后续启动windows在limine启动菜单中选择即可
```shell
Available EFI Boot Entries:
#  | Name                 | GPT UUID                             | EFI Path                        
---|----------------------|--------------------------------------|---------------------------------
1  | Windows Boot Manager | 66413065-901b-43da-a8b0-111c6c736e48 | /EFI/Microsoft/Boot/bootmgfw.efi
2  | Limine               | 667fbe2f-334a-4cab-b328-ea10d06a14ad | /EFI/limine/limine_x64.efi      

 Use ↑/↓ to select a boot entry (1-2), or type [c]ancel to abort.

Your input: 
```


# omarchy配置修改

{{ ref_card(title="dotfile", url="https://learn.omacom.io/2/the-omarchy-manual/65/dotfiles", image="https://image.aruoshui.fun/i/2026/03/10/p4nmk8-2.webp") }}

{{ note(header="💡 注意", body="
Omarchy主要通过位于`~/.config`中的配置文件进行设置。

位于~/.local/share/omarchy中的文件属于Omarchy本身，考虑到系统升级，不建议直接修改该文件的配置

如果需要更改~/.local/share/omarchy中的任何内容，应改为在~/.config中覆盖相应值。

") }}

`~/.config`中关键文件及内容：

| 文件路径 | 目的与说明 |
| :--- | :--- |
| `~/.config/hypr/hyprland.conf` | 控制快捷键、默认应用以及 Hyprland 的所有内容。了解更多关于 Hyprland 配置的信息。 |
| `~/.config/hypr/monitors.conf` | 控制显示器、分辨率和位置。 |
| `~/.config/hypr/hypridle.conf` | 控制您的待机/睡眠设置。通常无需更改。 |
| `~/.config/hypr/hyprlock.conf` | 控制您的锁屏界面，但它是通过符号链接链接到您的主题来进行样式设置的。 |
| `~/.config/waybar/config.jsonc` | 控制与 Waybar 一起运行的顶部栏。了解更多关于 Waybar 配置的信息。 |
| `~/.config/waybar/style.css` | 控制顶部栏设计，但它与您的主题有符号链接。 |
| `~/.config/walker/config.toml` | 控制与 Walker 一起运行的启动器。 |
| `~/.config/alacritty/alacritty.toml` | 控制您的终端。 |
| `~/.config/uwsm/default` | 控制您的默认编辑器。更改后需要重新启动 Hyprland。 |
| `~/.XCompose` | 设置快捷表情符号和姓名/邮箱自动补全选项。更改后请务必运行 `omarchy-restart-xcompose`。 |

## 备份配置方案

备份常规使用CP、git也能做管理，但是维护成本还是很高的，有更好的方案：

使用GNU Stow：

参考：[使用 GNU Stow 管理 Linux 系统中的文件与配置：从入门到精通](https://geek-blogs.com/blog/stow-linux-nixcraft-com/)

首先需要安装`stow`，`sudo pacman -Sy stow`安装或者使用omarchy菜单安装

### Stow 的工作原理
Stow 本质上是一个**符号链接管理器**（symlink farm manager）。它不会把配置文件直接复制到 `~/.config`、`~/.bashrc` 这些位置，而是把真实文件统一收纳到一个目录里，再由 `stow` 批量创建符号链接。

这样做的好处是：
- 配置文件只有一份真实副本，修改和备份都更集中
- 可以按软件拆分成不同“包”
- 非常适合配合 Git 做版本管理和跨设备同步

## 显示器配置

{{ ref_card(title="monitor", url="https://learn.omacom.io/2/the-omarchy-manual/86/monitors", image="https://image.aruoshui.fun/i/2026/03/10/p4nmk8-2.webp") }}

如果你熟悉hyprland，可以直接编辑配置文件`~/.config/hypr/monitors.conf`

如果不太熟悉的话，推荐安装`sudo pacman -Sy nwg-displays` 这个GUI配置工具，能很方便的帮助你配置多显示器等

## 键盘鼠标触控板
该部分所有设置都在`~/.config/hypr/input.conf` 中完成，也可以通过 Omarchy 菜单里的“设置 > 输入”（Super + Alt + Space）进入。

默认配置如下：
参数修改需要参考：[hyprland input](https://wiki.hypr.land/Configuring/Variables/#input)

```conf
# Control your input devices
# See https://wiki.hypr.land/Configuring/Variables/#input
input {
  # Use multiple keyboard layouts and switch between them with Left Alt + Right Alt
  # kb_layout = us,dk,eu

  # Use a specific keyboard variant if needed (e.g. intl for international keyboards)
  # kb_variant = intl

  kb_layout = us
  kb_options = compose:caps # ,grp:alts_toggle

  # Change speed of keyboard repeat
  repeat_rate = 40
  repeat_delay = 600

  # Start with numlock on by default
  numlock_by_default = true

  # Increase sensitivity for mouse/trackpad (default: 0)
  # sensitivity = 0.35
  
  # Turn off mouse acceleration (default: false)
  # force_no_accel = true

  touchpad {
    # Use natural (inverse) scrolling
    # natural_scroll = true

    # Use two-finger clicks for right-click instead of lower-right corner
    # clickfinger_behavior = true

    # Control the speed of your scrolling
    scroll_factor = 0.4

    # Enable the touchpad while typing
    # disable_while_typing = false

    # Left-click-and-drag with three fingers
    # drag_3fg = 1
  }
}

# Scroll nicely in the terminal
windowrule = match:class (Alacritty|kitty), scroll_touchpad 1.5
windowrule = match:class com.mitchellh.ghostty, scroll_touchpad 0.2

# Enable touchpad gestures for changing workspaces
# See https://wiki.hyprland.org/Configuring/Gestures/
# gesture = 3, horizontal, workspace
```
看配置的注释结合hyprland即可

omarchy的默认配置我认为已经完美，而且针对终端的触摸板滚动做了优化。我这里只修改了触摸板的滚动方式，更喜欢自然滚动，取消`natural_scroll = true`的注释即可

## 终端美化
我终端最终使用的是`ghostty`，结合omarchy已经预装的`starship`

`ghosstty`的安装直接使用omarchy的 install > Terminal 来安装

`starship`已经预装了，其实omarchy有一个默认的配置：
![starship_omarchy](https://learn.omacom.io/u/omarchy-prompt-J4UHpS.png)

你也可以自己来配置starship，参考[starship文档](https://starship.rs/zh-CN/config/)

或者直接安装预设方案即可，我是安装的[Catppuccin Powerline Preset](https://starship.rs/zh-CN/presets/catppuccin-powerline)预设方案

## waybar美化
omarchy有一些个人分享的waybar配置方案：
https://github.com/HANCORE-linux/waybar-themes?tab=readme-ov-file#screenshots-v2a
里边有安装方式，有些配置需要安装`yay -S wttrbar`这个天气应用，同时编辑`config.jsonc`配置，wttrbar的location及语言等请参考[wttrbar](https://github.com/bjesus/wttrbar)的readme

## 启动logo及屏幕保护文字
参考：https://czyt.tech/post/omarchy-usage-notes/
这两个都是omarchy极具特色的小功能，根据参考配置即可

# 软件推荐
## 卸载预装软件
卸载软件可用使用https://github.com/maxart/omarchy-cleaner脚本进行

首先卸载webapp，可以使用系统自带的 remove > Webapp

然后卸载安装的GUI应用

## 个人安装的软件
1. QQ `yay -S linuxqq`
2. wechat `yay -S wechat-bin`
3. 飞书 `yay -S feishu`
4. 拓竹bambustudio `yay -S bambustudio-appimage`
5. 立创EDA专业版 `yay -S lceda-pro`
6. 邮箱thunderbird `pacman -S thunderbird-i18n-zh-cn`
7. 百度网盘 `yay -S baidunetdisk-bin`
8. 文献阅读器zotero `yay -S zotero-bin`
9. 跨平台ssh工具 `yay -S termius`


