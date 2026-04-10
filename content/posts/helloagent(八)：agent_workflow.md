+++
title = "helloagent(八)：agent_workflow"
date = 2026-03-25
authors = ["ruoshui"]

[taxonomies]
tags=["agentic-coding"]

[extra]
comment = true
repo_view = true
+++

# RsWorkflow

`RsWorkflow` 是个人编写的面向 Claude Code（可拓展至Opencode）的命令规范，目标是把复杂开发任务拆成一条可控、可验证、可中断续跑的流水线。

仓库包含一下内容：

- `rsspec/*.md`：RsSpec 工作流命令定义（核心）
- `prompt/CLAUDE.md`：建议配套使用的全局提示词模板（工作流配套提示词）
- `skills_collection/*`：当前工作流中可提供选择的skills集合
- `doc/*`：配套工作流的设计过程及设计思想

## Agent到Agent结队编程
[Agent-to-Agent Pair Programming](https://axeldelafosse.com/blog/agent-to-agent-pair-programming)
最好的代理工作流程通常看起来很像人类协作。 

多代理工作流程，主要协调器将任务分配给工作人员。这与大多数人类团队的运作方式类似。 Claude Code“代理团队”和 Codex“多代理”功能的工作原理类似，子代理向主代理报告。未来，子代理可以像人类一样相互交互。

追求模仿人类与多个代理工具和程序员使用的另一个工作流程的协作的想法：结对编程。结对编程还是“敏捷开发”提出的理念呢😅😅😅😅😅

如果说多 Agent 协作回答的是“谁和谁一起做”，那么真正落地时还要继续回答另一个问题：这些 Agent 应该按什么节奏协作、在什么节点交换上下文、又靠什么机制保证任务不跑偏。

所以，对我来说，Agent 到 Agent 的结队编程并不只是一个有趣的协作想象，它最终会落到一套可执行的工程流程上。下面这部分，就是我把这种协作方式具体收敛成 `RsWorkflow` 的设计思路。


## 设计思路
#### 基于RPI(Research收敛约束-Plan消灭决策点-Implementation机械执行并验证)编码理论的完整流程：
![RPI流程](https://image.aruoshui.fun/i/2026/03/27/o44q2p-2.webp)
R:
  - R1 问题定义：目标、范围、非目标
  - R2 约束收敛：代码现状、依赖、版本、风险
  - R3 成功判据：可观察、可验证

P:
  - P1 方案定稿：技术选择、接口、数据、异常
  - P2 任务拆分：顺序、依赖、检查点
  - P3 验证设计：单测、集成、回归、PBT

I: 
  - I1 实现：按任务执行
  - I2 Review：代码评审、风格收敛
  - I3 验收：对照成功判据关闭任务

#### 融合spec和多模型协作让claued code更适用于复杂场景、长时间编码任务 
   
spec是 spec-driven development 的 CLI 框架，核心思想是做人与大模型的规范层。

AI 编程助手功能强大，但如果需求只藏在对话中，一个是不可预测性，第二个是不便于分析回顾。同时面对相对复杂的任务，就算你启动了claude code 的plan模式生成todo list，再冗长上下文下，这部分依然会注意力涣散。所以需要一个类似规范手册做持久化记录的工具

![Spec](https://image.aruoshui.fun/i/2026/03/27/pcfddn-2.webp)
Spec 添加了一个轻量的规范层，规范AI在R和P阶段所写的文档能够交由spec做管理。
- 先对齐需求再动手 —— 人与 AI 在写代码前先就需求、规范达成一致
- 保持有序 —— 每项变更都拥有独立文件夹，含提案、规范、设计与任务
- 开发过程驻留本地 — 随时更新任何产物，没有僵化的阶段门槛

`rsspec` 保留了 OpenSpec 的核心产物结构  
每个变更还是落在 proposal、spec、design、tasks 这一套规范里，保证变更是可审查、可追踪、可验证的。

`rsspec` 把 OpenSpec 的规范层前后延展了  
在规范之前增加 `Research`，先把本地代码约束、外部文档事实、风险和成功判据收敛出来；在规范之后增加面向实现的机械执行与 review 流程。

`rsspec` 把 OpenSpec 变成更适合长任务的 Agent 工作流  
我把不同阶段拆成独立上下文，中间可以随时 `/clear`，避免长会话把模型拖乱；同时用不同模型分别处理本地代码理解、外部事实检索、后端逻辑、前端实现和交叉评审。

#### 结合oh-my-opencode多模型编排的思想，多模型协作完成开发任务

![模型选择](https://image.aruoshui.fun/i/2026/03/27/pif0kd-2.webp)
 - claude系列模型在**执行agent及工具调用**等方面表现良好，尤其是Opus模型，非常适合用来做项目整体的规划及把控
 - codex模型严谨，同时编写后端代码能力很强，相比claude模型便宜，用来**开发后端性价比高**
 - gemini模型以**多模态能力**著称，在前端等依赖视觉等因素的场景表现良好，非常使用用来编写项目的前端代码
 - grok模型**开放性**强，同时搜索能力远超其他模型，搭建mcp配合搜索travily可以实现高质量的文档搜索甚至爬虫等功能

#### 手动分割上下文，有效利用模型最佳上下文
   该部分详细看：*helloagent(三)：context上下文工程.md* 
   基于spec，每一个RPI过程都视为独立过程，中途可以随时`/clear`清空上下文，保证模型的最佳窗口能够得以利用。建议每5个任务完成之后就`/clear`一次，保持claude code 干爽。


## 工作流总览

| 阶段 | 命令 | 输入 | 输出 | 关键依赖 |
|---|---|---|---|---|
| 安装 | `/rsspec:install` | 当前机器环境 | 依赖安装状态、MCP 连通状态 | Node.js、npm、npx |
| 初始化 | `/rsspec:init` | 当前项目目录 | `openspec/` 结构、环境检查结果 | `openspec` |
| Research | `/rsspec:research` | 用户需求 | proposal 初稿、约束集合、开放问题 | `ace-tool`、`grok-search` |
| Plan | `/rsspec:plan [proposal_id]` | proposal ID | 零决策计划、PBT 属性、通过校验的 spec | Codex MCP、Gemini MCP、`grok-search` |
| Implementation | `/rsspec:implementation` | proposal ID / active change | 代码实现、review 结果 | Codex MCP、Gemini MCP |

## 配套mcp及说明
该工作流配套4个MCP

### 1. `ace-tool`

- 作用：用于本地代码库上下文检索，是整个工作流最基础的代码理解能力。
- 典型工具：`mcp__ace-tool__search_context`、`mcp__ace-tool__enhance_prompt`
- 主要阶段：`Research`
- 使用边界：
  - 适合查本地项目结构、调用链、相关文件、已有实现模式。
  - 不适合拿来查第三方框架最新文档、在线 API 行为、训练截止后的实时信息。
- 在本工作流中的定位：Research 阶段优先使用它来减少 `grep/find/search`，先把本地代码约束收敛清楚。

### 2. `grok-search`

- 作用：用于联网搜索、官方文档抓取、站点遍历，以及版本敏感行为核实。
- 典型工具：
  - 配置与状态：`mcp__grok-search__get_config_info`
  - 搜索规划：`plan_intent`、`plan_complexity`、`plan_sub_query`、`plan_search_term`、`plan_tool_mapping`、`plan_execution`
  - 执行工具：`web_search`、`get_sources`、`web_fetch`、`web_map`
  - 环境控制：`switch_model`、`toggle_builtin_tools`
- 主要阶段：`Research`、`Plan`
- 使用边界：
  - 适合第三方库文档、SDK 用法、云平台行为、版本差异、实时网页信息。
  - 不适合替代本地代码检索；本地项目理解仍应优先交给 `ace-tool`。
- 在本工作流中的定位：当需求依赖外部事实来源时，用它补足“当前世界是什么样”，再和本地代码约束一起汇总进 proposal / spec。

### 3. `codex`

- 作用：用于后端逻辑、算法、系统约束、测试属性提炼，以及实现阶段的代码原型与 review。
- 典型工具：`mcp__codex__codex`
- 主要阶段：`Plan`、`Implementation`
- 使用边界：
  - 更适合 API、数据流、业务逻辑、调试、测试策略、PBT 属性提炼。
  - 输出只能作为原型或审查意见，不能直接替代本地最终实现。
- 在本工作流中的定位：
  - Plan 阶段用来找剩余歧义、抽取性质与不变量。
  - Implementation 阶段更偏后端与逻辑任务原型生成及 review。

### 4. `gemini`

- 作用：用于前端、多模态、界面结构、视觉相关实现建议，以及实现阶段的代码原型与 review。
- 典型工具：`mcp__gemini__gemini`
- 主要阶段：`Plan`、`Implementation`
- 使用边界：
  - 更适合前端页面、组件、样式、多模态理解、交互结构设计。
  - 和 Codex 一样，输出只能作为参考原型，不能直接落盘。
- 在本工作流中的定位：
  - Implementation 阶段更偏前端/UI/样式任务。
  - 同时也参与多模型 review，用来和 Codex 交叉校验盲区。

### 配合方式

- `ace-tool` 负责回答：**本地代码现在是什么样**。
- `grok-search` 负责回答：**外部文档和在线事实现在是什么样**。
- `codex` / `gemini` 负责回答：**在明确约束后，应该如何实现与审查**。

简单理解就是：

- `Research`：`ace-tool` + `grok-search`
- `Plan`：`codex` + `gemini` + 必要时 `grok-search`
- `Implementation`：`codex` / `gemini` 双模型原型与 review


## 可选skills

skills 不是该工作流的硬依赖，但在特定场景下可以显著提高效率。它们更像“按需加载的专长包”，用于补足某一类任务的知识密度，而不是替代主工作流本身。

### 使用原则

- 优先级上，`rsspec` 主流程永远高于 skill。
- skill 适合补充某个垂直领域知识，不适合替代 `Research → Plan → Implementation` 主链路。
- 如果 skill 与项目现状、OpenSpec 约束或 MCP 检索结果冲突，应以项目代码、spec 和外部文档事实为准。

### 当前仓库收录的可选 skill 来源

#### 1. `Anthropic`

- 说明文件：`skills_collection/Anthropic/readme.md`
- 适合场景：
  - `frontend-design`：需要快速生成高质量前端界面、Landing Page、Dashboard 视觉方案时
  - `skill-creator`：当你想为当前工作流继续扩展新的 skill 时
- 推荐用途：更偏前端设计辅助、skill 体系扩展

#### 2. `Anthony Fu's Skills`

- 说明文件：`skills_collection/Anthony Fu's Skills/readme.md`
- 适合场景：
  - Vue / Nuxt / Pinia / Vite / Vitest / UnoCSS / pnpm 等前端技术栈项目
  - 需要快速对齐某个框架的最佳实践、配置方式、测试方式时
- 推荐用途：当前端项目技术栈非常明确时，把 skill 当作“领域知识包”接入

#### 3. `agent-toolkit`

- 说明文件：`skills_collection/agent-toolkit/readme.md`
- 当前主要收录：`commit-work`（可理解为“整理改动并生成规范提交”）
- 适合场景：
  - 用户明确要求整理改动并生成高质量 git commit
  - 希望把本次工作拆成逻辑清晰的多个提交时
- 推荐用途：作为交付收尾阶段的辅助能力，而不是开发主流程的一部分

#### 4. `vercel_lab`

- 说明文件：`skills_collection/vercel_lab/readme.md`
- 当前主要面向：`agent-browser` 一类浏览器 / 交互代理方向能力
- 适合场景：
  - 需要浏览器操作、页面交互验证、真实网页观察时
  - 任务本身偏 Web agent / browser automation 时
- 推荐用途：更偏扩展实验能力，不是当前 RsWorkflow 的默认组成部分

