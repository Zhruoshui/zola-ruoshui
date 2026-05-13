+++
title = "helloagent(五)：MCP 模型上下文协议"
date = 2026-03-22
authors = ["ruoshui"]

[taxonomies]
tags=["agentic-coding"]

[extra]
comment = true
repo_view = true
+++

# MCP：大模型接世界的"USB-C 接口"

理解 MCP，有一个比喻几乎是所有资料都在用的：**MCP 像 AI 应用的 USB-C 接口**。USB-C 的价值不在于它支持什么设备，而在于它让不同设备能通过同一套物理接口连接在一起。MCP 也一样：它不关心你连的是数据库、文件系统还是第三方 API，它只定义一套标准，让 LLM 能用统一的方式去调用它们。


## MCP 到底是个什么东西

MCP（Model Context Protocol，模型上下文协议）是 Anthropic 提出的一种开放协议，目标是让 LLM 应用与外部数据源、工具、服务之间实现标准化集成。

如果类比网络协议，HTTP 定义了浏览器和服务器怎么交互，SMTP 定义了邮件系统怎么发信，那 MCP 定义的就是 AI 模型和外部世界怎么对接。

它的核心思路其实很简单：**模型本身不应该内置所有能力，但它需要一套统一的方式去访问外部工具、资源和工作流。** 把这句话展开，MCP 要解决的是三个问题：

1. **怎么描述能力**：外部系统有什么工具、什么资源、什么提示模板
2. **怎么发起调用**：模型如何请求外部系统执行操作
3. **怎么返回结果**：外部系统如何把结果送回模型上下文

这三件事听起来简单，但在没有 MCP 之前，每个 AI 应用都在重复造轮子——自己定义工具格式、自己写调用逻辑、自己处理错误。MCP 的价值就是把这件事标准化了。

## MCP 的架构：四层结构

MCP 官方文档把它的架构拆成四个部分：

| 角色 | 职责 | 类比 |
| --- | --- | --- |
| **Host（主机）** | 期望从服务器获取数据的 AI 应用，如 IDE、聊天机器人 | 你的电脑 |
| **Client（客户端）** | 主机与服务器之间的桥梁，负责消息路由、协议协商 | USB-C 线缆里的控制器 |
| **Server（服务器）** | 提供外部数据和工具的组件，暴露工具、资源、提示模板 | 外接设备（硬盘、显示器） |
| **Base Protocol（基础协议）** | 定义消息格式、生命周期管理、传输机制 | USB-C 协议本身 |

这个架构的关键设计是：Host 和 Server 不直接通信。Host 通过 Client 去连接 Server，Client 负责维护一对一连接、做消息路由、管理能力协商。这层隔离意味着：

- Host 不用关心 Server 的底层实现
- Server 可以独立开发、独立部署、独立更新
- 多个 Host 可以共享同一个 Server 实例

![MCP 架构](https://www.runoob.com/wp-content/uploads/2025/03/model-context-protocol-architecture.webp)

举个实际例子：你在 Claude Code 里想查询一个 PostgreSQL 数据库。Claude Code 是 Host，MCP Client 内嵌在 Claude Code 里，PostgreSQL MCP Server 是独立运行的一个进程。Host 通过 Client 连接到 Server，Server 把数据库的表结构暴露成"资源"，把 SQL 查询暴露成"工具"。模型需要数据时，调用工具，Server 执行查询，结果返回。

整个过程里，模型不知道数据库的 IP 地址、端口号、用户名密码——这些都由 MCP Server 管理。模型只知道"有一个工具叫 query，参数是 sql 字符串，返回查询结果"。这就是 MCP 的"工程化封装"。

## MCP 的通信：JSON-RPC 2.0

MCP 的底层通信基于 **JSON-RPC 2.0**，这是一个非常轻量的远程过程调用协议。选它是有道理的：
- JSON 是所有语言都能解析的
- RPC 的调用模式天然匹配"模型请求工具 → 工具返回结果"
- 协议本身无状态，适合独立 Server 实例

MCP 定义了三种基本消息类型：

### 1. 请求（Requests）

客户端发给服务器，或者服务器发给客户端，带唯一 `id`，期望得到响应。

```json
{
  "jsonrpc": "2.0",
  "id": "1",
  "method": "tools/call",
  "params": {
    "name": "query_database",
    "arguments": { "sql": "SELECT * FROM users" }
  }
}
```

### 2. 响应（Responses）

对请求的答复，包含 `id` 做关联。成功返回 `result`，失败返回 `error`。

```json
{
  "jsonrpc": "2.0",
  "id": "1",
  "result": {
    "content": [{ "type": "text", "text": "..." }]
  }
}
```

### 3. 通知（Notifications）

单向消息，不需要回复。通常用于事件推送或状态更新。

```json
{
  "jsonrpc": "2.0",
  "method": "notifications/resources/updated",
  "params": { "uri": "file:///project/config.json" }
}
```

这三种消息覆盖了 MCP 的全部通信场景：调用（请求-响应）、推送（通知）、错误处理（响应中的 error 字段）。

## MCP 的传输层：Stdio 和 SSE

### Stdio（标准输入输出）

最常用的传输方式。MCP Server 作为一个子进程运行，通过 stdin/stdout 和 Client 通信。每个 JSON-RPC 消息就是一行 JSON，中间用换行符分隔。

这种方式的好处是：
- 零网络配置，启动即连
- 天然隔离，Server 挂了不影响 Host
- 适合本地工具：文件系统、数据库、本地脚本

坏处也很明显：只能本地，不能远程。

### SSE（Server-Sent Events）

用于需要 Server 主动推送的场景，比如资源变更通知。它基于 HTTP，Server 通过长连接持续向 Client 推送事件流。适合需要"Server 主动告诉 Client 数据变了"的场景。

MCP 的生命周期也分三个阶段：
1. **初始化**：Client 和 Server 握手，交换能力列表、协议版本
2. **运行**：正常工作，收发请求、响应、通知
3. **关闭**：断开连接，释放资源

## MCP 的三种核心原语：Tools、Resources、Prompts

很多人以为 MCP 就是"让模型调用函数"，其实 MCP 暴露给模型的能力有三种，各有不同的语义。

### Tools（工具）

模型可以**主动调用**的、带副作用的操作。比如执行 SQL、发邮件、创建文件。Tool 的定义包含名称、描述、参数 JSON Schema。

关键是：**Tool 由模型决定何时调用，不是由用户触发。** 这点跟传统的 API 调用完全不一样——不是人点击按钮触发，而是模型在推理过程中判断"现在需要查数据库了"，然后调用工具。

### Resources（资源）

模型可以**读取**的结构化数据，通常是无副作用的。比如文件内容、数据库表结构、API 文档。Resource 用类似 URI 的方式标识（比如 `file:///project/README.md`），并且可以订阅变更通知。

Resource 和 Tool 的区别在于：Resource 是"给你看的数据"，Tool 是"替你做的操作"。读文件是 Resource，修改文件是 Tool。

### Prompts（提示模板）

预定义的提示词模板，让模型更容易理解如何使用某些特定的工具组合。可以把 Prompts 理解为"Server 自带的说明书"——当模型连上一个 Server，Prompts 告诉它"我是干什么的，你可以怎么用我"。

## MCP 的核心特性

总结起来，MCP 有四个关键特性：

1. **标准化接口**：不管后端是 MySQL 还是 Slack API，对模型来说都是同一套 Tool/Resource 描述
2. **动态发现**：模型不需要预先知道所有工具，连接 Server 后可以动态获取能力列表
3. **上下文感知**：Server 可以维护自己的状态，而不是每次调用都从零开始
4. **开放可扩展**：任何人都可以写自己的 MCP Server，生态在快速膨胀

## MCP 和 Skill
MCP和Skill都是典型的agent外部能力，拓展原有模型不具备的功能，各有侧重点：

**Skill 更偏向于对团队经验、个人经验的汇总，以及业务流程、操作流程的规范化，让大模型知道该按照什么步骤去做。** Skill 存在于每个 Agent 下面都有一份，管理相对复杂，一个更新必须全部都要去更新一遍（当然管理可以使用 Git 统一进行版本管理）。

**MCP 更偏向于工程化能力。** 对于获取数据库数据、获取实时数据、连接外部服务，这块使用 MCP 去做会更好。MCP 的工程化能力更强，可以对数据库连接等做管理，一直提供服务，而不像 Skill——用完之后下次再用，大模型还需要再次加载。而 MCP 只告诉大模型有什么工具可用，以及什么时候使用。

![分工合作](https://image.aruoshui.fun/i/2026/05/09/dsqzf0-2.svg)


## MCP 的应用场景

MCP 目前已经在很多产品里落地了，比较典型的场景：

1. **数据库访问**：模型通过 MCP Server 直接查询 SQL 数据库，不需要人工导出数据再喂给模型
2. **文件系统操作**：模型可以读文件、写文件、列出目录、搜索代码库
3. **外部 API 集成**：连接 Slack、Gmail、GitHub Issues，让模型能在对话里直接操作
4. **知识库检索**：连接向量数据库或文档库，作为模型的长期记忆
5. **代码执行**：连接沙箱环境，让模型在隔离环境里运行和测试代码

Claude Code、OpenCode、Cursor、Windsurf 这些编码工具都已经深度集成了 MCP。以 OpenCode 为例，它内建了大量工具，同时也支持用户通过 MCP 扩展自己的工具——比如连接 Notion、Jira、自定义 API 等。

## MCP 的工程意义

### 1. 解耦了模型能力和基础设施

没有 MCP 时，每个 AI 应用都要自己想办法连接数据库、调用 API。有了 MCP，这些变成标准化的 Server 组件，模型只负责推理和决策，基础设施完全外置。

### 2. 让工具成为可复用的基础设施

一个团队写好了 PostgreSQL MCP Server，其他团队可以直接用，不需要重新实现。这让工具开发从"每个项目写一遍"变成了"社区共建一个生态"。

### 3. 降低了模型调用的上下文成本

MCP 的工具发现机制是动态的，模型不需要一开始就知道所有工具的参数定义。Server 只暴露工具的名称和简短描述，详细参数在调用时才加载。这比传统 function calling 的"全量注入"方式大大节省了上下文 token。

### 4. 支持长连接和状态维护

数据库连接、文件句柄、会话状态——这些是 Skill 模型无法处理的。MCP Server 作为长期运行的进程，可以自然地管理这些长连接和状态。

MCP + Skill 的组合，其实就是 Agent 外部能力的完整拼图：MCP 负责实时的、工程的、有状态的能力接入；Skill 负责静态的、经验的、流程性的知识注入。两者合在一起，才是一个 Agent 真正能工作的基础。

## 参考资料

1. [Model Context Protocol 官方介绍](https://modelcontextprotocol.io/introduction)
2. [MCP 协议规范](https://spec.modelcontextprotocol.io/)
3. [菜鸟教程：MCP 协议](https://www.runoob.com/np/mcp-protocol.html)
4. [Datawhale《Hello Agents》第十章：智能体通信协议](https://datawhalechina.github.io/hello-agents/#/./chapter10/%E7%AC%AC%E5%8D%81%E7%AB%A0%20%E6%99%BA%E8%83%BD%E4%BD%93%E9%80%9A%E4%BF%A1%E5%8D%8F%E8%AE%AE)
5. [Anthropic: Introducing the Model Context Protocol](https://www.anthropic.com/news/model-context-protocol)
6. [OpenCode MCP 集成文档](https://opencode.ai/docs/mcp)
7. [5分钟手把手带你开发一个mcp服务](https://zhuanlan.zhihu.com/p/1892865724239828692)