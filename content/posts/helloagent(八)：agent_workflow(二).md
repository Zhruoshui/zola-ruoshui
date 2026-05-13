+++
title = "helloagent(八)：agent_workflow(二)"
date = 2026-05-08
authors = ["ruoshui"]

[taxonomies]
tags=["agentic-coding", "workflow", "codestable"]

[extra]
comment = true
repo_view = true
+++

# 一、调研背景

在前文 [helloagent(八)：agent_workflow](@/posts/helloagent(八)：agent_workflow.md) 中，介绍了自研的 `RsSpec`工作流体系——基于 RPI（Research-Plan-Implementation）编码理论，融合 OpenSpec 规范层与多模型协作，目标是让 Claude Code 在复杂场景、长时间编码任务中保持可控。

近期发现社区中另一套同方向的工作流 [CodeStable](https://github.com/liuzhengdongfortest/CodeStable)，其设计理念与 RsSpec 形成鲜明对照。CodeStable 的 Slogan 是"面向严肃工程的 AI 编码工作流"，在建模方式、流程组织、知识沉淀等方面有相当多的独到之处。


---

# 二、CodeStable 架构总览

## 2.1 设计哲学：编排软件要素，而非编排 Agent

CodeStable 与当前主流 AI 编码框架（Superpowers、CCW、Oh-My-OpenAgent）存在一个根本性的分岔：

| 维度 | Agent 编排派 | CodeStable |
|---|---|---|
| **核心实体** | Agent / Role / Team | Requirement / Architecture / Feature / Issue / Decision |
| **主线问题** | Agent 之间怎么分工、传递、协调？ | 软件的需求、约束、决策怎么被记下来、被检索、被复用？ |
| **状态存在哪** | Agent 的 session / 消息总线 / 队列 | 项目里的 `.codestable/` 文件树（人和 AI 都能读） |
| **对人的定位** | 人少介入越好，理想是全自动 | **人在环** —— 程序员对整体把控负责，AI 是高效的执行体 |

CodeStable 的核心论断是：**软件工程的混乱本质上不是 Agent 不够强，而是要素没被组织好**。Agent 再强，也写不了一个把需求、架构、历史决策全丢失的项目。

RsSpec 虽然同样强调"人介入"，也使用了 OpenSpec 来管理规范文档，但在顶层建模上仍然是 **流程中心**（R→P→I 线性流水线）。CodeStable 则是 **实体中心**——先定义软件由哪些要素构成，再为每种要素配备对应的操作技能。

## 2.2 六大实体体系

CodeStable 将软件开发活动抽象为 6 类实体，外加横切面"知识沉淀"作为第 7 类：

| 实体 | 英文 | 定位 | 生命周期 |
|---|---|---|---|
| **需求** | requirements | "为什么要有这个能力"，原始用户故事与讨论权衡 | draft → current → outdated |
| **架构** | architecture | "系统现在长什么样"，只记现状不记计划 | 持续同步 |
| **路线图** | roadmap | "接下来打算怎么做这块大需求"，大需求的事前规划 | active → completed → archived |
| **特性** | feature | 一次新增能力的工程执行全过程（design → impl → accept） | 单次闭环 |
| **问题** | issue | 开发完成后的 BUG 单子（report → analyze → fix） | 单次闭环 |
| **知识** | compound | 复利工程的知识库：learning / trick / decision / explore | 永久积累 |

{% mermaid() %}
graph TB
    subgraph 档案层["长效档案层（只记现状）"]
        REQ[requirements<br/>需求实体]
        ARCH[architecture<br/>架构实体]
    end
    
    subgraph 规划层["规划层（前瞻性）"]
        RM[roadmap<br/>路线图]
    end
    
    subgraph 执行层["执行层（事件驱动）"]
        FEAT[features<br/>特性流程]
        ISSUE[issues<br/>问题流程]
        REFACTOR[refactors<br/>重构流程]
    end
    
    subgraph 横切层["横切层（复利飞轮）"]
        COMPOUND[compound<br/>知识沉淀]
    end
    
    ARCH -->|现状约束| FEAT
    REQ -->|愿景约束| FEAT
    RM -->|接口契约| FEAT
    FEAT -->|归并| ARCH
    FEAT -->|回写| REQ
    FEAT -->|回写| RM
    FEAT -->|经验| COMPOUND
    ISSUE -->|经验| COMPOUND
    COMPOUND -->|复用| FEAT
    COMPOUND -->|复用| ARCH
{% end %}

**几点关键设计决策**：

- `requirements/` 和 `architecture/` 刻意分开：前者回答"为什么要有"，后者回答"怎么搭"。两者都是"只记现状，不记计划"。
- `roadmap/` 作为独立的规划层，承载架构层详设（接口契约、共享协议），是 feature 的硬约束输入。待子 feature 全部落地后，归并入 `architecture/`，roadmap 归档。
- `compound/` 是唯一的横切知识目录，四种类型（learning / trick / decision / explore）通过 frontmatter 的 `doc_type` 字段区分而非分子目录——便于跨类型检索。

## 2.3 三大开发流程

CodeStable 定义了三条事件驱动的开发流程：

{% mermaid() %}
graph LR
    subgraph 特性引入
        A1["cs-feat-design<br/>方案设计"] --> A2["cs-feat-impl<br/>逐步编码"] --> A3["cs-feat-accept<br/>验收闭环"]
    end
    
    subgraph 问题修复
        B1["cs-issue-report<br/>问题报告"] --> B2["cs-issue-analyze<br/>根因分析"] --> B3["cs-issue-fix<br/>定点修复"]
    end
    
    subgraph 代码重构
        C1["cs-refactor<br/>重构主流程"]
    end
{% end %}

流程设计的特点：

1. **不是线性流水线，而是事件驱动**——来了新需求走 feature 流，发现 bug 走 issue 流，发现腐化走 refactor 流。
2. **每个阶段有强入口/出口条件**——design approved 才能进 impl，impl step 全 done 才能进 accept。不允许"偷偷做"。
3. **阶段间有独立的 checkpoint**——impl 写完后要发统一完成汇报等待 review，accept 要做 9 节验收报告包含 grep 反向核对和拔除沙盘推演。

## 2.4 22 个技能的完整谱系

CodeStable 不是一份单一的 spec 文档，而是一个 **22 个独立 Skill** 组成的体系：

```
cs                # 根入口 · 路由分诊（本身不做事，只路由）
├─ cs-onboard     # 接入新仓库 / 迁移旧文档
├─ cs-req         # 需求长效档案
├─ cs-arch        # 架构长效档案
├─ cs-roadmap     # 中长期路线图规划
├─ cs-brainstorm  # 模糊讨论统一入口（4-case 分诊）
├─ cs-feat        # 特性流程入口
│  ├─ cs-feat-design   # 阶段1: 方案起草
│  ├─ cs-feat-impl     # 阶段2: 逐步编码
│  ├─ cs-feat-accept   # 阶段3: 验收闭环（9节报告）
│  └─ cs-feat-ff       # 超轻量直通车
├─ cs-issue       # 问题修复入口
│  ├─ cs-issue-report  # 问题报告（5问）
│  ├─ cs-issue-analyze # 根因分析（2-3方案对比）
│  └─ cs-issue-fix     # 定点修复+验证
├─ cs-refactor    # 重构流程（beta）
│  └─ cs-refactor-ff   # 轻量重构
├─ cs-audit       # 主动系统审计扫描
├─ cs-learn       # 踩坑 / 好做法沉淀
├─ cs-trick       # 可复用编程模式参考库
├─ cs-decide      # 技术选型 / 长期约束永久归档
├─ cs-explore     # 定向代码探索（证据存档）
├─ cs-note        # 碎片知识追加到 attention.md
├─ cs-guide       # 对外的开发者/用户指南
└─ cs-libdoc      # 库 API 参考文档
```

这个技能谱系体现了 CodeStable"每一个开发活动都该有一个对应的工作区"的设计理念。关键是：**cs 根入口负责接收用户开放诉求，智能路由到对应子技能**——用户不需要记住 22 个命令名。

---

# 三、CodeStable 核心流程深度分析

## 3.1 路由与接入层

### cs —— 智能路由根入口

`cs` 是 CodeStable 的"前台"。用户开口"我想加个权限校验"、"这个地方有 bug"，不需要知道该用哪个子技能。`cs` 接管后做三件事：

1. 扫描仓库状态（`.codestable/` 是否存在、`attention.md` 是否就绪）
2. 匹配场景路由表
3. 输出路由建议 + 一句话理由

{% mermaid() %}
graph TD
    CS[用户输入 /cs] --> SCAN{扫描 .codestable/}
    SCAN -->|不存在| ONBOARD["建议先 cs-onboard"]
    SCAN -->|存在| ROUTE{场景路由匹配}
    ROUTE -->|"新功能 / 加个X"| FEAT[cs-feat]
    ROUTE -->|"BUG / 异常"| ISSUE[cs-issue]
    ROUTE -->|"想法模糊"| BRAIN[cs-brainstorm]
    ROUTE -->|"大需求拆解"| ROAD[cs-roadmap]
    ROUTE -->|"审查/扫描"| AUDIT[cs-audit]
    ROUTE -->|"补文档"| REQ[cs-req]
    ROUTE -->|"经验沉淀"| LEARN[cs-learn]
    ROUTE -->|"技术选型"| DECIDE[cs-decide]
    ROUTE -->|"摸代码/调研"| EXPLORE[cs-explore]
{% end %}

**设计亮点**：`cs` 的"不做事"原则——只路由，不越界替子技能跑流程。这避免了入口膨胀，也迫使每个子技能保持独立可测试。

### cs-onboard —— 骨架搭建与文档迁移

两条路径自动判断：空仓库从零搭骨架，已有文档走审计+迁移映射。迁移路径的核心纪律是**"不高置信度不自动执行，低置信度必须问用户"**。

落地产物：`tools/`（跨工作流共享脚本）和 `reference/`（跨子技能共享参考文档）由技能包 `cp -rf` 整目录覆盖，是迁移路径中**唯一强制覆盖**的动作，确保升级后口径一致。

## 3.2 brainstorm —— 讨论与分诊

`cs-brainstorm` 是 CodeStable 最具"人味"的模块。它处理一个此前被所有工作流体系忽视的问题：**用户开口时通常不知道自己到底要什么**。

{% mermaid() %}
graph TD
    START[用户说: 有个想法...] --> ASSESS{规模判断}
    ASSESS -->|"一句话说清 做什么/为谁/怎么算成功"| C1[case 1: 直接进 design]
    ASSESS -->|"知道要解决什么问题 但对解法摇摆"| C2[case 2: 挖问题→发散→收敛<br/>落 brainstorm.md→进 design]
    ASSESS -->|"多feature规模 心里有拆法"| C3[case 3: 移交 cs-roadmap]
    ASSESS -->|"多feature规模 说不清模块边界"| C4[case 4: grill→发散→落盘<br/>存 brainstorms/→后续 roadmap 读取]
    
    C2 --> DESIGN[cs-feat-design]
{% end %}

**核心哲学**：

- **AI 是思考伙伴，不是记录员**。用户来 brainstorm 是想被挑战、被启发，不是被填表。
- **不跳过分诊**。任何长度的讨论开始前先判 case。
- **允许升降级**。聊着发现范围扩大就从 case 2 切 case 3/4，方向变清楚了就升 case 1。
- **最小 demo / spike 验证**——讨论中遇到"事实存疑"时，花 5-30 分钟搭个最小 demo 比再聊三轮更省时。

与 RsSpec 的关键差异：RsSpec 的 `research` 阶段**假设用户需求已经明确**，直接进入代码库探索与约束收敛。而 `cs-brainstorm` 明确承认"用户最初不知道自己想要什么"是常态，把**需求澄清**作为一个正式的、有方法论支撑的阶段。

## 3.3 特性开发全流程

### 阶段 1：cs-feat-design（方案设计）

设计产出一份方案文件 `{slug}-design.md` + 行动清单 `{slug}-checklist.yaml`。方案是后续实现的**唯一输入**。

**方案结构**（标准 design）：

| 节 | 内容 | 设计原则 |
|---|---|---|
| 第 0 节 | 术语约定 | 术语先锁死，动笔前 grep 防冲突 |
| 第 1 节 | 决策与约束 | 需求摘要、复杂度档位、关键决策、明确不做 |
| 第 2.1 节 | 名词层（数据结构/对外契约） | "现状→变化"两段式，接口有示例+来源位置 |
| 第 2.2 节 | 编排层（主流程/控制流） | 开头一张 mermaid 图建 mental model |
| 第 2.3 节 | 挂载点清单 | 按"删了它 feature 是否消失"判据，3-5 条为正常区间 |
| 第 2.4 节 | 推进策略 | 按 paradigm 维度切片（编排骨架→计算节点→持久化→测试） |
| 第 2.5 节 | 结构健康度与微重构 | 评估要改的文件是否偏胖/目录是否摊平，决定是否在实现前做微重构 |
| 第 3 节 | 验收契约 | 关键场景清单（正常+边界+错误）+ 反向核对项 |
| 第 4 节 | 与项目级架构文档的关系 | 把 feature 放回项目大局 |

**关键纪律**：

- **不替用户做决定**——碰到没说清的角落默认停下来问。"声明假设、给选项不自选、看不懂就停"。
- **目标和约束都写成可验证的**——不写"让它能跑"这种弱标准。
- **每个 feature 都要能被卸载**——通过挂载点反向核对回答"想把它拔掉，要拔哪些地方？"。
- **整稿一次性 review，不分批**——分批 review 用户只看到局部，发现不了跨节不一致。

### 阶段 2：cs-feat-impl（逐步编码）

实现的活是把方案变成代码。CodeStable 的实现阶段有三条核心姿态：

1. **默认写最少的代码**——不顺手加"以后可能要"的配置项、抽象层、防御性兜底。
2. **只动该动的，不顺手"改善"邻居**——同文件里别的函数风格丑别碰。
3. **design 没说的事别自己拍板**——出现"补丁分支"（`if 特殊情况 then 特殊处理`）时停，回方案谈。

**实现期间的约束**：

- 严格按 `checklist.yaml` 的 steps 顺序执行，不合并不跳。
- 术语守护：新类型/函数/变量名去方案第 0 节对照，不允许引入方案里没有的概念。
- 反射检查：当函数超过合理长度、类方法过多、出现第 4+ 个参数等信号时，停下来评估是否要拆。
- 写完后输出**统一汇报模板**（动了哪些文件、改了哪些函数/类型、是否触碰方案外、是否引入新概念、反射检查自检、验收场景自检），停等用户 review。

### 阶段 3：cs-feat-accept（验收闭环）

`cs-feat-accept` 是 CodeStable 最具工程严谨性的模块。它不只是"看看测试过没过"，而是做四件事：

1. **核对实现有没有偏离方案**——逐层对照 design，发现偏差当场修，不只在报告里"记一下"。
2. **将 feature 归并到整体架构**——实际去更新 `architecture/` 下的相关 doc，让"没读过 design 的人打开 architecture 就能知道系统里现在有这个能力"。
3. **能力落档到 requirement**——draft req 完成后升级为 current，从未写过 req 的能力触发 backfill。
4. **完成状态回写到 roadmap**——`items.yaml` 对应条目 `status: done` + 主文档同步。

验收报告共 9 节：

| 节 | 内容 |
|---|---|
| 1. 接口契约核对 | 对照 2.1 节逐项核对 |
| 2. 行为与决策核对 | 需求摘要、明确不做、关键决策、挂载点反向 grep+拔除沙盘推演 |
| 3. 验收场景核对 | 逐条列举证据来源（类型/单测/集成/手工） |
| 4. 术语一致性 | grep 全局核对 |
| 5. 架构归并 | 实际写入 architecture doc |
| 6. requirement 回写 | draft→current / backfill / 未变 |
| 7. roadmap 回写 | items.yaml + 主文档同步 |
| 8. attention.md 候选盘点 | 列出"下个 feature 的 AI 还会再踩一次"的环境信息 |
| 9. 遗留 | 后续优化点、已知限制、顺手发现列表 |

## 3.4 知识复利飞轮（compound）

CodeStable 的 `compound/` 是整套体系的 **"飞轮"**——任何流程跑完发现"这事值得记下来"都可以触发沉淀，沉淀的产物又会被下一次同类工作读到。

{% mermaid() %}
graph LR
    subgraph 沉淀动作
        L[cs-learn<br/>踩坑/好做法] --> C[compound/]
        T[cs-trick<br/>编程模式/库用法] --> C
        D[cs-decide<br/>技术选型/长期约束] --> C
        E[cs-explore<br/>调研结论] --> C
        N[cs-note<br/>attention.md] --> AT[.codestable/attention.md]
    end
    
    C -->|下次工作时读| FEAT2[cs-feat-design]
    C -->|下次工作时读| ARCH2[cs-arch]
    C -->|下次工作时读| ISSUE2[cs-issue-analyze]
    AT -->|每次技能启动必读| ALL[所有 cs-* 技能]
{% end %}

**四种知识类型的判别口诀**：

- 回顾"做 X 时踩了 Y" → `cs-learn`
- 处方"以后做 X 就这样做" → `cs-trick`
- 规定"全项目今后都按 X 来" → `cs-decide`
- 调查"X 现在是什么样" → `cs-explore`
- 一两行常驻提示"每次启动都得知道 X" → `cs-note`

这一层是 CodeStable 相比 RsSpec 最显著的差异化优势。RsSpec 也提到了 skills 作为可选知识包，但没有一个内嵌于工作流中的**系统性知识沉淀与复用机制**。

## 3.5 其他流程

**Issue 流程**：report（5 个结构化问题：现象、复现、预期 vs 实际、环境、严重度）→ analyze（根因分析+2-3 个修复方案推荐）→ fix（定点修复+验证+fix-note）。

**Refactor 流程**（beta）：scan → refactor-design → apply，阶段间有人工 checkpoint，行为等价性是基线。

**Audit（审计）**：主动系统扫描，按 `性质（bug/security/performance/maintainability/arch-drift） × 严重度（P0/P1/P2）` 交叉分类，产出一份发现清单。**只发现不定修**。

---

# 四、CodeStable 设计点评

## 4.1 设计亮点

1. **实体中心建模**：将"软件要素"而非"Agent"作为核心实体，是真正面向软件工程而非 AI 工程的设计。这也意味着当 AI 能力进化时，实体层不变，技能层可以裁剪。

2. **分诊与路由**：`cs` 根入口 + `cs-brainstorm` 分诊层，解决"用户不知道用什么命令"和"用户不知道自己想要什么"两个根本性问题。

3. **完整的知识复利飞轮**：`compound/` 不是"可选技能包"，而是嵌套在工作流内的系统性机制——cs-learn 的"查重叠与意图分流"、cs-decide 的"已拍板才归档，不替用户提前决定"、cs-trick 的"必须先读代码再写参考"等纪律，防止知识库退化为垃圾堆。

4. **验收闭环的工程严谨性**：9 节验收报告包含 grep 反向核对、拔除沙盘推演、架构归并、requirement 回写、roadmap 回写、attention.md 候选盘点。不是"测试过了就完了"，是"文档和代码一致了才完了"。

5. **"现状→变化"两段式**：design 的每一层都要求先写现状（指向代码位置），再写变化。读者靠现状判断变化是否合理。

6. **阶段间的"不要偷偷做"纪律**：impl 发现方案没覆盖的情况→停，回方案谈。impl 发现值得重构的点但不在方案内→记成顺手发现，不修。这种纪律防止工作流沦为"形式主义"。

7. **skill 体系的一致规范**：所有 cs-* 共享 `shared-conventions.md`（命名约定、目录结构、checklist 生命周期）、共享 `tools/`（search-yaml.py、validate-yaml.py）、启动时统一读 `attention.md`。

## 4.2 潜在不足

1. **工程复杂度偏高**：22 个 skill + 大量模板文件 + 多种 YAML frontmatter 规范.

2. **对 AI 指令遵循能力要求极高**：CodeStable 大量依赖"AI 自觉遵守纪律"，如"术语守护"、"反射检查"、"不顺手改善邻居"。这些在 Claude Opus 级别模型上可能表现良好，但在弱模型或长会话压缩后可能执行走形。

3. **缺少多模型协作机制**：CodeStable 假设由单一 Agent（Claude Code）完成全流程。RsSpec 利用 Codex/Gemini 做跨模型交叉校验和 PBT 属性提取，在多模型盲区覆盖和成本控制上有独到优势。

4. **checklist.yaml 的维护成本**：每份 design 都需要手工维护一份 YAML checklist，steps 的 status 需要手动 `pending → done`。在频繁迭代的小型 feature 上这可能显得过度工程。


---

# 五、与RsSpec的横向对比

## 5.1 RsSpec 既有能力回顾

RsSpec 当前覆盖：

| 能力 | 实现 |
|---|---|
| 线性流程 | `/rsspec:init` → `research` → `plan` → `implementation` |
| 约束收敛 | Research 阶段通过 Auggie MCP 并行探索代码库，生成标准化 JSON 约束集 |
| 多模型协作 | Plan 阶段 Codex+Gemini 做歧义检测和 PBT 属性提取；Implementation 阶段双模型代码原型+交叉 review |
| 上下文管理 | 每阶段结束手动 `/clear`，分段保持上下文在 ~80K 最优窗口 |
| 代码主权 | 外部模型代码只做原型，必须由 Claude 重构为生产级代码 |
| 规范层 | 集成 OpenSpec 做 proposal/spec 管理 |

**RsSpec 的本质模型**：一条从 Research 到 Implementation 的 **线性流水线**，用上下文切割和多模型协作保证质量。

## 5.2 CodeStable 相比 RsSpec 的差异化优势

下表系统梳理 CodeStable 有而 RsSpec 没有或较弱的能力：

| 能力维度 | CodeStable | RsSpec 现状 | 影响评估 |
|---|---|---|---|
| **智能路由** | `cs` 根入口 + 场景路由表 | 用户必须知道用哪个命令（/rsspec:research / plan / implementation） | 降低使用门槛，减少"不知道该用哪个命令"的困惑 |
| **需求澄清** | `cs-brainstorm` 4-case 分诊 + grill 模式 | Research 阶段假设需求已明确，仅通过 `AskUserQuestions` 处理表面歧义 | 对"用户开口时自己也不清楚要什么"的场景覆盖不足 |
| **路线图层** | `cs-roadmap`（概设+接口契约+子feature拆解） | 无。大需求只能手动拆成多个独立 proposal | 大需求缺少结构化拆解，模块间接口契约靠人工维持一致性 |
| **验收闭环** | 9 节验收报告 + 架构归并 + req/roadmap 回写 | Implementation 阶段的 review 和验证存在但未体系化 | 验收后文档与代码的同步没有硬性保证 |
| **知识复利** | `compound/`（learning/trick/decision/explore/note）+ 搜索工具 | 可选 skills 作为外部知识包，但无内嵌知识沉淀机制 | 经验无法在后续工作中自动复用 |
| **Issue 流程** | 完整的 report→analyze→fix 子流程 | 无独立 BUG 修复流程 | BUG 修复缺少规范化跟踪 |
| **系统审计** | `cs-audit` 主动扫描 | 无 | 被动等到用户发现问题才处理 |
| **重构流程** | `cs-refactor` 子流程 | 无独立重构流程 | 代码腐化缺少结构化应对 |
| **架构只记现状** | `cs-arch` 严格只记现状，roadmap 记计划 | OpenSpec 的 proposal 混合了现状和计划 | 长期项目中文档与代码的一致性更难维护 |
| **阶段 checkpoint 纪律** | "不许偷偷做"贯穿全流程 | 有约束但不如 CodeStable 体系化 | AI 执行过程中偏离方案的几率更高 |
| **attention.md** | 项目级启动必读，cs-note 增量追加 | 通过 CLAUDE.md 实现，但非工作流内嵌 | 注意力分散在多个入口文件 |

## 5.3 RsSpec 相比 CodeStable 的差异化优势

| 能力维度 | RsSpec | CodeStable | 影响评估 |
|---|---|---|---|
| **轻量性** | 4 个命令，24 行 implementation.md | 22 个 skill，数百行模板 | 对个人开发者和小项目更友好 |
| **多模型协作** | Plan/Impl 阶段系统性地调用 Codex/Gemini 做交叉校验 | 无多模型编排 | 多模型盲区覆盖是独特的质量保障机制 |
| **PBT 属性提取** | Plan 阶段提取数学不变量（交换律/幂等性/往返/单调性等） | 无 | 测试质量有系统性提升 |
| **上下文预算管理** | 明确的 `/clear` 分割策略，每~80K 切割 | 依赖 AI 自主判断何时切割 | 上下文污染的防范更主动 |
| **外部事实检索** | Research 阶段使用 grok-search 做联网文档搜索 | 无专用搜索 MCP 配套 | 对依赖第三方库文档的场景更有利 |
| **模型分工明确** | 前端→Gemini，后端→Codex，规划→Claude Opus | 假设单模型完成全流程 | 性价比更高的模型组合策略 |

## 5.4 关键差距归因

两者最根本的差异在于 **对"工作流"的建模层次不同**：

- **RsSpec** 建模的是"**怎么把一件事做完**"的工程流程（R→P→I 流水线），关注的是**执行的节奏与上下文切割**。
- **CodeStable** 建模的是"**软件由哪些要素构成**"的领域模型（6 实体 + 3 流程），关注的是**信息的有序积累与跨周期复用**。

RsSpec 擅长做好"一件事"，CodeStable 擅长维护"一个项目"。

---