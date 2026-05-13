+++
title = "helloagent(七)：vibecoding"
date = 2026-03-24
authors = ["ruoshui"]

[taxonomies]
tags=["agentic-coding"]

[extra]
comment = true
repo_view = true
+++

# 现代编程新范式

很早之前（2025年9月份）就写过一篇文章来介绍所谓的“氛围编程”或者是当今的“代理式编程”，当时还处在claude code刚刚流行，还在研究Augment Code的阶段

{{ ref_card(title="Agentic Coding：编程新范式", url="https://blog.aruoshui.fun/posts/58749.html", image="https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/png/hexo.png") }}

# vibecoding工具
要玩vibecoding，最重要的无非是“大模型”、“agent基座”

## 大模型
大模型早期还是御三家的统治阶段（claude、GPT、gemini），不过现在国产模型也赶上来了，差距已经非常小了，而且国内模型走开源方案，尤其是Qwen系列，像[Qwen3.6-27B](https://huggingface.co/Qwen/Qwen3.6-27B)这类小模型，本地PC也有了玩上大模型的机会

## agent基座

### [Cursor](https://www.cursor.com)

最先起头的 AI-first 编辑器，由 Anysphere 开发。Cursor 用 Tab 自动补全、Composer（现已升级为 Composer 2）和 Agent 模式重新定义了 AI 编程体验。截至 2025 年 8 月已有 4 万付费用户，NVIDIA CEO 黄仁勋公开表示"4 万工程师全部在用"。Karpathy 本人也是 Cursor 用户，他评价 Cursor 提供了一个"自主性滑块"——从 Tab 补全到 Cmd+K 定点编辑，再到完全自主的 agent 模式，开发者可以自由控制交给 AI 的自主程度。

Cursor 在早期引领了这一波 AI 编程浪潮，但随着后续 agent 基础设施（如 MCP、Skills、长时间自主运行）成为核心战场，Cursor 在这方面的跟进速度不如 Claude Code 等 CLI 工具。

### [Claude Code](https://code.claude.com)

Anthropic 的官方 CLI Agent，可以说是当前 vibecoding 生态的核心基础设施提供者。Claude Code 率先在工程层面整合了 MCP（Model Context Protocol）来标准化工具与外部系统的接入，同时引入了 Skills 机制让 agent 能力模块化和可复用。它支持终端、VS Code、JetBrains、桌面应用、Web 浏览器等多种使用场景。

Claude Code 的设计理念偏向"安全自主"——它在工具编排上非常完备（支持子 agent 并行工作、GitHub Actions 集成、定时任务等），但同时对高风险操作（如 git push --force、rm -rf 等）有明确的确认机制。这种"框架内的自主"让它成为很多专业开发者的首选：你可以在它的框架里放心 vibe，因为它会在你快要搞砸的时候停下来问你。

目前 Claude Code 支持通过 MCP 连接 Google Drive、Jira、Slack 等外部系统，支持 CLAUDE.md 项目级指令文件、自动记忆和 Git 工作流深度集成。

### [Codex CLI](https://github.com/openai/codex)

OpenAI 的官方终端编码代理，使用 Rust 构建，轻量且高效。截至 2026 年 5 月 GitHub 约 80.8k Star。Codex 与 ChatGPT 账号体系打通，ChatGPT Plus/Pro 用户可直接使用。支持终端 CLI、VS Code/Cursor 扩展、桌面应用（`codex app`）和 Web 端（chatgpt.com/codex）。

Codex 的设计哲学偏向"协作感"——它强调频繁的进度同步（commentary 机制），鼓励 agent 主动推进任务而不是被动等待指令。和 Claude Code 的"谨慎代理"风格不同，Codex 更像一个持续结对、主动推进的工程搭档。它的提示词明确鼓励"先读代码再动手"、"默认直接落地"、"遇到障碍先自行解决"。

Codex 目前支持沙箱模式（workspace-write）、权限升级请求机制、skills 系统和 MCP 集成。对于已经使用 ChatGPT 生态的用户来说，它是接入成本最低的终端 agent 方案。

### [OpenCode](https://github.com/anomalyco/opencode)

开源界的黑马，由 anomalyco 团队开发，GitHub 约 157k Star。100% 开源（MIT 协议），不绑定任何模型供应商——可以使用 Claude、OpenAI、Google 乃至本地模型。支持终端 TUI、桌面应用（Beta）和 client/server 架构，可以远程驱动。

OpenCode 的理念是"少提问、直接执行"，把规则压得很薄，追求极简高效。它内置两个 agent 模式：`build`（全权限，日常开发）和 `plan`（只读，分析和代码探索）。它的终端界面设计友好（毕竟团队也是 neovim 用户和 terminal.shop 的创造者），对开发者体验的把控非常出色。

模型无关的设计让 OpenCode 在模型快速迭代的当下有独特的优势——你可以随时切换到最新的最强模型，而不被某个供应商锁定。

### [Augment Code](https://www.augmentcode.com)

针对大型项目的差异化选手，由 Augment Code 公司开发。核心卖点是 ACE（Augment Context Engine）——通过实时、语义化的代码库索引来做上下文精选，而不是暴力 dump 整个代码库。在 SWE-Bench Pro Leaderboard 上的 Agent 模式得分 51.80%（使用 Opus 4.5），领先于 Cursor 的 50.21% 和 Claude Code 的 49.75%。

Augment 的上下文引擎不只是简单的 grep 或关键词匹配，而是对代码进行语义索引和关系理解——知道哪些服务互相依赖、哪条调用链经过哪些模块、哪些代码已经废弃、哪些模式是团队重复使用的。这在百万行级别的项目中尤其有价值，因为大型项目的第一问题从来不是"模型不够强"，而是"上下文不够准"。

Augment 最近还推出了 Cosmos 平台——一个跨人类、agent、代码、工具、策略和记忆的工程操作系统级产品。如果你在维护体量庞大、依赖复杂的企业级项目，Augment 的上下文质量可能比其他工具好一个档次。

### [OpenClaw](https://github.com/openclaw/openclaw)

定位独特的个人 AI 助手，由 Peter Steinberger 和社区开发，GitHub 约 370k Star。和前面的硬核 coding agent 不同，OpenClaw 更像一个"让不会编程的人也能自动化日常事务"的平台。

它支持 WhatsApp、Telegram、Slack、Discord、Signal、iMessage、微信、QQ 等 20+ 消息通道，可以直接在聊天里指挥 agent 干活。支持 Voice Wake + Talk Mode（macOS/iOS/Android）、Live Canvas、浏览器自动化、定时任务等。通过 skills 机制（ClawHub 注册表）可以扩展能力。

OpenClaw 的定位让它在 vibecoding 生态里占据了一个特殊位置——它处理的不是"写代码"，而是"用 agent 替代重复性劳动"。适合自动化、脚本化、日常工具类的 vibe 场景。它的安全模型也很完善：DM 默认需要配对码验证，非主会话可以放在 Docker 沙箱里运行。

### [Hermes Agent](https://github.com/NousResearch/hermes-agent-self-evolution)

由 Nous Research 开发，最独特的地方在于它**用 AI 来优化 AI**。Hermes Agent 使用 DSPy + GEPA（Genetic-Pareto Prompt Evolution，遗传-帕累托提示进化）算法，自动进化优化 agent 自身的 skills、提示词、工具描述甚至代码——通过反思性进化搜索（reflective evolutionary search）产出可量化更好的版本。

它的工作方式是：读取当前 skill/prompt/tool → 生成评估数据集 → GEPA 优化器读取执行追踪（不只是知道"失败了"，还知道"为什么失败"）→ 提出针对性改进 → 生成候选变体 → 评估筛选 → 通过约束门（测试必须 100% 通过、skill 文件不能超过 15KB 等）→ 最终以 PR 形式提交到主仓库。

整个过程不需要 GPU 训练，全部通过 API 调用完成——变异文本、评估结果、选择最优变体，单次优化运行成本约 $2-10。GEPA 算法已在 ICLR 2026 获得 Oral 论文接收。

Hermes Agent 代表了一个很有想象力的方向：当 agent 基础设施足够成熟后，**agent 是否能够自我改进？** 如果 vibecoding 的终极目标是"你只需要说清楚想要什么"，那么 Hermes Agent 试图回答的就是"agent 能不能自己不断变得更擅长理解你的需求"。

## 最后

回到起点——什么是 vibecoding？Karpathy 说"fully give in to the vibes"，Simon Willison 说"接受代码而不完全理解"，而我更愿意把它理解成**当 agent 基础设施足够成熟后，编程自然会浮现出来的一种新工作方式**。

它不是要取代传统编程，而是在传统编程之上增加了一个新的抽象层。这个抽象层的厚度，取决于前面几篇文章讲过的东西：提示词工程把行为边界写清楚，上下文工程把信息密度做高，MCP 把工具接稳，Skills 把能力模块化，通讯协议把协作理顺。

vibecoding 能不能靠谱，最终不取决于模型有多聪明，而取决于这一整套基础设施能给你多大的**安全放手空间**。

下一篇，聊 agent workflow。