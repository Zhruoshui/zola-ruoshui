+++
title = "omarchy(二)：安装和使用"
date = 2026-03-10 
authors = ["ruoshui"]
description = "带你走进omarchy操作系统"

[taxonomies]
tags=["个人操作系统"]

[extra]
comment = true
repo_view = true
+++
# 接触omarchy
我学习linux是想做一个系统工程师。但现在我对Arch Linux的认知，还停留在“会配置”，其实说到底更像是一个“高级用户”。  

这跟我的初心有所偏差，所以我决定：
1. 拆解一个好系统
2. 将学习精力从`配置基础桌面、美化`转移到`构建高可用性和系统韧性`上
3. 学习其最佳实践，融入自己的个人使用

![思想抽象](https://image.aruoshui.fun/i/2026/03/10/pi72qx-2.webp)

## 寻找

{{ ref_card(title="Linux 发行版（Distro）资讯站和数据库", url="https://distrowatch.com/", image="https://image.aruoshui.fun/i/2026/03/10/ig3in3-2.webp") }}

它是全球最大的 Linux 发行版（Distro）资讯站和数据库，相当于 Linux 界的“维基百科 + 告示牌排行榜”。(这个榜单可能有部分争议) 

其中有一个H.P.D（每日点击次数）的统计榜单，总能发现CachyOS和Mint名列前茅。

<!-- ...existing code... -->
<details>
    <summary>CachyOS</summary>

[**CachyOS是基于Arch Linux的Linux发行。**](https://distrowatch.com/table.php?distribution=cachyos)

它专注于速度和安全改进：缺省的Linux内核使用BORE（Burst-Oriented Response Enhancer）调度器进行了深度优化，而桌面软件包使用了LTO和x86-64-v3优化项、安全标记、性能提升项进行编译。 

可用的桌面环境及窗口管理器包括KDE Plasma、GNOME、Xfce、i3、bspwm、LXQt、Openbox、Wayfire、Cutefish。CachyOS还带有图形化及命令行的安装程序，提供基于Firefox的名为Cachy-Browser的浏览器，浏览器做了安装增强和性能优化。

![CachyOS](https://image.aruoshui.fun/i/2026/03/10/ily1s9-2.webp)

</details>

<details>
    <summary>Mint</summary>

[**Linux Mint是一份基于Ubuntu的发行版**](https://distrowatch.com/table.php?distribution=mint)

其目标是提供一份更完整意义上的即刻可用的体验，而这通过包含浏览器插件、多媒体编码解码器、DVD播放支持、Java及其他组件来实现。  

它也增加了一套定制桌面及各种菜单，一些独特的配置工具，以及一份基于web的软件包安装界面。Linux Mint兼容Ubuntu软件仓库。

![Mint](https://image.aruoshui.fun/i/2026/03/10/ip29o2-2.webp)

</details>
<!-- ...existing code... -->

两个发行版都很棒，一个注重高性能兼容性，一个注重临门槛和易用，但在我看来，都还是差点意思。

就在这时，我看到了Omarchy。  

![Omarchy](https://image.aruoshui.fun/i/2026/03/10/ozryqq-2.webp) 


准确来说，他不像一个发行版，而向一种极具个人特色的Arch+Hyperland配置方案，内置了现代软件开发者所需的一切工具，以 TUI 为主、注重主题、使用平铺窗口管理的系统美感，同时最重要的是：大量使用终端命令，新奇的平铺式桌面，这让我非常感兴趣。

用omarchy也快半年了，很推荐大家安装作为开发系统，而且用惯了AI，很容易发现Linux在AI使用中体验远远比Windows、或者使用WSL好
![omarchy](https://image.aruoshui.fun/i/2026/03/23/fnkhmx-2.webp)

# Omarchy
Omarchy提供了一个详细描述系统使用的手册： 

{{ ref_card(title="omarchy Manual", url="https://learn.omacom.io/2/the-omarchy-manual#leaf_91", image="https://image.aruoshui.fun/i/2026/03/10/p4nmk8-2.webp") }}

{{ note(header="💡 提示", body="请你以官方手册为主，") }}

下面我从系统安装为你讲述：

## 系统安装

Omarchy 提供两种安装方式：**ISO 安装**（推荐）和**手动安装**。

### 安装前准备

无论哪种方式，以下前置条件必须满足：

- **关闭 Secure Boot 和 TPM**：进入 BIOS 关闭这两项。它们是微软为 Windows 及其合作发行版设计的安全机制，会阻止 Omarchy 的安装。
- **使用有线或 2.4GHz 键盘**：全盘加密（LUKS）在启动时需要输入解密密码，此阶段蓝牙协议栈尚未加载，蓝牙键盘无法使用。必须用有线键盘或带 2.4GHz dongle 的无线键盘。
- **专用磁盘**：Omarchy 默认设计为独占一块磁盘。如需双系统，要么使用两块物理磁盘，要么走手动安装路线。


### ISO 安装（推荐）
{{ note(header="⚠️ 数据警告", body="由于采取磁盘加密技术，安装将**不可逆地擦除**目标磁盘上的全部数据。请务必在操作前完成完整备份，确认选择了正确的磁盘。") }}

{{ ref_card(title="Getting Started", url="https://learn.omacom.io/2/the-omarchy-manual/50/getting-started", image="https://image.aruoshui.fun/i/2026/03/10/p4nmk8-2.webp") }}

最简单的路径：

1. 从 [omarchy.org](https://omarchy.org/) 下载 ISO
2. 将 ISO 写入 U 盘（Mac/Windows 用 [balenaEtcher](https://etcher.balena.io/)，Linux 用 [caligula](https://github.com/ifd3f/caligula)）
3. U 盘启动，回答配置问题（用户名、密码、时区等），确认后选择目标磁盘
4. 等待 2–10 分钟（取决于机器性能），安装自动完成

整个过程是向导式的（wizard），不需要你手动分区或选择文件系统——ISO 已经预设了 btrfs + LUKS 全盘加密的最佳实践方案。  

相信你能翻到我的文章，这部分必然没有问题。

![配置确认](https://image.aruoshui.fun/i/2026/03/10/qgx11v-2.webp)

然后就到分配磁盘空间这块。**注意一定要确定选择好对应的硬盘，尤其双系统要注意，不要选成windows的系统盘或者数据盘**

{{ note(header="⚠️ 数据警告", body="选择磁盘会进行格式化操作，我推荐使用一块空盘或者空闲硬盘") }}
 
选择好后，剩下的安装过程全程自动化

![安装完成](https://image.aruoshui.fun/i/2026/03/10/qjqagg-2.webp) 

### 手动安装

{{ ref_card(title="Manual Installation", url="https://learn.omacom.io/2/the-omarchy-manual/96/manual-installation", image="https://image.aruoshui.fun/i/2026/03/10/p4nmk8-2.webp") }}

适用于 ISO 无法覆盖的场景（如在 [Asahi Linux](https://asahi-alarm.org/) 上安装、单磁盘双系统等）。 

可以参考这位大佬的archlinux手动安装视频：[手动定位到16分50秒](https://www.bilibili.com/video/BV19DBqB4EY4/?share_source=copy_web&vd_source=8e98251de20e8e78de3196f9a8473f8a&t=1010)
<iframe src="//player.bilibili.com/player.html?isOutside=true&aid=115786966372305&bvid=BV19DBqB4EY4&cid=35002779718&p=1" width="100%" height="520" style="max-width: 100%; aspect-ratio: 16 / 9; border: 0;" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe> 

手动安装流程分两阶段：

**阶段一：通过原版 Arch ISO + archinstall 安装基础系统**

1. 下载 [Arch Linux ISO](https://archlinux.org/download/#http-downloads)，写入 U 盘并启动
2. 如果用 Wi-Fi，先运行 `iwctl` 连接网络：
   ```bash
   station wlan0 scan
   station wlan0 connect <SSID>
   ```
3. 运行 `archinstall`，关键选项如下：

| 选项 | 设置 |
|---|---|
| Mirrors | 选择你所在的国家/地区 |
| Disk configuration | Default partitioning layout → 选择磁盘 |
| File system | btrfs（默认结构 + 启用压缩） |
| Disk encryption | LUKS + 设置密码 + 应用到分区 |
| Hostname | 自定义主机名 |
| Bootloader | Limine |
| Root password | 设置 root 密码 |
| User account | 添加用户（Superuser: Yes） |
| Audio | pipewire |
| Network | Copy ISO network config |
| Timezone | 设置时区 |



**阶段二：安装 Omarchy**

Arch 基础系统安装完成后重启，用刚创建的用户登录，执行：

```bash
curl -fsSL https://omarchy.org/install | bash
```

脚本会依次要求 sudo 权限、你的姓名和邮箱（用于预配置 `git config` 和 CapsLock 快捷展开）。之后全自动运行 5–30 分钟，完成后提示重启。


### 完成第一步！
至此：我相信你已经能进入这个简洁的桌面了：

![桌面](https://image.aruoshui.fun/i/2026/03/16/nvzucs-2.webp)

下面详细介绍一下这个系统是怎么使用的： 
主要分为以下篇章：
1. omarchy系统安全
2. omarchy系统登录
3. omarchy系统导航
4. omarchy系统更新及软件包
5. omarchy系统更多的快捷键
6. omarchy系统主题
7. 探索omarchy的应用


## 系统安全


{{ ref_card(title="Security", url="https://learn.omacom.io/2/the-omarchy-manual/93/security", image="https://image.aruoshui.fun/i/2026/03/10/p4nmk8-2.webp") }}

**对一个系统来说，安全是第一要素。** Omarchy 的安全模型围绕一个核心前提展开：**笔记本丢了不会变成安全事故。**

### 全盘加密（LUKS）

Omarchy 安装时默认启用 [LUKS](https://en.wikipedia.org/wiki/Linux_Unified_Key_Setup) 全盘加密。你可以把它理解成：**系统盘在关机状态下是*被加密*的**，每次开机都要先输入一次解密密码，系统才能继续启动。

<img
  src="https://image.aruoshui.fun/i/2026/03/10/sbvlqo-2.webp"
  alt="LUKS"
  style="display: block; margin: 0 auto; width: 30%; max-width: 720px; height: auto;"
/>

即使硬盘被拆下来接到另一台机器上，别人也无法直接读取里面的数据。

### 防火墙（UFW）

Omarchy 默认启用 [UFW](https://wiki.archlinux.org/title/Uncomplicated_Firewall) 防火墙，策略是**拒绝所有入站流量**，仅开放：

- **端口 22**：SSH 远程连接
- **端口 53317**：[LocalSend](https://localsend.org/) 局域网文件互传

此外，Omarchy 还集成了 [ufw-docker](https://github.com/chaifeng/ufw-docker) 规则，防止 Docker 容器绕过防火墙、意外暴露端口到外部网络——这是很多人在使用 Docker 时容易忽视的安全盲区。

![防火墙策略](https://image.aruoshui.fun/i/2026/03/16/o3lfq9-2.webp)

### 防滚挂

熟悉 Arch 这类采取 *滚动更新* 策略的发行版，大概都听过“滚挂”这个词：昨天还正常的系统，今天更新之后，可能就因为驱动、桌面组件、内核或配置之间的兼容性变化，出现黑屏、进不去桌面，甚至无法正常启动。Arch 官方其实一直强调，滚动更新不是不能稳定，而是要求用户完整升级、关注公告，并对变化负责。

{{ref_card(title="Archwiki-系统维护", url="https://wiki.archlinuxcn.org/wiki/%E7%B3%BB%E7%BB%9F%E7%BB%B4%E6%8A%A4")}}

Omarchy 的“防滚挂”正是围绕这个风险来设计的。它的核心思路很简单：**更新前先留快照，更新后如果出问题，就能直接退回去。**

1. **更新前自动拍快照**  
   通过 Omarchy 自带的更新入口升级系统时，会先用 `Btrfs + Snapper` 创建系统快照。你可以把它理解成一次“系统存档”：如果这次更新把桌面、驱动或某个关键组件搞坏了，至少还有上一个可回到的状态。  
   从我这台机器上看也是如此：`omarchy-update` 脚本会先执行 `omarchy-snapshot create`，再继续真正的系统升级。

![btrfs+Snapper](https://image.aruoshui.fun/i/2026/03/16/rcx87a-2.webp)

2. **快照可以直接从启动菜单回退**  
   Omarchy 官方手册的 *System Snapshots* 页面写得很明确：如果更新后系统起不来，可以在 Limine 启动菜单里直接选择更新前的快照启动，再决定是否执行正式恢复。  
   这比“拿 live USB 进系统再 chroot 抢修”轻松得多，也更符合普通用户的使用习惯。

3. **它解决的是“坏更新”，不是“误删文件”**  
   这套机制更像“系统回滚”，不是“文件备份”。它特别适合处理滚动更新带来的兼容性问题、配置冲突或黑屏，但不是专门拿来找回误删文档的，**日常备份依然不能省。**

4. **更新策略本身也在尽量降低风险**  
   Omarchy 官方明确不建议直接 `pacman -Syu` 或 `yay -Syu`，而是建议走 Omarchy 自带的更新入口，因为它会把快照、迁移和包更新串成一整套流程。  
   此外，默认的 stable 通道还会比最新 Arch 包慢大约一个月，用来先消化新版本可能带来的兼容性问题。



### 软件源管控
默认情况下，Omarchy 仅依赖 Arch 自身的 core、extra 和 multilib 软件仓库以及其自建的 Omarchy 软件包仓库
- Arch 官方仓库通过 `https://stable-mirror.omarchy.org/$repo/os/$arch` 分发
- Omarchy 自己的包则来自 `https://pkgs.omarchy.org/stable/$arch`。
系统更新不是东拼西凑地混很多第三方二进制仓库，而是尽量走 Omarchy 能控制、测试和兜底的来源。大大的提升了系统稳定性。

不过这句话也不能说得太绝对。更准确地说，**AUR 不是 Omarchy 核心系统的默认来源**，但如果你后续自己装了 AUR 包，Omarchy 的更新流程还是会一并处理它们。

### 签名验证

官方安全页给出了 Omarchy 的 GPG 公钥指纹：

```
40DFB630FF42BCFFB047046CF0134EE680CAC571
```

可以在 [keys.openpgp.org](https://keys.openpgp.org/search?q=pkgs%40omarchy.org) 查到，对应身份是 `Omarchy <pkgs@omarchy.org>`。Omarchy 官方也说明 ISO 可以通过同名 `.sig` 文件校验，而系统里则提供了 `omarchy-keyring` 来管理这把密钥。

![签名](https://image.aruoshui.fun/i/2026/03/10/rg1bhf-2.webp)

### 基础设施防护

官方安全页明确写到，Omarchy 的分发基础设施都放在 Cloudflare 后面：包括 **ISO 下载、Omarchy 自有包仓库，以及 Arch 镜像**。Cloudflare 之后，最直接的好处就是全球下载更快、流量高峰时更稳、同时还能扛住常见的 DDoS 攻击。



## 系统登录

![omarchy系统登录](https://image.aruoshui.fun/i/2026/03/17/ikviqe-2.webp)
Omarchy 的登录体验和大多数 Linux 桌面不太一样。 

像 Mint、CachyOS 这类常见桌面发行版，默认更常见的流程通常是：**开机后进入登录界面，再输入一次用户密码。** 如果用户在安装时额外启用了全盘加密，才会多出前面那一步“先输入磁盘解锁密码”。

Omarchy 的特殊之处在于，它默认强制启用 LUKS，并把真正的第一道门槛放在了开机解锁这里。你在冷启动时先输入一次解密密码，系统完成解锁后，就会自动进入用户会话，直接来到 Hyprland 桌面。磁盘加密在用户看来是完全无感的。

所以从日常体验上看，Omarchy 更像是把“开机解锁”和“用户登录”合并成了一次输入：只输一次密码，就能进系统。但其实**开机时输入的 LUKS 密码，并不等于你的 Linux 用户密码。** 安装时它们可以设置成一样，方便记忆（毕竟谁也不喜欢记住两个密码😂😂😂）；但**本质上依然是两套不同的密码**。前者负责“解锁磁盘”，后者负责账户认证和 `sudo` 提权，`root` 密码也同样是独立的。也就是说，后续你完全可以分别修改它们，它们不会自动联动。

Omarchy 的启动流程其实可以概括成：

{% mermaid() %}
graph TD
    A[按下电源键] --> B[进入引导器]
    B --> C{输入 LUKS 密码}
    C -- 密码错误 --> C
    C -- 密码正确 --> D[解锁系统盘]
    D --> E[继续启动系统]
    E --> F[自动登录用户会话]
    F --> G[进入 Hyprland 桌面]

    style C fill:#fff4d6,stroke:#d9a441
    style D fill:#eaf7ea,stroke:#5b8c5a
    style F fill:#e8f1fb,stroke:#5a88c8
{% end %}

这也算Omarchy的一个特色吧。设置其实很多，过程也比较复杂，但是对用户来说，这些完全无感，也不会成为负担。

登录系统进入桌面后，你可以进行后续步骤：

## 系统导航

Omarchy 的一切操作都通过键盘完成——**一切**。系统启动后，鼠标单独无法做任何事。你需要记住的第一组快捷键是：

| 快捷键 | 功能 |
|---|---|
| `Super + Space` | 打开应用启动器 |
| `Super + Alt + Space` | 打开 Omarchy 菜单 |

> 两个窗口均支持模糊搜索

这两个命令几乎能覆盖你的所有需求，但它们并非日常操作的主力方式——直接绑定到热键的应用启动才是。

### 应用启动与窗口操作

| 快捷键 | 功能 |
|---|---|
| `Super + Return` | 启动终端 |
| `Super + Shift + Return` | 启动浏览器 |
| `Super + Ctrl + T` | 启动活动监视器（浮动窗口） |
| `Super + Shift + F` | 打开文件管理器 |

依次启动终端和浏览器，你就能看到 Hyprland 平铺的魅力：窗口自动分割屏幕空间。

### 窗口管理

系统使用Hyprland窗口管理器，想看它的文档，现在正好体会一下omarchy的日常使用？直接使用`Super + Alt + Space`打开Omarchy系统菜单，选择Learn进入即可，会启动一个hypr-docx的官方文档的web-app

| 快捷键 | 功能 |
|---|---|
| `Super + Arrow` | 在窗口间切换焦点 |
| `Super + J` | 切换水平/垂直堆叠 |
| `Super + Shift + Arrow` | 交换窗口位置 |
| `Super + T` | 切换浮动/平铺 |
| `Super + F` | 全屏 |
| `Super + Alt + F` | 全宽（保留顶栏） |
| `Super + W` | 关闭当前窗口 |
| `Ctrl + Alt + Delete` | 关闭所有窗口 |

鼠标可以帮助你调整窗口大小：按住 `Super` + 左键拖动可重排窗口位置，`Super` + 右键拖动可自由调整窗口大小。

### 工作区

| 快捷键 | 功能 |
|---|---|
| `Super + Shift + N` | 将当前窗口移到工作区 N（并切换过去） |
| `Super + Shift + Alt + N` | 将当前窗口移到工作区 N（不切换） |

### 布局：Dwindle vs Scrolling

Hyprland 在 3月初提交的 version 0.54中新增了 hyprland 的 Scrolling Layout：

{{ref_card(title="Hyprland Scrolling Layout", url="https://wiki.hypr.land/Configuring/Scrolling-Layout/", image="https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/webp/hyprland.webp")}}

Omarchy 也在[V3.4.1](https://github.com/basecamp/omarchy/releases/tag/v3.4.1)中新增支持

Omarchy 默认使用 **Dwindle 布局**：所有窗口始终可见，即使需要缩小也会全部显示在一个工作区内。

你也可以通过 `Super + L` 将当前工作区切换为 **Scrolling 布局**：窗口并排排列，可超出屏幕边缘滚动浏览。如果你更喜欢 Scrolling 作为默认布局，可以在 `~/.config/hypr/looknfeel.conf` 中设置 `general { layout = scrolling }`。

> 其实我个人还是更喜欢使用 Dwindle 布局

### 窗口分组

| 快捷键 | 功能 |
|---|---|
| `Super + G` | 创建/解散分组 |
| `Super + Ctrl + Arrow` | 在分组内切换窗口 |
| `Super + Alt + 1/2/3/4` | 直接跳转到分组中第 N 个窗口 |
| `Super + Alt + G` | 将当前窗口移出分组 |
| `Super + Alt + Arrow` | 将外部窗口移入分组 |

进入分组模式后，后续启动的窗口会自动加入该分组。

### Scratchpad（草稿工作区）

Scratchpad 是一个特殊的浮动工作区，覆盖在当前工作区之上，适合放置需要频繁临时交互的窗口（比如打开终端临时做一个查询）。

| 快捷键 | 功能 |
|---|---|
| `Super + S` | 显示/隐藏 Scratchpad（会像一个抽屉一样打开） |
| `Super + Alt + S` | 将当前窗口放入 Scratchpad |

要将窗口从 Scratchpad 移出，直接用 `Super + Shift + N` 把它移到指定工作区即可。

### More
学会了导航操作，你就可以随意体验系统了！

{{ note(header="💡 提示", body="如果你刚从Windows来，适应这套键盘驱动的导航方式需要一些时间，但一旦上手，你将很难再回到传统的鼠标驱动桌面体验。") }}


## omarchy系统更新及软件包

{{ ref_card(title="Updates", url="https://learn.omacom.io/2/the-omarchy-manual/68/updates", image="https://image.aruoshui.fun/i/2026/03/10/p4nmk8-2.webp") }}

{{ ref_card(title="Other Packages", url="https://learn.omacom.io/2/the-omarchy-manual/66/other-packages", image="https://image.aruoshui.fun/i/2026/03/10/p4nmk8-2.webp") }}

{{ ref_card(title="System snapshots", url="https://learn.omacom.io/2/the-omarchy-manual/101/system-snapshots", image="https://image.aruoshui.fun/i/2026/03/10/p4nmk8-2.webp") }}

如果你本来就用 Arch，很容易下意识地把更新理解成一句 `pacman -Syu`，把装软件理解成一句 `yay -S`。  
但 **Omarchy 不是“换了套主题的 Arch”**，它在更新这件事上做了额外编排：**先快照、再同步 Omarchy 自身、再升级系统包、再处理迁移和 AUR**。  

所以在 Omarchy 里，**最推荐的更新方式始终是走它自己的入口**：

- `Super + Alt + Space` → `Update` → `Omarchy`
- 或者直接在终端执行：`omarchy-update`

### 为什么不要直接 `pacman -Syu`

官方手册已经明确提醒：Omarchy 的很多配置和默认值不是静态文件，而是会随着版本一起演进。  
如果你只手动跑 `pacman -Syu` 或 `yay -Syu`，虽然包会升级，但 **Omarchy 自身的配置更新、迁移脚本、快照与回滚流程并不会自动跟上**。这也是很多人把“滚动发行版不稳定”归咎给系统本身，实际上却是更新姿势不对的原因。👽️👽️👽️

从`omarchy-update` 脚本来看，实际流程大致是这样：

```bash
omarchy-update
├─ omarchy-snapshot create
├─ omarchy-update-git
└─ omarchy-update-perform
   ├─ omarchy-update-keyring
   ├─ pacman -Syyu
   ├─ omarchy-migrate
   ├─ yay -Sua        # 仅当你装过 AUR 包
   ├─ 清理 orphan 包
   └─ post-update hook / 重启相关进程
```

### 更新通道：现在是四档

我查官方手册时，当前版本已经把通道写成了 **stable、RC、edge、dev** 四档。  
新安装默认落在 `stable`，**刻意比 Arch 最新包慢一点**，先消化兼容性问题，再把更稳妥的一组包推给普通用户。

当前v3.4.2：
- `omarchy-version` 显示为 `3.4.2`
- `omarchy-version-channel` 返回 `stable`
- `/etc/pacman.d/mirrorlist` 指向 `https://stable-mirror.omarchy.org/$repo/os/$arch`
- `/etc/pacman.conf` 中的 `[omarchy]` 仓库指向 `https://pkgs.omarchy.org/stable/$arch`

{{ note(header="💡 提示", body="更新通道（channel）和 Git 分支（branch）不是一回事。Omarchy 本地脚本会同时调整代码分支和 pacman/omarchy 仓库来源，所以不要自己手改镜像再混着更新。") }}

### 什么时候更新
当Omarchy更新时候，waybar（顶部任务栏）会出现一个“更新”图标：

<img
  src="https://image.aruoshui.fun/i/2026/03/23/igl76s-2.webp"
  alt="系统更新提醒"
  style="display: block; margin: 0 auto; width: 70%; max-width: 720px; height: auto;"
/>

同时建议你watch一下omarchy的github，加入官方社区，及时查看最新进展

### 软件包怎么装

官方手册把软件安装分得很清楚，核心还是围绕 **Arch 官方仓库 + Omarchy 仓库 + AUR** 来组织：

1. **仓库包**  
   `Super + Alt + Space`打开的Omarchy菜单，进入 `Install > Package`，背后对应的是 `omarchy-pkg-install`。能打开给予 `fzf` 的包选择器，从 pacman 可见的软件仓库里做模糊搜索和安装。  

   ![pacman_fzf](https://image.aruoshui.fun/i/2026/03/23/ilugrz-2.webp)

   如果你更喜欢纯命令行，也可以直接用：

   ```bash
   omarchy-pkg-add <package>
   ```

2. **AUR 包**  
   `Super + Alt + Space`打开的Omarchy菜单，走 `Install > AUR`，背后对应 `omarchy-pkg-aur-install` / `omarchy-pkg-aur-add`。  
   这一层非常强大，但也要记住官方提醒：**AUR 不受 Arch 团队审核**，它更像 npm、RubyGems 这种社区仓库，方便归方便，风险还是要自己判断。

3. **卸载软件**  
   `Super + Alt + Space`打开的Omarchy菜单,走 `Remove > Package`，或者直接：
   会列出所有安装的软件包：

   ![remove_pkg](https://image.aruoshui.fun/i/2026/03/23/imzocl-2.webp)

   ```bash
   omarchy-pkg-drop <package>
   ```

   卸载时会顺带清掉依赖和配置残留。

## omarchy系统更多的快捷键

{{ ref_card(title="Hotkeys", url="https://learn.omacom.io/2/the-omarchy-manual/53/hotkeys", image="https://image.aruoshui.fun/i/2026/03/10/p4nmk8-2.webp") }}

{{ ref_card(title="Unified Clipboard", url="https://learn.omacom.io/2/the-omarchy-manual/105/universal-clipboard", image="https://image.aruoshui.fun/i/2026/03/10/p4nmk8-2.webp") }}


{{ note(header="💡 提示", body="想一口气记住所有系统快捷键基本不现实。我建议你可以先挨个试一遍，如果发现哪个特别顺手、对你帮助很大，再去刻意练习使用它。") }}


如果你临时忘了某个快捷键，**直接按 `Super + K`**，Omarchy 会弹出当前系统的快捷键总表。

{{ note(header="💡 提示", body="官方手册给的是默认键位；如果你自己改过 `~/.config/hypr/bindings.conf`，那就以 `Super + K` 实际显示出来的内容为准。") }}

我这里列举一些我常用的快捷键：

### 系统控制类快捷键

Omarchy 把很多常用系统操作直接绑成键位，再配一层 TUI/轻量菜单去完成。

| 快捷键 | 功能 | 个人使用体验 | 
|---|---|---| 
| `Super + Escape` | 打开系统菜单（关机、重启、休眠等） | 笔记本我更喜欢直接按电源键，同样也会打开该菜单   |
| `Super + Ctrl + A` | 打开音频控制 | 音频控制可能是使用体验最不好的，但是把所有跟音频相关的配置都列举出来了，不用反复查找  |
| `Super + Ctrl + B` | 打开蓝牙控制 | 及格 |
| `Super + Ctrl + W` | 打开 Wi-Fi 控制 | 一般 |
| `Super + Ctrl + T` | 打开活动监视器（`btop`） | 这个非常赞，与系统主题是搭配的 |
| `Super + Ctrl + C` | 打开截图/录屏/取色菜单 | 自带截屏，截图完成后会在右上角系统通知，点击能进入截图的编辑界面，使用体验远超其他同类项截图软件 | 
| `Super + Ctrl + S` | 打开分享菜单（基于 LocalSend） | 相比打开LocalSend 再选择更加方便快捷，使用频率很高 | 
| `Super + Ctrl + O` | 打开系统 Toggle 菜单 | 该菜单看个人喜好，有一些如切换夜间模式等不常用的功能选项，其实也对应有快捷键，但是记住这个Toggle能少记很多常用的快捷键 | 

### 通用剪贴板

在linux中，有一个常见的问题是，你需要混用`Ctrl + Shift + C/V` 和 `Ctrl + C/V`。**有时候终端里复制粘贴是 `Ctrl + Shift + C/V`，但别的应用又是 `Ctrl + C/V`？**

Omarchy 的做法是直接统一成一套 `Super` 组合键：

| 快捷键 | 功能 |
|---|---|
| `Super + C` | 复制 |
| `Super + X` | 剪切 |
| `Super + V` | 粘贴 |
| `Super + Ctrl + V` | 打开剪贴板历史 |
  
大部分场景下，都可以直接用这一套完成复制粘贴。有小部分的应用可能支持的不是很好。

另外，`Super + Ctrl + V` 调出的剪贴板历史是由[Walker](https://github.com/abenz1267/walker)提供的，**文本和图片都能记录**。

### 截图、通知和界面微调

| 快捷键 | 功能 |
|---|---|
| `Alt + Print Screen` | 开始/结束录屏 |
| `Super + Print Screen` | 取色器 |
| `Alt + Shift + L` | 复制当前 Web App / Chromium 页面 URL（需要在chromium 扩展中开启开发者模式） |
| `Super + Ctrl + ,` | 开关通知免打扰 |
| `Super + Ctrl + Space` | 切换主题背景 |
| `Super + Ctrl + Shift + Space` | 切换主题 |
| `Super + Shift + Space` | 隐藏 / 显示顶部栏 |
| `Super + Ctrl + I` | 开关 idle / sleep 防止休眠 |
| `Super + Ctrl + N` | 开关夜灯 |

### 一些小惊喜

这是你用Omarchy体验后绝对会喜欢的功能（至少我很喜欢）

| 快捷键 | 功能 | 个人体验  |
|---|---|--- |  
|`Super + Shift + Alt + B`|打开默认浏览器的无痕模式| 日常使用频率很高 |
|`Super + Ctrl + X` | 语音输入：开始/停止听写（requires Install > AI > Dictation） | 现在让AI写代码，描述需求的时候使用语音输入，往往比手敲描述的更详细，AI对需求的掌握程度就更深，很推荐尝试一下这个语音输入，再后续的内容中我会补充说明 | 
| `CapsLock + Space+ N` | 可以快捷输入您的姓名（这个是系统安装时候所输入）| 你看到就知道这个使用频率很高 |
| `CapsLock + Space+ E` | 可以快捷输入您的邮箱（这个是系统安装时候所输入）| 你看到就知道这个使用频率很高，就是容易忘记 |


{% character()  %}
上面的快捷输入姓名、邮箱你可以自己再修改，通过编辑 ~/.XCompose 修改、添加更多自定义内容，然后在终端运行 omarchy-restart-xcompose 以使更改生效。
{% end %}

## 系统主题

{{ ref_card(title="Themes", url="https://learn.omacom.io/2/the-omarchy-manual/52/themes", image="https://image.aruoshui.fun/i/2026/03/10/p4nmk8-2.webp") }}


{{ ref_card(title="Extra themes", url="https://learn.omacom.io/2/the-omarchy-manual/90/extra-themes", image="https://image.aruoshui.fun/i/2026/03/10/p4nmk8-2.webp") }}

{{ ref_card(title="Making your own theme", url="https://learn.omacom.io/2/the-omarchy-manual/92/making-your-own-theme", image="https://image.aruoshui.fun/i/2026/03/10/p4nmk8-2.webp") }}


Omarchy 的主题系统，是我觉得它最有“产品感”的地方之一。它不是传统意义上的“换个壁纸、换个终端配色”就结束了，而是把一整套桌面体验打包成一个主题。  

官方手册里写得很明确：一个主题会同时影响桌面、终端、Neovim、活动监视器（`btop`）、通知（`mako`）、顶部栏（`waybar`）、启动器（`walker`）和锁屏（`hyprlock`）。

一般主题文件夹在：`$HOME/.config/omarchy/themes/<theme_name>/` 

*这是一个主题文件的结构*：
```shell
- aura/
- ├── README.md:1 — 主题说明、预览图展示、安装方式
- ├── hyprland.conf:1 — Hyprland 窗口管理器的主题片段
- ├── hyprlock.conf:1 — Hyprlock 锁屏界面的主题片段
- ├── waybar.css:1 — Waybar 顶栏/状态栏样式
- ├── wofi.css:1 — Wofi 应用启动器样式
- ├── walker.css:1 — Walker 启动器/搜索界面样式
- ├── swayosd.css:1 — SwayOSD 音量、亮度等屏幕提示样式
- ├── mako.ini:1 — Mako 通知中心/弹窗样式与行为
- ├── alacritty.toml:1 — Alacritty 终端主题
- ├── ghostty.conf:1 — Ghostty 终端主题配置
- ├── ghostty-theme:1 — Ghostty 可复用主题文件
- ├── btop.theme:1 — btop 系统监控界面主题
- ├── neovim.lua:1 — Neovim 颜色主题选择
- ├── icons.theme:1 — 系统图标主题名称
- ├── theme.png:1 — 主题整体预览图
- ├── neofetch.png:1 — 终端/系统信息预览图
- └── backgrounds/
```

### 怎么切换主题？

最常用的方式有两个：

1. `Super + Alt + Space` 打开 Omarchy 菜单，进入 `Style > Theme`
2. 直接按 `Super + Ctrl + Shift + Space` 呼出主题选择器

![主题管理菜单](https://image.aruoshui.fun/i/2026/03/25/hij6vj-2.webp)

官方内置了 17 套主题，切换主题时它会先把主题内容整理到 `~/.config/omarchy/current/theme`，然后重启 Waybar、终端、通知、SwayOSD 等组件，甚至会顺带处理浏览器、VSCode这些配套项。

### 背景其实也是主题的一部分

大多数主题都自带一组配套背景图，可以用 `Super + Ctrl + Space` 在当前主题的背景之间轮换。
![背景切换](https://image.aruoshui.fun/i/2026/03/25/hgdai5-2.webp)

如果你想添加自己的壁纸 

可以去`$HOME/.config/omarchy/themes/<theme_name>/backgrounds/`中添加，注意分辨率最好与显示器分辨率一致
### 还可以安装社区主题

如果内置主题不够用，官方还维护了一个 `Extra themes` 页面，里面收集了很多社区主题。安装方式也很符合 Omarchy 的风格：复制主题仓库的 GitHub 地址，然后在 `Super + Alt + Space` 菜单里进入 `Install > Style > Theme` 即可；如果不喜欢了，就去 `Remove > Style > Theme` 删除。

如果你更习惯终端，也可以直接用这些命令：

```bash
omarchy-theme-list
omarchy-theme-current
omarchy-theme-set "Tokyo Night"
omarchy-theme-bg-next
omarchy-theme-install <git-url>
```

### 想自己做一套主题？

官方建议把自定义主题放在 `~/.config/omarchy/themes`，然后从 `~/.local/share/omarchy/themes` 里复制一套现成主题作为起点。手册里把 `colors.toml` 作为主要入口，终端、Hyprland、Hyprlock、Waybar、Walker、Mako、SwayOSD 等组件的配色，都会围绕这份颜色定义生成。  

如果你做的是浅色主题，还可以在主题根目录放一个空文件 `light.mode`；如果想把文件管理器图标也做成统一风格，还能额外加一个 `icons.theme`。

{{ note(header="💡 提示", body="如果只是想微调或自己做主题，优先改 `~/.config/omarchy/themes`，不要直接改 `~/.local/share/omarchy/themes`。前者是你的用户层，后者更接近系统内置资源，更新时更容易被覆盖。") }}


## 探索Omarchy系统的应用
终端、编辑器、AI、Web App、TUI 工具、少量必要的 GUI 应用都已经装好了，完全开箱即用。而且作者[DHH](https://dhh.dk/)本身就是一个优秀ruby程序员，你如果从事的是web开发，我相信系统中一定有能够帮助你的。

### 终端

{{ ref_card(title="Terminal", url="https://learn.omacom.io/2/the-omarchy-manual/106/terminal", image="https://image.aruoshui.fun/i/2026/03/10/p4nmk8-2.webp") }}

{{ ref_card(title="Shell tools", url="https://learn.omacom.io/2/the-omarchy-manual/57/shell-tools", image="https://image.aruoshui.fun/i/2026/03/10/p4nmk8-2.webp") }}

{{ ref_card(title="Themes", url="https://learn.omacom.io/2/the-omarchy-manual/58/shell-functions", image="https://image.aruoshui.fun/i/2026/03/10/p4nmk8-2.webp") }}

1. 终端本身有明确的默认方案
2. shell 里内置了更顺手的工具
3. 还补了一批适合日常工作的函数和别名

你可以方便快捷的安装三种终端软件：`Alacritty`(是 Omarchy 的默认终端)、`ghostty`、`kitty` 

使用 Super + Return 打开新终端。（该快捷键会自动指向你通过 Install > Terminal 安装的任何终端。）

当切换主题的时候，终端的风格也会统一适配。

#### shell优化
手册重点提到的几个 shell tools，我自己日常也确实最常用：

- `fzf`：在 Omarchy 里被包装得很顺手，比如直接用 `ff` 做文件模糊搜索，还能预览内容
![ff指令](https://image.aruoshui.fun/i/2026/03/25/smy5fn-2.webp)

- `zoxide`：把目录跳转变成“记忆式”导航，进入常用项目目录比传统 `cd` 更快，还不用反复写冗长的地址前缀（这个日常体验非常好）

![zoxide](https://image.aruoshui.fun/i/2026/03/25/u1atg4-2.webp)

- `ripgrep`：也就是 `rg`，搜代码和搜配置时速度极快，具体的使用方式在：

{{ ref_card(title="ripgrep", url="https://github.com/burntsushi/ripgrep", image="https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/png/github-light.png") }}


#### 命令行简化

| 简写 | 对应命令 | 作用 |
|---|---|---|
| `ff` | `fzf --preview 'bat --style=numbers --color=always {}'` | 边搜边看 |
| `c` | `opencode` | 单纯就是 `opencode` 命令太长了 |
| `cx` | `claude --allow-dangerously-skip-permissions` | 直接赋予高权限动作 |
| `t` | `tmux attach \|\| tmux new -s Work` | 回到已有的工作区（`tmux attach`），失败的话会新建名为 `Work` 的工作区（`tmux new -s Work`） |
| `n` | `n() { if [ "$#" -eq 0 ]; then command nvim . ; else command nvim "$@"; fi; }` | 不带参数时打开当前目录，带参数时打开指定文件或目录 |


#### 额外的功能函数
omarchy默认shell函数有：
- `compress` / `decompress`：快速压缩解压
- `iso2sd`：把 ISO 写入 U 盘或移动盘
- `format-drive`：格式化外置磁盘
- `fip` / `dip` / `lip`：做 SSH 端口转发管理
- `ga` / `gd`：围绕 Git worktree 创建和清理工作目录
- `tdl` / `tdlm` / `tsl`：围绕 Tmux 组织开发布局

### Tmux
因为默认终端 `Alacritty` 本身不提供原生标签页、分屏和图片渲染，所以 Omarchy 索性给出了一套统一的 Tmux 工作流。这样无论你后来换成 `ghostty`、`kitty`，还是 SSH 到远程主机，面板、窗口、会话的操作方式都能保持一致。

在 Omarchy 里，你可以直接用 `Super + Alt + Return` 打开一个带 Tmux 的新终端。 

Tmux 的前缀键（**Prefix**）默认是 `Ctrl + Space`，同时也兼容传统的 `Ctrl + B`。按下前缀键后再按 `s`，就能看到当前所有活跃会话，因为 Tmux 会话本身是持续存在的。   

如果你想改键位，直接改 `~/.config/tmux/tmux.conf` 就行。

最值得先记住的是下面这几组：
- `Prefix + v` / `Prefix + h`：左右 / 上下分屏
- `Prefix + x`：关闭当前 pane
- `Prefix + z`：把当前 pane 临时放大成全屏
- `Ctrl + Alt + 方向键`：在 pane 之间移动
- `Ctrl + Alt + Shift + 方向键`：调整 pane 尺寸
- `Prefix + c` / `Prefix + k` / `Prefix + r`：新建、关闭、重命名窗口
- `Alt + 1-9`、`Alt + 左右方向键`：在窗口之间切换
- `Prefix + C` / `Prefix + K` / `Prefix + R`：新建、关闭、重命名会话
- `Alt + 上下方向键`：在会话之间切换
- `Prefix + d`：detach 当前会话

官方手册专门提到三组 Tmux layout functions：
- `tdl <agent> [<second_agent>]`：一键拉起“左侧编辑器 + 右侧 AI + 底部终端”的 IDE 式布局
- `tdlm <agent> [<second_agent>]`：按当前目录的每个子目录批量生成同类布局，适合多项目并排推进
- `tsl <count> <command>`：直接生成多 pane 的 swarm 布局，适合同时跑多个 AI agent 或并行任务

比如我这里使用`tdl claude` ，打开的IDE样式布局：
![tdl](https://image.aruoshui.fun/i/2026/03/30/gya27i-2.webp) 

### 开发工具

{{ ref_card(title="Neovim", url="https://learn.omacom.io/2/the-omarchy-manual/56/neovim", image="https://image.aruoshui.fun/i/2026/03/10/p4nmk8-2.webp") }} 

{{ ref_card(title="Development tools", url="https://learn.omacom.io/2/the-omarchy-manual/62/development-tools", image="https://image.aruoshui.fun/i/2026/03/10/p4nmk8-2.webp") }}

Omarchy 的默认编辑器就是 `nvim`，而且不是一个裸的 Neovim，而是已经配好了 LazyVim 这类现代化方案。

`~/.local/share/omarchy/config/uwsm/default` 中直接写了：

```bash
export EDITOR=nvim
```
Omarchy 的很多地方都会默认把 Neovim 当成主编辑器使用。比如在 Hyprland 绑定里，`Super + Shift + N` 会走 `omarchy-launch-editor`；而这个脚本会优先看 `$EDITOR`，如果是 `nvim`、`vim`、`nano`、`hx`、`helix` 这类终端编辑器，就把它作为 TUI 应用启动；如果你换成 GUI 编辑器，它也会自动按 GUI 的方式启动。

如果不喜欢或者不习惯Omarchy推荐的 Neovim + Tmux + shell + TUI + AI 路线，也可以只拿它的系统级整合，然后换成 VSCode、Cursor、Zed 继续工作。无论选哪条路，Omarchy都已经帮你把入口铺好了。

Omarchy 菜单里还预留了 `Install > Editor` 与 `Install > Development` 两大入口。
编辑器可以直接装：

- VSCode
- Cursor
- Zed
- Sublime Text
- Helix
- Emacs

对于开发环境，Omarchy 在 `Install > Development` 里按语言和生态分组。大部分采用 [`mise`](https://github.com/jdx/mise) 统一管理各类语言运行时和工具链。

<img
  src="https://image.aruoshui.fun/i/2026/03/30/iennbt-2.webp"
  alt="工具链"
  style="display: block; margin: 0 auto; width: 70%; max-width: 200px; height: auto;"
/>

目前菜单里大致分成这些入口：

| 分组/语言 | 菜单入口 | 主要安装管理 | 实际安装内容 | 备注 |
|---|---|---|---|---|
| Ruby on Rails | `Install > Development > Ruby on Rails` | `mise` + 系统包 + `gem` | `libyaml`、`ruby@latest`、Rails | 会写 `~/.gemrc`，并调整 `mise` 的 Ruby 设置 |
| Docker DB | `Install > Development > Docker DB` | Docker | MySQL、PostgreSQL、Redis、MongoDB、MariaDB、MSSQL 容器 | 数据库采用容器部署 |
| JavaScript | `Install > Development > JavaScript` | `mise` | `Node.js`、`Bun`、`Deno` | 这是一个子菜单，不是单一运行时 |
| Go | `Install > Development > Go` | `mise` | `go@latest` | 标准 `mise` 路线 |
| PHP / Laravel / Symfony | `Install > Development > PHP` | 系统包 + Composer + 部分 `mise` | `php`、`composer`、`xdebug`、扩展、Laravel Installer、Symfony CLI、Node.js | 更像“语言 + 框架 + 配套工具”的打包入口 |
| Python | `Install > Development > Python` | `mise` + 官方脚本 | `python@latest`、`uv` | Python 用 `mise`，包管理工具补装 `uv` |
| Elixir / Phoenix | `Install > Development > Elixir` | `mise` + `mix` | `erlang@latest`、`elixir@latest`、Hex、Rebar、`phx_new` | 同样是语言和框架共用一个生态入口 |
| Zig | `Install > Development > Zig` | `mise` | `zig@latest`、`zls@latest` | 连语言服务器一起装 |
| Rust | `Install > Development > Rust` | `rustup` | Rust toolchain | 不走 `mise`，而是官方 `rustup` |
| Java | `Install > Development > Java` | `mise` | `java@latest` | 标准 `mise` 路线 |
| .NET | `Install > Development > .NET` | `mise` | `dotnet@latest` | 标准 `mise` 路线 |
| OCaml | `Install > Development > OCaml` | `opam` | `opam`、OCaml、`ocaml-lsp-server`、`odoc`、`ocamlformat`、`utop` | 不走 `mise`，而是官方 `opam` 生态 |
| Clojure | `Install > Development > Clojure` | `mise` + 系统包 | `clojure@latest`、`rlwrap` | `rlwrap` 是额外系统依赖 |
| Scala | `Install > Development > Scala` | `mise` | `java@latest`、`scala@latest`、`scala-cli@latest` | 安装 Scala 时会顺带装 Java |

### AI及语音输入

{{ ref_card(title="AI", url="https://learn.omacom.io/2/the-omarchy-manual/107/ai", image="https://image.aruoshui.fun/i/2026/03/10/p4nmk8-2.webp") }} 

Omarchy里的 `Install > AI` 菜单项目前包含这些内容：

- Dictation
- Claude Code
- Codex
- Gemini CLI
- Copilot CLI
- Cursor CLI
- LM Studio
- Ollama
- Crush

在AI大火的今天，用语音描述一个需求往往比文字描述更清晰，更具体，Omarchy也集成了语音输入。 

Omarchy 这部分现在走的是 `Voxtype` 方案。  

`Install > AI > Dictation` 会做几件事：Thanksgiving非偶然watching！

1. 安装 `voxtype`
2. 下载一个默认 AI 模型，脚本提示大约 `~150MB`
3. 生成 `~/.config/voxtype/config.toml`
4. 配置 systemd 与 Waybar 集成
5. 提示你使用 `Super + Ctrl + X` 开始或停止听写（waybar上会有图标提示）

Omarchy 配置：
- 默认使用 Whisper 系列模型
- 输出模式是 `type`，也就是直接把识别结果输入到当前光标所在位置
- 如果直接输入失败，会回退到剪贴板
- 支持状态文件，Waybar 能显示 `idle / recording / transcribing`
- 还预留了 post-process，可以把转写文本再交给本地 LLM 做清理

其他AI的安装自不必说

### TUI应用

参考手册：[TUIs](https://learn.omacom.io/2/the-omarchy-manual/59/tuis)  

TUI 应用在 Omarchy 里不是边角料，反而很符合它的系统哲学。像 `btop`、`lazygit`、`lazydocker` 这类工具都很自然地融入到了终端工作流里，既轻量又适合键盘操作。对 Omarchy 来说，很多原本会做成 GUI 的事情，直接交给 TUI 反而更顺手。  

官方手册里这页其实很能说明问题：Omarchy 并不是“顺手装了几个终端工具”而已，而是明确把一部分系统能力组织成了 TUI 工作流。也就是说，它不是只让你在终端里写命令，而是希望你直接在终端里完成监控、版本管理、容器管理，甚至一部分系统连接配置。

手册里提到的几个代表工具，大致可以分成下面几类：

1. **资源监控：`btop`**  
   这是 Omarchy 里的“活动监视器”思路。你可以从应用启动器里用 `Activity` 打开它，也可以直接用 `Super + Shift + T` 唤起。CPU、内存、磁盘、网络、进程都能在一个界面里看清楚，对开发机来说非常实用。
   
   ![btop](https://image.aruoshui.fun/i/2026/03/30/qs8vo8-2.webp)

2. **Git 操作：`lazygit`**  
   如果说很多人会在 macOS 或 Windows 上用 GitHub Desktop，那 Omarchy 的答案基本就是 `lazygit`。进到任意 Git 仓库后直接运行 `lazygit` 就行。 
   
   在 Neovim 里还能用 `Space G G` 打开。它的交互也很直接：`Tab` 切换面板，`Space` 暂存文件，`c` 提交，`?` 查看帮助。
   ![lazygit in nvim](https://image.aruoshui.fun/i/2026/03/30/qtccct-2.webp)

3. **容器管理：`lazydocker`**  
   管理docker容器的TUI应用。Omarchy 给它配了 `Super + Shift + D` 的启动方式，`s` 停止容器，`r` 启动或重启。对于平时跑本地开发环境、看日志、管 compose 服务的人来说，这比一遍遍敲 `docker ps`、`docker logs` 更顺手。
   ![lazydocker](https://image.aruoshui.fun/i/2026/03/30/quxeqy-2.webp)

4. **系统连接：`Impala` 和 `BlueTUI`**  
   Wi-Fi 管理都用了 `Impala`，蓝牙则用了 `BlueTUI`。

5. **系统信息：`fastfetch`**  
   大家好像都习惯装完系统`fetch`一下，在Omarchy里面，你可以使用功能菜单里的`About`快速打开
   ![fetch](https://image.aruoshui.fun/i/2026/03/30/qw5vlc-2.webp)

### WebAPP应用

{{ ref_card(title="WebAPP", url="https://learn.omacom.io/2/the-omarchy-manual/63/web-apps", image="https://image.aruoshui.fun/i/2026/03/10/p4nmk8-2.webp") }}   

Omarchy 支持把网页服务安装成独立 Web App。官方手册给出的入口是 `Super + Alt + Space` 打开 Omarchy 菜单，然后进入 `Install > Web App`。安装时会填写应用名称、目标 URL，以及可选的图标 URL。

安装WebAPP
![WebAPP](https://image.aruoshui.fun/i/2026/03/30/r40wi8-2.webp)

安装完成后，Web App 会出现在应用启动器里，可以像普通桌面应用一样启动。删除入口在同一套菜单里，对应 `Remove > Web App`。

这类 Web App 的底层方式是 Chromium 的 app 模式，也就是把指定网页以独立窗口打开，而不是作为普通浏览器标签页运行。窗口会保留网页内容，但不显示常规的标签栏和地址栏。

Omarchy 还为一部分常用 Web App 预设了全局快捷键，当前默认绑定包括：

- `Super + Shift + A`：ChatGPT
- `Super + Shift + Alt + A`：Grok
- `Super + Shift + C`：HEY Calendar
- `Super + Shift + E`：HEY Email
- `Super + Shift + Y`：YouTube
- `Super + Shift + Alt + G`：WhatsApp
- `Super + Shift + Ctrl + G`：Google Messages
- `Super + Shift + P`：Google Photos
- `Super + Shift + X`：X

从系统行为上看，Omarchy 把 Web App 作为浏览器之外的一类独立启动项来管理：可以安装、移除、加入启动器，也可以绑定到 Hyprland 的快捷键。

### WindowsVM

参考手册：[Windows VM](https://learn.omacom.io/2/the-omarchy-manual/100/windows-vm)  

如果你偶尔还需要 Windows 专属软件，Omarchy 也给出了比较直接的官方路径。我本机菜单里可以通过 `Install > Windows` 调起 `omarchy-windows-vm install`；从脚本看，它会基于 Docker 拉起 Windows 镜像，并通过 RDP 连接，`~/Windows` 目录还会作为共享目录挂进去。这个方案更适合 Office 或少量 Windows-only 工具，而不是拿来替代原生游戏环境。


## 后续更新
这篇文章主要是介绍omarchy系统，后续更新文章将会带大家配置omarchy系统，然后我会认真拆解这个系统的架构



## 补充点
1.  ctrl + shift + f 可以打开文件管理器（这里是使用的gnome的文件管理器）
