+++
title = "helloagent(四)：agent通讯协议"
date = 2026-03-21
authors = ["ruoshui"]

[taxonomies]
tags=["agentic-coding"]

[extra]
comment = true
repo_view = true
+++

# Agent Communication：多个 Agent 到底怎么“说话”

过去几篇文章里，我一直在讲单个 Agent 怎么理解任务、管理 prompt、维护 context。但当系统从一个 Agent 变成多个 Agent 之后，一个更底层的问题就会冒出来：

> 多个智能体之间，底层到底是怎么通信的？

很多人第一次接触多智能体，容易把它想成一群模型在“彼此聊天”。这个理解不能说完全错，但还是太表面了。真实系统里，Agent 协作通常不是某种神秘的 AI 内部语言，而是几层很具体的工程机制：能力描述、任务对象、消息结构、状态流转、文件引用、推送回调、鉴权机制，以及最底下依然非常传统的 `HTTP`、`JSON-RPC`、`SSE`、`webhook` 这些网络通信方式。

这篇文章结合 Datawhale《Hello Agents》第十章、A2A 官方规范、Anthropic 和 OpenAI 的多智能体工程材料，现在需要关注以下的问题：

- 多个 Agent 协作时，底层到底在交换什么
- `MCP`、`A2A`、`ANP`、`AGORA` 分别解决哪一层问题
- 在真实工程里，多智能体并不是只靠“协议”就能协作，它还依赖怎样的编排方式

因为下一篇会专门展开 `MCP`，所以这一篇对 MCP 只做定位，不做细节展开。

## 多个 Agent 协作时，底层到底在传什么

先说结论：**Agent 之间传递的，通常不是“完整大脑”，而是经过约束和裁剪后的任务信息。**

这些信息大致有几类：

- **能力描述**：我是谁，我能做什么，我支持什么输入输出
- **任务对象**：当前任务 ID、任务状态、上下文 ID、取消与重试信息
- **消息内容**：用户请求、中间结论、结构化参数、文件引用
- **产出物**：文档、图片、表格、结构化数据，或者更常见的压缩摘要
- **协作控制信息**：谁接管下一轮、何时停止、失败后怎么回退

这件事之所以重要，是因为多智能体系统并不会把每个 Agent 的内部状态、记忆和推理过程原样共享出去。A2A 官方规范在介绍里就说得很清楚，它的目标是让不同 Agent **在不暴露彼此内部状态、记忆和工具实现的前提下**完成协作。这一点其实很关键：协议关注的是“怎么互相操作”，而不是“怎么彼此透明”。

![Agent2Agent](https://image.aruoshui.fun/i/2026/03/20/fbf8cr-2.webp)

所以从工程视角看，多智能体通信更像团队协作：

- 你不需要把每个人脑子里的所有念头都同步出去
- 你需要的是明确的角色描述、可交付物、任务状态和必要上下文（通常交由主Agent来干这件事）
- 你还需要一套大家都认得的格式，让系统能稳定地接上

## 真实系统里，Agent 不一定是在“直接互发消息”

如果只看产品演示，很容易以为所有多 Agent 都在走统一的 agent-to-agent 网络协议。其实大量系统根本不是这样。

在同一个运行时里，所谓“多个 Agent 协作”，很多时候只是**编排器在切换活跃角色**。

[OpenAI Swarm](https://github.com/openai/swarm) 的 README 就很典型。它把多 Agent 协调压缩成两个原语：

- `Agent`
- `handoff`

Swarm 的 `client.run()` 循环做的事情，本质上是：取当前 Agent 的输出、执行工具、必要时切换到另一个 Agent、继续跑下一轮。也就是说，这里的“通信”首先不是互联网协议，而是**运行时里的状态传递和控制权转移**。  



[OpenAI Agents SDK](https://openai.github.io/openai-agents-python/) 则把这种编排进一步总结成两种常见模式：

- **Agents as tools**：主 Agent 保留控制权，把子 Agent 当成专用工具调用
- **Handoffs**：主 Agent 把会话直接交给另一个专长 Agent

这两种模式的差异，本质上不是传输协议差异，而是**上下文所有权**差异：

- 如果主 Agent 要统一收口，那子 Agent 更像工具
- 如果某个专长 Agent 应该接管后续交互，那就做 handoff

这也是我越来越认同的一点：**多 Agent 的通信，首先是任务分工和上下文管理问题，其次才是协议问题。**

## 从工具到网络：几种协议分别在解决什么

把目前常见的协议放在一起看，会更容易发现它们其实不在同一个层级上。

| 协议 | 主要通信对象 | 核心问题 | 设计关键词 | 更适合的场景 |
| --- | --- | --- | --- | --- |
| `MCP` | 模型/Agent 与工具、资源 | 怎么统一接入外部能力 | 标准化工具访问、上下文连接 | 单 Agent 接工具、数据源、工作流 |
| `A2A` | Agent 与 Agent | 怎么围绕任务协作 | Agent Card、Task、Message、Artifact、流式更新 | 企业内或可信环境中的多 Agent 协作 |
| `ANP` | 开放网络中的 Agent 与 Agent | 怎么发现、认证、互联 | DID、发现、协商、开放网络 | 跨组织、跨平台的 Agent 互联 |
| `AGORA` | 大规模 LLM Agent 网络 | 怎么兼顾通用性、效率和鲁棒性 | 协议协商、例程、meta-protocol | 研究型、大规模、去中心化 Agent 网络 |

如果借用 Datawhale 第十章的框架来理解，这几种协议大致可以看成三层问题：

- `MCP` 更像“Agent 如何接世界”
- `A2A` 更像“Agent 如何接同伴”
- `ANP` 更像“Agent 如何接整个开放网络”

而 `AGORA` 又再往前迈了一步，它讨论的是：**当 Agent 网络规模变大后，大家能不能先用自然语言对齐，再逐渐协商出更高效的通信例程。**

## MCP：它更像工具协议，而不是 Agent 之间的协议

先把 MCP 放到正确位置上。

[MCP 官方介绍](https://modelcontextprotocol.io/introduction) 把它定义为一种开放标准，用来把 AI 应用连接到外部系统。官方给的比喻也很直白：`MCP` 像 AI 应用的 `USB-C` 接口。

所以严格一点说，MCP是：

- Agent 和工具之间的标准接口
- Agent 和资源之间的上下文桥梁
- Agent 和外部工作流之间的连接层

`MCP` 解决的是“接能力”的问题，不是“多个独立 Agent 如何围绕任务协商”的问题。

这篇先记住这一点就够了。下一篇再专门展开 MCP 的架构和生态。

## A2A：把 Agent 协作当成任务系统来设计

如果说 MCP 是在定义“怎么接工具”，那么 `A2A` 真正开始触碰“Agent 与 Agent 怎么协作”这件事。

根据 [A2A Protocol Specification](https://raw.githubusercontent.com/a2aproject/A2A/main/docs/specification.md)，对 A2A 的定位是：

- 面向独立、异构、甚至彼此 opaque 的 Agent 系统
- 让它们可以发现彼此能力
- 协商交互模态
- 围绕任务进行协作

A2A 最有意思的地方，在于它没有把“通信”理解成一来一回的文本聊天，而是直接把协作抽象成一套任务模型。它的核心概念包括：

- `Agent Card`：描述一个 Agent 的身份、能力、技能、服务地址和认证需求
- `Message`：一轮消息，本身又可以由多个 `Part` 组成
- `Task`：协作的基本工作单元，带有明确生命周期
- `Artifact`：任务产出物，比如文档、文件、结构化结果

更关键的是，A2A 从一开始就是 **async first** 的。它默认多 Agent 协作里会出现：

- 长时间运行的任务
- 流式状态更新
- 异步推送
- 甚至 human-in-the-loop

所以在传输层上，它复用了很多成熟的 Web 机制：

- `HTTP/REST`
- `JSON-RPC 2.0`
- `gRPC`
- `SSE`
- `webhook`

## ANP：把 Agent 互联当成“Agentic Web”基础设施

`ANP` 的野心比 A2A 更大。

[ANP 官方站点](https://agent-network-protocol.com/) 直接把自己描述成 **“The HTTP of the Agentic Web Era”**。在 [官方 Guide](https://www.agent-network-protocol.com/guide) 里，它把自己定义为一个面向开放互联网的开源智能体通信协议，目标是让 Agent 可以在互联网上被发现、被认证、被连接，并安全地协作。

和 A2A 相比，ANP 关心的不只是“两个 Agent 如何把一个任务做完”，而是：

- 一个 Agent 在开放网络上如何拥有身份
- 它怎么被发现
- 怎么和陌生 Agent 建立可信连接
- 怎么在跨组织、跨平台条件下完成协作

![ANP](https://image.aruoshui.fun/i/2026/03/20/gk21jc-2.webp)

所以它的设计明显更偏“网络基础设施”，官方文档把它拆成三层：

- **Identity Layer**：基于 `W3C DID` 做身份与加密通信
- **Meta-Protocol Layer**：负责协商通信方式
- **Application Layer**：负责能力描述、发现和应用协议

它使用的底层也更接近 Web：

- 传输上主要基于 `HTTP`
- 数据组织使用 `JSON-LD`
- 发现机制会用到 `.well-known`

ANP 官方指南里甚至直接拿它和 MCP、A2A 做过对比，结论非常清晰：

- `MCP` 适合连接工具和资源
- `A2A` 适合企业内复杂协作
- `ANP` 适合开放互联网中的 Agent 互联

这句话我觉得几乎可以当成三者分工的最短总结。

## AGORA：把协商协议本身，变成一种能力

如果说 A2A 和 ANP 更像工程规范，那么 `AGORA` 更像一条研究味很浓的路线。

[Agora 官网](https://agoraprotocol.org/) 把它定义成一种高效、稳健、去中心化的 LLM Agent 通信协议；而对应论文 [Agora - A Scalable Communication Protocol for Networks of LLMs](https://arxiv.org/abs/2410.11905) 则更明确地把它叫作一种 **meta protocol**。

当然，从当前公开资料看，AGORA 还更偏研究和实验语境，离 MCP、A2A 这种已经明显进入工程实现层的标准，还有一段距离。感兴趣可以去官网查看，暂时不做介绍。

## MCP、A2A、ANP 三种协议，设计理念到底差在哪

### 1. MCP 关注的是能力边界

MCP 的出发点是：
> 模型本身不该内置所有能力，但它需要一套统一方式去访问外部工具、资源和工作流。

所以 MCP 强调的是**标准化接入**。它默认世界上会有很多外部系统，而 Agent 需要一种统一接口去连接它们。

### 2. A2A 关注的是任务边界

A2A 的出发点是：

> 多个 Agent 不需要共享内部实现，但需要围绕同一个任务进行可跟踪、可异步、可恢复的协作。
所以 A2A 强调的是**任务对象、状态流转和产出物**。它把协作当成一套任务系统，而不是一段自由聊天记录。

### 3. ANP 关注的是网络边界

ANP 的出发点是：
> 当 Agent 走出单一产品和单一组织之后，它们需要像 Web 服务一样拥有身份、发现机制和可信连接能力。

所以 ANP 强调的是**开放网络互联**。它讨论的是 Agentic Web，而不只是一个企业工作流里的几个角色。

如果用一句最短的话概括：
- `MCP`：解决“怎么接工具”
- `A2A`：解决“怎么协作做任务”
- `ANP`：解决“怎么在开放网络里互联”

## 从 Anthropic 和 OpenAI 看，真实多 Agent 系统怎么协作

协议当然重要，但如果只讲协议，很容易误以为多智能体协作的核心在“报文格式”。真实工程不是这样。

### Anthropic：多 Agent 的本质是上下文分工和并行压缩

在 [Building effective agents](https://www.anthropic.com/research/building-effective-agents) 里，Anthropic 把很多常见模式拆得很清楚：

- routing
- parallelization
- orchestrator-workers
- evaluator-optimizer
- agents

这说明什么？说明多 Agent 首先不是协议问题，而是**编排模式问题**。

到了 [How we built our multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system) 这篇里，这个思路就更具体了。Anthropic 的 Research 系统并不是让多个 Agent 漫无目的互相聊天，而是：

- 由一个 lead agent 负责总体规划
- 把不同方向拆给多个 subagent 并行搜索
- 每个 subagent 在自己的上下文窗口里工作
- 再把压缩后的发现返回给主 Agent 汇总

> 所以说为什么大部分工作流都基于claude code，使用claude的模型来做主agent、自然是Anthropic布局的早，理念早已融入工程

这背后的关键不是“多了几个模型实例”，而是**上下文隔离**。Anthropic 甚至直接把 subagent 的价值描述成一种 compression：让不同 Agent 在各自上下文里探索，再把重要 token 压缩回来。

这件事和 [Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) 的观点完全一致。

### Anthropic：工具调用方式会直接影响 Agent 协作质量

[Introducing advanced tool use on the Claude Developer Platform](https://www.anthropic.com/engineering/advanced-tool-use) 又补上了另一层现实：Agent 一旦接入很多工具，光工具定义和中间结果就会污染上下文。

Anthropic 在这篇文章里提出的几个方向，其实都和多 Agent 协作直接相关：

- 需要按需发现工具，而不是一开始全塞进上下文
- 需要让代码环境来编排工具，而不是每一步都回到自然语言推理
- 需要把中间结果挡在模型上下文之外，只把最终关键信息交回来

换句话说，多智能体系统如果没有好的工具调用设计，通信成本、token成本将会非常快地反噬系统本身。

### OpenAI：handoff 和 agents-as-tools，其实是在定义协作关系

OpenAI 这边给我的启发主要来自两份材料：

- [Swarm README](https://raw.githubusercontent.com/openai/swarm/main/README.md)
- [OpenAI Agents SDK 多 Agent 文档](https://openai.github.io/openai-agents-python/multi_agent/)

Swarm 很早就把多 Agent 交互压成了两个最小原语：`Agent` 和 `handoff`。后来生产化的 Agents SDK 则把它进一步规范成：

- `agents as tools`
- `handoffs`

这两个模式非常值得记住，因为它们几乎对应了真实系统里两种最常见的协作关系。

![Swarm agent](https://image.aruoshui.fun/i/2026/03/20/gvkzt0-2.webp)

**第一种，主 Agent 把子 Agent 当成工具。**

这时主 Agent 负责：

- 保存主上下文
- 调用专长 Agent 完成子任务
- 汇总结果并对用户负责

**第二种，主 Agent 把会话移交给专长 Agent。**

这时 handoff 真正转移的是：

- 当前回合的控制权
- 后续响应责任
- 新一轮上下文的主视角

这说明多 Agent 协作里的“通信”，并不只是发一条消息，而是在决定：

- 谁负责最终答案
- 谁持有主要上下文
- 哪些历史要传下去
- 哪些中间过程应该被过滤掉

**handoff 其实是一种上下文所有权转移协议。**

## 协议不等于自治，协作也不等于放飞

再补一句很容易被忽略的话题。

[Measuring AI agent autonomy in practice](https://www.anthropic.com/research/measuring-agent-autonomy) 这篇研究说明，真实世界里的 Agent 正在获得更长时间的自主执行能力，但人类监督并没有消失，只是形式在变化：用户会更频繁地自动批准，也会在关键时刻打断、修正和重新定向。

这意味着，哪怕协议再完善，多 Agent 系统仍然需要：

- 权限边界
- 失败回退
- 停止条件
- 人类确认点

协议解决的是“怎么连起来”，不是“如何天然可信”。

## 我现在对 Agent 通讯协议的理解

如果把这篇压缩成一句话，我现在会这样总结：

> Agent 通讯协议，不是在发明一种神秘的 AI 语言，而是在给不同层级的协作关系定义稳定边界。

这些边界大概是：

- `MCP` 定义 Agent 和外部能力的边界
- `A2A` 定义 Agent 和 Agent 围绕任务协作的边界
- `ANP` 定义 Agent 在开放网络中发现、认证和互联的边界
- `AGORA` 则在尝试定义“协议如何被协商出来”的边界

所以协议不是为了替代编排，而是为了让编排有共同语言；不是为了让 Agent 无所不能，而是为了让不同系统之间能可靠接上。

下一篇，就单独拆 MCP。

## 参考资料

1. [Datawhale《Hello Agents》第十章：智能体通信协议](https://datawhalechina.github.io/hello-agents/#/./chapter10/%E7%AC%AC%E5%8D%81%E7%AB%A0%20%E6%99%BA%E8%83%BD%E4%BD%93%E9%80%9A%E4%BF%A1%E5%8D%8F%E8%AE%AE)
2. [Datawhale《Hello Agents》第十章原始 Markdown](https://raw.githubusercontent.com/datawhalechina/Hello-Agents/main/docs/chapter10/%E7%AC%AC%E5%8D%81%E7%AB%A0%20%E6%99%BA%E8%83%BD%E4%BD%93%E9%80%9A%E4%BF%A1%E5%8D%8F%E8%AE%AE.md)
3. [Model Context Protocol Introduction](https://modelcontextprotocol.io/introduction)
4. [A2A Protocol Specification](https://raw.githubusercontent.com/a2aproject/A2A/main/docs/specification.md)
5. [ANP Official Website](https://agent-network-protocol.com/)
6. [ANP Getting Started Guide](https://www.agent-network-protocol.com/guide)
7. [Agora Protocol](https://agoraprotocol.org/)
8. [Agora - A Scalable Communication Protocol for Networks of LLMs](https://arxiv.org/abs/2410.11905)
9. [Anthropic: Building effective agents](https://www.anthropic.com/research/building-effective-agents)
10. [Anthropic: How we built our multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system)
11. [Anthropic: Introducing advanced tool use on the Claude Developer Platform](https://www.anthropic.com/engineering/advanced-tool-use)
12. [Anthropic: Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
13. [Anthropic: Measuring AI agent autonomy in practice](https://www.anthropic.com/research/measuring-agent-autonomy)
14. [OpenAI Swarm README](https://raw.githubusercontent.com/openai/swarm/main/README.md)
15. [OpenAI Agents SDK](https://openai.github.io/openai-agents-python/)
16. [OpenAI Agents SDK: Multi-agent orchestration](https://openai.github.io/openai-agents-python/multi_agent/)
17. [OpenAI Agents SDK: Handoffs](https://openai.github.io/openai-agents-python/handoffs/)
