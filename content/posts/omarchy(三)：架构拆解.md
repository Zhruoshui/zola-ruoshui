+++
title = "omarchy(三)：架构拆解"
date = 2026-03-15 
authors = ["ruoshui"]

[taxonomies]
tags=["个人操作系统"]

[extra]
comment = true
repo_view = true
+++

# 系统启动详解
## 

### 全盘加密（LUKS）

Omarchy 安装时默认走的是 `btrfs + LUKS + Limine` 这套组合，官方手册甚至直接写明了：**加密是必须的，因为 Omarchy 的自动登录依赖它。**  

更准确地说，它并不是“磁盘上每一个分区都被加密”，而是采用 Linux 上很常见的布局：**EFI 启动分区保持明文可启动，主要系统分区放进 LUKS 容器里。** 开机后，系统会先在早期启动阶段要求你输入 LUKS 密码；只有解锁成功，内核才能把加密卷映射出来，继续挂载根文件系统。

LUKS（Linux Unified Key Setup）是 Linux 上最通用的磁盘加密格式之一。按照 [ArchWiki](https://wiki.archlinux.org/title/Dm-crypt/Encrypting_an_entire_system) 和 [Red Hat 文档](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/10/html/managing_storage_devices/encrypting-block-devices-by-using-luks) 的说法，它的核心并不是“拿密码直接加密整个磁盘”，而是由密码先解锁保存在 LUKS 头部中的主密钥，再交给内核的 `dm-crypt` 模块对磁盘读写做透明加解密。对应用来说，这看起来像一块普通磁盘；但在关机状态下，盘上的数据仍然是密文。

<img
  src="https://image.aruoshui.fun/i/2026/03/10/sbvlqo-2.webp"
  alt="LUKS"
  style="display: block; margin: 0 auto; width: 30%; max-width: 720px; height: auto;"
/>


也就是说即使硬盘被拆出来接到另一台机器上，数据也无法访问。

拿我当前这台 Omarchy 机器来说，实际布局就是：

- `nvme0n1p1`：2 GiB 的 EFI 分区，挂载到 `/boot`
- `nvme0n1p2`：`crypto_LUKS` 分区，`lsblk` 显示版本为 `LUKS2`
- 解锁后映射为 `/dev/mapper/root`
- 根文件系统使用 `Btrfs`，并挂载 `@` 子卷

它当前的关键启动参数也能说明这件事：

```bash
cryptdevice=PARTUUID=...:root root=/dev/mapper/root rootflags=subvol=@ rootfstype=btrfs
```

这表示 initramfs 会在早期启动阶段先把 LUKS 分区解锁并映射为 `root`，再把其中的 Btrfs `@` 子卷挂载为真正的系统根目录。我的这台机器同时启用了 Omarchy 的 UKI 配置（`/etc/default/limine` 中 `ENABLE_UKI=yes`），解锁完成后则由 SDDM 自动登录到 `hyprland-uwsm` 会话。


   
   
   系统更新可以使用 Super + Alt + Space 打开系统菜单，输入update，在子菜单内选择更新omarchy，会打开如下的更新TUI界面，选择更新后就会首先创建一个更新前的系统快照：
   ![omarchy update](https://image.aruoshui.fun/i/2026/03/16/s8itac-2.webp)

