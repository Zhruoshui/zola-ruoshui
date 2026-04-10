+++
title = "omarchy(一)：开始接触Arch Linux"
date = 2026-03-09 
authors = ["ruoshui"]

[taxonomies]
tags=["个人操作系统"]

[extra]
comment = true
repo_view = true
+++

# 向Linux迈进

## 为什么选择Linux

第一次接触linux桌面系统是在学习ROS时候，在虚拟机上搭建的Ubuntu20.04，当时觉得这个桌面看起来比较——嗯，简陋？看惯了windows窗口、动画，一时间到ubuntu上还不是很适应。

<img
  src="https://image.aruoshui.fun/i/2026/03/09/h2hd2f-2.webp"
  alt="Ubuntu 20.04.2 LTS Released with Linux Kernel 5.8 from Ubuntu ..."
  style="display: block; margin: 0 auto; width: 70%; max-width: 720px; height: auto;"
/>

随着工作学习的推进，Linux 已高频融入我的日常。出于对终端体验的纯粹热爱，我决定为笔记本重装 Linux 桌面端，使其彻底脱离 WSL 与虚拟机的虚拟环境。我始终坚信：**想掌握 Linux，就不能只让它运行在幕后。实践出真知，真正的学习永远发生在真实的使用场景之中。**

## 选择什么发行版呢？

第一件事是选择一个Linux的发行版，but我相信你懂得😵‍💫😵‍💫😵‍💫
一开始真的belike——
<img
  src="https://image.aruoshui.fun/i/2026/03/09/ihvp6a-2.webp"
  alt="Linux各大发行版"
  style="display: block; margin: 0 auto; width: 70%; max-width: 720px; height: auto;"
/>

作为*选择困难证患者*，最早接触的就是Ubuntu，一开始其实计划**ALL IN Ubuntu**，毕竟最熟悉呀

<img
  src="https://image.aruoshui.fun/i/2026/03/09/i9mliz-2.webp"
  alt="Linux各大发行版"
  style="display: block; margin: 0 auto; width: 70%; max-width: 720px; height: auto;"
/>

# 玩上了Arch
## 是什么让我选择Arch
7月末，不知道是不是大数据发力了，在我确实犹豫不决的时候。 

看到了这位UP的视频，UP知根知底的讲解每个步骤，过程中遇到的坑、细节。  

看完视频，我恍然大悟，作为一个爱折腾的人，Arch就是我的最佳选择。

<iframe src="//player.bilibili.com/player.html?isOutside=true&aid=114882808647595&bvid=BV1L2gxzVEgs&cid=31266311765&p=1" width="100%" height="520" style="max-width: 100%; aspect-ratio: 16 / 9; border: 0;" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe> 


其实久仰Archlinux的大名： 😱😱😱，或者说是一种刻板印象？？

<img
  src="https://image.aruoshui.fun/i/2026/03/09/p40279-2.webp"
  alt="Arch梗图"
  style="display: block; margin: 0 auto; width: 70%; max-width: 720px; height: auto;"
/>

## Archlinux有什么特点

{% character()  %}
1. 绝对的“毛坯房”与纯命令行安装 
   
2. Arch的系统和开发遵循KISS，意味着用户“一切靠自己”

3. 虽然简，但不陋，Read The Fing Manual。Arch wiki 就是当今最好的linux百科全书，基本所有问题都能在其中找到一些答案，就算没有切确的答案，但往往你也能找到一些解决思路，更别提活跃的Arch社区

4. Arch 没有版本号，它永远保持着软件世界里最新、最前沿的代码。但伴随的风险就是让新手闻风丧胆的‘滚挂’：前一秒你刚开心地敲下全局更新命令，下一秒重启后，可能就因为某个底层驱动或组件的冲突直接黑屏。此时你只能被迫化身‘赛博修理工’，面对着纯命令行查日志、修系统。
{% end %}

## 安装archlinux
其实就是按照UP主的步骤进行操作，进行手动安装，同时参考了：

{{ ref_card(title="ArchLinux简明指南", url="https://arch.icekylin.online/", image="https://image.aruoshui.fun/i/2026/03/09/r70h08-2.webp") }}

{{ ref_card(title="archwiki安装指南", url="https://wiki.archlinux.org/title/Installation_guide", image="https://image.aruoshui.fun/i/2026/03/09/r885r3-2.webp") }}

最终呈现的效果：（关于为什么是手拍图片，啊这个就是为什么会有这篇博客的原因了） 

我是使用的一台**联想小新pro16 2021**，具体配置已经`fetch`出来了

![配置信息](https://image.aruoshui.fun/i/2026/03/09/rfaogq-2.webp)

![桌面](https://image.aruoshui.fun/i/2026/03/09/rg2nd7-2.webp)

其中有一个坑是我系统快照是使用的timeshift进行图形化管理的，同时备份了/home，造成每个系统快照大小都很大

## 遇到的第一个系统问题
由于我这个人有硬盘焦虑，很不喜欢硬盘被塞满，看到如此多安装时候备份的系统快照，于是就心想删除这些快照，但是遇到了timeshift的bug吧，导致错误的引导参数而炸系统。对数据倒是没什么影响，用live环境把数据拷贝出来了。 

可能问题类似于：
https://github.com/Antynea/grub-btrfs/issues/390 

或者：
https://github.com/Antynea/grub-btrfs/issues/320
其实大家都不太推荐timeshift

# 重装系统
自那次系统事故后，我就更加注重系统的相对稳定（啊不是意味着放弃Arch而使用ubuntu这类固定更新的系统，造成系统崩坏的根本原因还是在我不成熟的操作及习惯，这是需要更正的，而不是避而不谈）


