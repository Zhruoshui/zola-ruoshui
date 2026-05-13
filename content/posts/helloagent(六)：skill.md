+++
title = "helloagent(六)：Skill"
date = 2026-03-23
authors = ["ruoshui"]

[taxonomies]
tags=["agentic-coding"]

[extra]
comment = true
repo_view = true
+++

# Skill：Agent 的手和脚

如果说 MCP 是大模型接世界的"硬件接口"，那 Skill 就是大模型的"操作手册"。MCP 负责让模型能调工具，Skill 负责告诉模型——调什么工具、按什么步骤、注意什么坑。

一个负责"能做什么"，一个负责"该怎么做"。

![分工合作](https://image.aruoshui.fun/i/2026/05/09/dsqzf0-2.svg)

## Skill 解决了什么问题

没有 Skill 时，Agent 容易出几个典型问题：

1. **反复问同样的问题**：每次都问"你的代码规范是什么？"、"文件放在哪个目录？"
2. **按通用做法来**：不知道团队的特殊约定，按大众做法来干，结果不符合你的要求
3. **忘记边界情况**：不知道某些操作的坑在哪里，踩坑了才来问

有了 Skill，这些经验直接写进文件里，Agent 每次都会遵循，不会再问。

### 一个具体例子

假设你要 Claude 帮你生成一份 Word 文档：

**没有 Skill 时：**

```
你：帮我生成一个项目计划书的 Word 文档
Claude：好的，以下是项目计划书内容：
（输出一堆 Markdown 文本……）
```
结果：Claude 输出的是纯文字，**不是真正的 .docx 文件**。

**有了 Skill 之后：**

Claude 接到同样的请求，会：
1. 自动识别"这是 Word 文档任务" → 触发 `docx` Skill
2. 读取 Skill 文件，了解正确的库（`python-docx`）和输出路径
3. 按照 Skill 的步骤，生成真正的 `.docx` 文件
4. 把文件交给你下载

**结果完全不同**——一个是聊天回复，一个是可以立刻打开的 Word 文件。


## Skill 的核心结构

一个 Skill 本质上就是一个 **文件夹 + 一个 SKILL.md 文件**。

```
my-skill/
├── SKILL.md          # 必需：元数据 + 执行指令
├── scripts/          # 可选：可执行代码
├── references/       # 可选：参考文档
├── assets/           # 可选：模板、资源
```

**SKILL.md 文件分为上下两部分：**

### 上半部：YAML Frontmatter（元数据）

```yaml
---
name: pdf-processing          # 技能名称（小写字母+数字+连字符，最长64字符）
description: 从 PDF 中提取文本和表格，填写表单，合并文档。  # 功能和触发条件（最长1024字符）
license: Apache-2.0           # 可选：许可证
compatibility: 需要 Python 3.10+  # 可选：环境要求
metadata:                     # 可选：自定义键值对
  author: example-org
  version: "1.0"
---
```

只有 `name` 和 `description` 是**必填**的，其他都是可选的。

### 下半部：Markdown 正文（执行指令）

告诉 AI 具体怎么做。至少包含两块：

- **指令（Instructions）**：分步操作说明
- **示例（Examples）**：具体示例

```markdown
# PDF 处理

## 使用场景
当需要对 PDF 文件进行操作时使用。

## 提取文本
- 使用 `pdfplumber` 提取文本型 PDF 内容
- 扫描版 PDF 需配合 OCR 工具

## 填写表单
- 读取 PDF 表单字段
- 按输入数据填充并生成新文件
```

### name 字段的规则

`name` 必须是**小写字母、数字和连字符**的组合：

```
name: pdf-processing          # 好：动名词形式，清晰描述
name: analyzing-spreadsheets  # 好：一眼知道用途
name: my-brand-guidelines     # 好：组织专属知识

name: helper                  # 差：太模糊
name: PDF-Processing          # 差：包含大写字母
name: data files              # 差：包含空格
```

推荐使用**动名词形式**（动词 + -ing）来命名。

### description 字段——最重要的字段

`description` 决定了 Agent 能不能正确识别"该用哪个 Skill"。它是整个 Skill 的门面。

写法要包含两个部分：

1. **做什么**：描述 Skill 的功能
2. **什么时候用**：给出触发场景和关键词

```
description: 从 PDF 文件中提取文本和表格，填写 PDF 表单，合并 PDF。
             处理 PDF 文档或用户提及 PDF、表单、文档提取时使用。
#            ↑ 功能说明                  ↑ 触发条件 + 关键词
```

**为什么 description 这么重要？** 因为 Agent 启动时，只会把所有 Skill 的 `name` 和 `description` 预加载进系统提示词。只有当 description 被判断与当前任务相关时，才会进一步读取完整文件。描述写不好，Skill 就永远不会被触发。


## Skill 的工作原理：渐进式披露

Skill 采用**渐进式披露（Progressive Disclosure）**机制，分三步加载：

| 阶段   | 加载内容              | 典型大小    |
| ------ | --------------------- | --------- |
| **发现阶段** | name + description      | 约 100 tokens  |
| **激活阶段** | 完整的 SKILL.md 文件       | 建议不超过 5000 tokens |
| **执行阶段** | 脚本、参考资料等              | 按需加载      |

这个设计的精髓在于：**即使你装了 100 个 Skill，Agent 启动时也只加载 100 条 name + description，每个大约 100 tokens，总共不过几千 tokens。** 只有当任务真的匹配到某个 Skill 时，才会把它完整加载进来。避免了上下文窗口被 Skill 撑爆。

整个执行流程如下：

1. **用户发出指令** → Agent 扫描所有 Skill 的 name + description，做意图匹配
2. **命中某个 Skill** → 加载完整的 SKILL.md，建立工具权限和行为边界
3. **按步骤执行** → 调用脚本、读取参考文档、使用资源
4. **输出结果** → 经过约束整合后返回给用户


## 创建你的第一个 Skill

以 Claude Code 为例，Skill 存放在两个位置：

- 个人全局：`~/.claude/skills/`
- 项目专用：`.claude/skills/`（项目根目录下）

在项目目录下创建一个简单的命名规范 Skill：

```bash
mkdir -p .claude/skills/python-naming-standard
```

编写 `.claude/skills/python-naming-standard/SKILL.md`：

```markdown
---
name: python-naming-standard
description: 当用户要求重构、审查或编写 Python 代码时，参考此规范。
---

## 指令
1. 所有内部辅助函数必须以 `_internal_` 前缀命名
2. 如果发现不符合此规则的代码，请自动提出修改建议
3. 在提交代码前，必须检查此规范

## 参考示例
- 正确：`def _internal_calculate_risk():`
- 错误：`def _calculate_risk():`
```

创建后的项目结构：

```
my-project/
├── src/
│   └── test.py
├── .claude/
│   └── skills/
│       └── python-naming-standard/
│           └── SKILL.md
└── .gitignore
```

现在启动 Claude Code，输入"帮我写一个计算用户折扣的函数"，它就会自动匹配到这个 Skill，生成带 `_internal_` 前缀的函数名。


## Skill 的脚本扩展

除了在 SKILL.md 中写指令，你还可以在 `scripts/` 目录下放可执行脚本：

```
my-skill/
├── SKILL.md
└── scripts/
    ├── extract.py       # PDF 文本提取
    ├── fill_form.py     # 表单填充
    └── merge.py         # 文件合并
```

在 SKILL.md 中引用：

```markdown
## 提取 PDF 文本

```bash
python scripts/extract.py input.pdf
```

脚本会提取 input.pdf 中的所有文本并输出到标准输出。
```

### 自包含脚本

Python 脚本可以通过 **PEP 723** 在文件内声明依赖，无需额外安装：

```python
# /// script
# dependencies = [
#   "beautifulsoup4",
# ]
# ///

from bs4 import BeautifulSoup

html = '<html><body><h1>Welcome</h1><p class="info">Hello</p></body></html>'
soup = BeautifulSoup(html, "html.parser")
print(soup.select_one("p.info").get_text())
```

然后一行命令就能运行：

```bash
uv run scripts/extract.py
```

其他语言也有类似机制：Deno 用 `npm:` 导入、Bun 自动安装缺失包、Ruby 用 `bundler/inline`。

### 为 Agent 设计脚本的几个要点

1. **避免交互式提示**：Agent 运行在非交互式 Shell 里，所有输入通过命令行参数或 stdin 传入
2. **提供 `--help`**：Agent 通过 `--help` 输出了解脚本接口
3. **输出结构化数据**：优先用 JSON/CSV，而非自由文本，方便 Agent 程序化解析
4. **错误信息要具体**：`Error: --format must be one of: json, csv, table. Received: "xml"` 而不是 `Error: invalid input`


## 使用现有的 Skill

你不用什么都自己写。Anthropic 官方维护了一个 Skill 仓库：

> [https://github.com/anthropics/skills](https://github.com/anthropics/skills)

在 Claude Code 中注册为插件市场：

```
/plugin marketplace add anthropics/skills
```

然后就可以浏览和安装现成的 Skill 了：

```
/plugin install document-skills@anthropic-agent-skills
/plugin install example-skills@anthropic-agent-skills
```

安装后，使用的时候只需在指令中提及技能名称即可：

```
使用 PDF 技能提取 path/to/file.pdf 中的表单字段
创建一个 Agent Skill 的演示文稿
```

更多资源：

| 资源 | 链接 |
| ---- | ---- |
| Skill 聚合入口 | [https://skills.sh/](https://skills.sh/) |
| Skills 市场（中文） | [https://skillsmp.com/zh](https://skillsmp.com/zh) |
| Agent Skills 官方标准 | [https://agentskills.io](https://agentskills.io) |
| Claude 技能精选列表 | [https://github.com/ComposioHQ/awesome-claude-skills](https://github.com/ComposioHQ/awesome-claude-skills) |
| 自动生成 Skill 的 Skill | [https://github.com/anthropics/skills/tree/main/skills/skill-creator](https://github.com/anthropics/skills/tree/main/skills/skill-creator) |


## Skill 与 MCP——两种外部能力

Skill 和 MCP 都是 Agent 的外部能力扩展，但定位完全不同：

|          | Skill                       | MCP                      |
| -------- | --------------------------- | ------------------------ |
| **核心定位** | 知识复用（流程、经验、规范）               | 能力扩展（API、数据库、外部服务）         |
| **载体形式** | Markdown 文件 + 可选脚本目录         | 独立运行的 Server 进程            |
| **加载方式** | 渐进式披露，按需加载                   | 启动时注册工具定义，调用时执行             |
| **Token 消耗** | 低（发现阶段只读 name + description） | 相对较高（工具定义需注入上下文）            |
| **入门门槛** | 极低，会写 Markdown 就能创建          | 需要编码能力，需要理解 JSON-RPC 和 Server 部署 |
| **跨平台** | 支持 Claude Code、OpenCode、Copilot 等 | 需要各平台实现 MCP Client          |
| **状态管理** | 无状态，每次使用需重新加载                | 可以维护长连接和状态（数据库连接、文件句柄等）      |

**一句话总结：Skill 告诉 Agent "该怎么做"，MCP 给 Agent "能做什么的能力"。** Skill 是静态的知识注入，MCP 是动态的能力连接。两者合在一起，才是 Agent 真正能工作的基础。


## 总结

Agent Skills 的核心思想很简单，但工程价值很大：

1. **Skill 让 Agent 从"会聊天"变成"会干活"**：没有 Skill 的 Agent 只能给建议，有了 Skill 能直接出结果
2. **Skill 是可复用的经验包**：一旦写好，团队所有人、所有次调用，都得到稳定一致的结果
3. **Skill 是人与 AI 协作的桥梁**：人类负责定义"怎么做"，AI 负责真正"去做"
4. **基于 Markdown，零学习成本**：任何人只要会写 Markdown，就能创建 Skill
5. **渐进式披露，Token 友好**：即使装了上百个 Skill，上下文也不会被撑爆

在 Agent 外部能力的版图里，**MCP 接能力，Skill 接经验**——这就是大模型从"聪明但没用"变成"聪明且能干"的完整方案。


## 参考资料

1. [菜鸟教程：Skills 教程](https://www.runoob.com/skills/skills-tutorial.html)
2. [Anthropic 官方 Skills 仓库](https://github.com/anthropics/skills)
3. [Agent Skills 官方标准站点](https://agentskills.io)
4. [Anthropic: Equipping Agents for the Real World with Agent Skills](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)
5. [VS Code Copilot Agent Skills 文档](https://code.visualstudio.com/docs/copilot/customization/agent-skills)
6. [Skills 市场（中文界面）](https://skillsmp.com/zh)
7. [Awesome Claude Skills 精选列表](https://github.com/ComposioHQ/awesome-claude-skills)
