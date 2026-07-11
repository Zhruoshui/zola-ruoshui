+++
title = "pi agent(一)：快速开始.md"
date = 2026-07-01
authors = ["ruoshui"]

[taxonomies]
tags = ["agentic-coding"]

[extra]
comment = true
repo_view = true
+++

6 月 30 日，一名 Reddit 用户发了篇逆向分析。他拆解了 `Claude Code 2.1.196` 的二进制文件，在里面找到了一段函数。

<img
  src="https://image.aruoshui.fun/i/2026/07/06/xj29sl-2.webp"
  alt="Arch梗图"
  style="display: block; margin: 0 auto; width: 70%; max-width: 720px; height: auto;"
/>

> 简单来说：当你使用代理连接 Claude Code 时，它会检查系统时区是否为 Asia/Shanghai 或 Asia/Urumqi，并判断代理 URL 是否为中国域名或指向某个中国 AI 实验室，然后在系统提示词里动手脚。 
> 
> 比如把日期分隔符从「2026-06-30」变成「2026/06/30」，「Today's」 里的单引号被替换成另一种肉眼完全无法区分的 Unicode 变体。三个变体对应三种状态：命中中国域名、命中中国 AI 实验室关键词、两者都命中。具体显示为：
> 
> - 中国域名 + 非 AI 实验室 → ’（右单引号 '）
> - 非中国域名 + 中国 AI 实验室 → ʼ（修饰符撇号 ʼ）
> - 中国域名 + 中国 AI 实验室 → ʹ（修饰符角分号 ʹ）
> 
> 三个字符肉眼几乎无法分辨，加上日期分隔符的差异，一共能编码 6 种身份状态。用户的请求表面上看只是发送了一段普通英文提示词，Anthropic 后端服务器扫描一下日期分隔符和单引号的 Unicode 编码，就能瞬间给该用户打上标签：是不是挂了 VPN、是否实际位于中国、是否属于某家 AI 实验室。

至于如何检测，一种是检测系统时区（是否包含国内用户常用的Asia/Shanghai），另一种就是检查代理域名是否在标记的中国名单中（包含国内大厂以及中转镜像站等）

如果域名命中，英文撇号被替换。普通撇号 ' 是 U+0027；命中中国域名换成 U+2019（右单引号）；命中 AI 实验室关键词换成 U+02BC（修饰符撇号）；两者都命中换成 U+02B9（修饰符角分号）。

<img
  src="https://image.aruoshui.fun/i/2026/07/06/xvkvg6-2.webp"
  alt="Arch梗图"
  style="display: block; margin: 0 auto; width: 70%; max-width: 720px; height: auto;"
/>

这三个字符在绝大多数等宽字体里渲染结果完全一样，代码审查看不出，PR diff 看不出，你在终端里复制出来也看不出。

系统提示词里本来就有一句固定的话`「Today's date is 2026-06-30.」`改完之后它看起来还是`「Today's date is 2026-06-30.」`。

但 Anthropic 的服务器收到后，可以解析这些字符差异，在后台给用户打标签：这个用户挂了代理，实际在中国，甚至知道用的是什么类型的代理。

*真的看到这个事件就特别愤怒，使用claude code 快1年了，**A➗的骂名早已扬名海外，这次更是➗中➗**。于是打算放弃使用claude code等一众闭源coding agent*

# pi agent快速上手

开源的coding agent主要就是`opencode`和`pi`了。

- `opencode`之前就搭配omo框架，体验还是不错的，稍微的缺点就是比较占用系统资源。

- `pi`则是一个极度精简的 agent，纯纯毛坯房，但其可塑性及灵活的package，又能自己装修成豪华别墅，避免这些恶意的"装修公司"
  
  > 无 MCP、无后台 bash、无内置 to-do、无 plan mode、无子 agent，本体的内置提示词不超过 1000token，仅内置 4 个工具：read、write、edit、bash

说白了我也是一个爱折腾的人，选择玩一玩 `pi`

## pi agent 安装

遵循安装手册即可，我是使用的npm安装的包： 

{{ ref_card(title="Quickstart", url="https://pi.dev/docs/latest/quickstart", image="https://image.aruoshui.fun/i/2026/07/06/z56sq1-2.webp") }}

## provider模型提供商
类似于opencode，可以配置御三家的订阅、也可以使用如硅基流动等的第三方订阅，而要想用自定义模型或者本地模型，就需要手动编辑`~/.pi/agent/models.json`，没有该文件的化需要新建，参考： 

{{ ref_card(title="Custom Models", url="https://pi.dev/docs/latest/models", image="https://image.aruoshui.fun/i/2026/07/06/z56sq1-2.webp") }}

例如：
```json 
{
  "providers": {
    "my-google": {
      "baseUrl": "https://generativelanguage.googleapis.com/v1beta",
      "api": "google-generative-ai",
      "apiKey": "$GEMINI_API_KEY",
      "models": [
        {
          "id": "gemma-4-31b-it",
          "name": "Gemma 4 31B",
          "input": ["text", "image"],
          "contextWindow": 262144,
          "reasoning": true
        }
      ]
    }
  }
}
```

如果你不知道模型的具体配置，可以参考：https://models.dev/，搜索需要的模型。

更简单的，pi 官网提供了模型配置参考，如我这里搜索GPT-5.5：https://pi.dev/models/openai/gpt-5-5?name=GPT5.5
![](https://image.aruoshui.fun/i/2026/07/06/10ip0nq-2.webp)

点击`MODEL CONFIG JSON`即可看到参考配置。

## 使用pi

用过其他 coding agent 这里自然是不需要再讲了，可以看看一下几点：

{{ note(header="⚠️ 安全提醒", body="不会限制模型在您开始在某个目录中工作后可以请求工具执行哪些操作，建议先完成权限、工作目录和模型等配置后投入生产使用。") }}

### `/hotkeys`
1. 导航

   | 按键 | 操作 |
   | :--- | :--- |
   | 上 / 下 / 左/Ctrl+B / 右/Ctrl+F | 移动光标 / 浏览历史记录 |
   | Alt+左/Ctrl+左/Alt+B / Alt+右/Ctrl+右/Alt+F | 按单词移动 |
   | Home/Ctrl+A | 跳至行首 |
   | End/Ctrl+E | 跳至行尾 |
   | Ctrl+] | 向后跳转至指定字符 |
   | Ctrl+Alt+] | 向前跳转至指定字符 |
   | PageUp / PageDown | 按页滚动 |

2. 编辑

   | 按键 | 操作 |
   | :--- | :--- |
   | Enter | 发送消息 |
   | Shift+Enter/Ctrl+J | 换行 |
   | Ctrl+W/Alt+Backspace | 向前删除一个单词 |
   | Alt+D/Alt+Delete | 向后删除一个单词 |
   | Ctrl+U | 删除至行首 |
   | Ctrl+K | 删除至行尾 |
   | Ctrl+Y | 粘贴最近删除的文本 |
   | Alt+Y | 粘贴后循环切换已删除的文本 |
   | Ctrl+- | 撤销 |

3. 其他

   | 按键 | 操作 |
   | :--- | :--- |
   | Tab | 路径补全 / 接受自动补全 |
   | Escape | 取消自动补全 / 中止流式输出 |
   | Ctrl+C | 清空编辑器（第一次） / 退出（第二次） |
   | Ctrl+D | 退出（当编辑器为空时） |
   | Ctrl+Z | 挂起至后台 |
   | Shift+Tab | 切换思考级别 |
   | Ctrl+P / Shift+Ctrl+P | 切换模型 |
   | Ctrl+L | 打开模型选择器 |
   | Ctrl+O | 切换工具输出展开/折叠 |
   | Ctrl+T | 切换思考块显示/隐藏 |
   | Ctrl+G | 在外部编辑器中编辑消息 |
   | Alt+Enter | 将后续消息加入队列 |
   | Alt+上 | 恢复队列中的消息 |
   | Ctrl+V | 从剪贴板粘贴图片 |
   | `/` | 斜杠命令 |
   | `!` | 运行 bash 命令 |
   | `!!` | 运行 bash 命令（不包含在上下文中） |

### cli命令
#### 软件包命令
用于管理`pi`软件包，类似于claude code里面的plugin
```markdown
pi install <source> [-l]     # 安装包，-l 表示安装到项目本地
pi remove <source> [-l]      # 移除包
pi uninstall <source> [-l]   # 移除包
pi update [source|self|pi]   # 仅更新 pi 本身，或更新指定的包源
pi update --all              # 更新 pi 及所有包；同步已锁定的 git 引用
pi update --extensions       # 仅更新包；同步已锁定的 git 引用
pi update --self             # 仅更新 pi 本身
pi update --extension <src>  # 更新指定的单个包
pi list                      # 列出已安装的包
pi config                    # 启用/禁用包资源
```

#### pi模式
`pi`默认启动就是交互模式，如果想把它塞进脚本、管道或者其他工具链里，就需要用到下面这些模式。

| 模式 | 命令 | 说明 |
| :--- | :--- | :--- |
| 交互模式 | `pi` | 正常打开 TUI，适合日常开发 |
| 继续会话 | `pi -c` / `pi --continue` | 继续最近一次会话 |
| 选择会话 | `pi -r` / `pi --resume` | 从历史会话里选择一个恢复 |
| 一次性输出 | `pi -p` / `pi --print` | 输出回答后退出，适合脚本调用 |
| JSON 模式 | `pi --mode json` | 以 JSON Lines 输出事件，适合做二次封装 |
| RPC 模式 | `pi --mode rpc` | 通过 stdin/stdout 做 RPC 通信 |
| 导出会话 | `pi --export <session> [out]` | 将会话导出成 HTML |

`print`模式还可以吃管道输入，例如：

```bash
cat README.md | pi -p "总结这个项目的核心结构"
pi -p "检查当前仓库有没有明显的安全风险"
```

这就很适合做一些固定任务：生成 changelog、总结 README、读日志、跑一次只读审计之类。

#### 工具权限
`pi`的工具也可以在启动时收窄。这个功能非常适合陌生仓库、开源项目审计、或者你只是想让模型看代码而不是动代码的时候。

```bash
pi --tools read,grep,find,ls -p "只读审查这个仓库，指出可能的问题"
pi --exclude-tools bash "帮我看代码，但不要运行命令"
pi --no-builtin-tools "只加载扩展工具，不启用内置工具"
pi --no-tools -p "只根据我给你的内容回答"
```

### 系统提示词
如果你想完全替换默认 system prompt，可以使用：

```text
.pi/SYSTEM.md
~/.pi/agent/SYSTEM.md
```

如果只是想追加，而不是替换默认提示词，则使用：

```text
.pi/APPEND_SYSTEM.md
~/.pi/agent/APPEND_SYSTEM.md
```

### 环境变量
最后是几个比较实用的环境变量：

| 变量 | 说明 |
| :--- | :--- |
| `PI_CODING_AGENT_DIR` | 覆盖配置目录，默认是`~/.pi/agent` |
| `PI_CODING_AGENT_SESSION_DIR` | 覆盖会话保存目录 |
| `PI_PACKAGE_DIR` | 覆盖 package 目录，适合 Nix/Guix 这类场景 |
| `PI_OFFLINE` | 禁用启动时的网络操作，包括更新检查、package 检查和安装/更新遥测 |
| `PI_SKIP_VERSION_CHECK` | 跳过版本更新检查 |
| `PI_TELEMETRY` | 控制安装/更新遥测和 provider attribution headers |
| `PI_CACHE_RETENTION` | 设置更长的 prompt cache 保留策略 |
| `VISUAL`、`EDITOR` | `Ctrl+G`外部编辑器的兜底选择 |

比如你想在离线环境或者不想启动时检查更新，可以这样：

```bash
PI_OFFLINE=1 pi
PI_SKIP_VERSION_CHECK=1 pi
```


接下来就是开始研究怎么装修这个毛坯房了！
