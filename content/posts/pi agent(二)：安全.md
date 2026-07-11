+++
title = "pi agent(二)：安全.md"
date = 2026-07-07
authors = ["ruoshui"]

[taxonomies]
tags = ["agentic-coding"]

[extra]
comment = true
repo_view = true
+++

[前文](./pi%20agent(一)：快速开始.md)提及了A➗的恶心操作，跟官方介绍相同，首先来考虑安全，刨除AI供应商抓你数据，另外的就是隔离agent运行环境可，也就是沙箱环境，所以我们先配置沙箱环境

{{ ref_card(title="security", url="https://pi.dev/docs/latest/security", image="https://image.aruoshui.fun/i/2026/07/06/z56sq1-2.webp") }}


{{ ref_card(title="容器化", url="https://pi.dev/docs/latest/containerization", image="https://image.aruoshui.fun/i/2026/07/06/z56sq1-2.webp") }}


> Pi 的设计初衷是在本地源代码树上运行，调用项目工具链，并与用户现有的开发环境集成。如果只是部分进程内沙箱，很容易被误解为安全边界，因为它仍然依赖于主机 shell、文件系统、包管理器、凭据和扩展代码。真正的隔离需要来自操作系统或虚拟化/容器边界。

## 各家 coding agent 的隔离技术

除了 Pi 之外，目前主流的几款 coding agent——Claude Code、OpenAI Codex CLI、OpenCode都做了相应的功能

### 两种隔离架构

| 模式 | 特征 | 典型场景 |
|------|------|----------|
| **模式 A：agent 整体隔离** | LLM 编排、文件读写、命令执行全部运行在 sandbox / microVM / 容器内 | Docker Sandboxes、E2B、Vercel Sandboxes、Fly.io Sprites |
| **模式 B：host 主进程 + 工具路由隔离** | agent 核心进程在主机运行，只有 Bash、文件写、网络请求等工具调用被包装进 sandbox wrapper | Claude Code Native Sandbox、Codex CLI Native Sandbox |

两种模式并不互斥。Claude Code 和 Codex 都同时支持模式 A（Docker Sandboxes）和模式 B（内置 native sandbox）。

### 当前典型的章节

### Claude Code

#### 模式 A：Docker Sandboxes

Docker 官方推出的 `sbx` CLI 可以直接在 microVM 里跑 Claude Code

{{ ref_card(title="Docker Sandboxes In Claude Code", url="https://docs.docker.com/ai/sandboxes/agents/claude-code/", image="https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/webp/docker.webp") }}

```bash
sbx run claude ~/my-project
```

每个 sandbox 是一个独立的 microVM，自带私有的 Docker daemon，workspace 通过 passthrough 挂载进虚拟机，路径和主机保持一致。网络出站必须经过主机上的 HTTP/HTTPS proxy，可以配 allowlist/denylist。主机文件系统默认不可见，主机 Docker daemon 也访问不到。

#### 模式 B：Native Claude Code Sandbox

Claude Code v2.1.0 之后内置了 native sandbox。它的架构是：

```
Host
 └── Claude Code 主进程
      │
      ├─ 需要执行 Bash 命令
      ▼
   Sandbox wrapper
   ├── macOS: Seatbelt (sandbox-exec)
   ├── Linux: bubblewrap + seccomp + socat
   │
      ├── 文件系统：默认可读全局，但只能写当前工作目录
      └── 网络：经 SOCKS5/HTTP proxy 出站，按域名过滤
```

主进程依旧在 host，但每个子命令都被 Seatbelt 或 bubblewrap 包裹。macOS 上 proxy 走 localhost port；Linux 上则通过 Unix domain socket 把流量导回 host proxy，同时用网络 namespace 把 sandbox 内进程的直接网络能力摘掉。

Anthropic 还把这套 runtime 开源成了 [`@anthropic-ai/sandbox-runtime`](https://github.com/anthropic-experimental/sandbox-runtime)，可以独立包装任意进程，很值得参考。

### OpenAI Codex CLI

#### 模式 A：Docker Sandboxes / Codex Cloud

Codex CLI 也能用 Docker Sandboxes：`sbx run codex ~/my-project`。cloud 版 Codex 则直接在云端隔离环境里跑每个 task，默认无网络、依赖预装。

#### 模式 B：Native OS Sandbox

Codex CLI 的思路和 Claude Code 非常接近：**主进程在 host，spawn 出来的命令继承 sandbox boundary**。官方文档说：

> The sandbox applies to spawned commands, not just to Codex's built-in file operations.

具体实现按平台而异：

- **macOS**：Apple Seatbelt
- **Linux/WSL2**：bubblewrap（需要安装 `bubblewrap`；Ubuntu 24.04+ 还要处理 AppArmor 对 unprivileged user namespace 的限制）
- **Windows**：restricted process token + ACL（目前 alpha，官方明确说还不是对抗性安全边界）

Codex 在 `~/.codex/config.toml` 里提供几个权限模式：

- `read-only`
- `workspace-write`（默认）
- `danger-full-access`

配合审批策略 `untrusted` / `on-request` / `never` 使用。相比 Claude Code，Codex 官方文档没有给出那么细的 wrapper → proxy → command 路由图，但底层思路一致。

### OpenCode

OpenCode 的情况比较特殊：**原生没有内置沙盒**，默认就是直接在 host 上运行。

根据代码分析，OpenCode（Go 写的 TUI，基于 Bubble Tea）的 shell 工具直接调用 `os/exec` 执行 `$SHELL -l`，只有一个很容易被绕过的 banned commands 列表（`curl`、`wget`、`nc` 等）。文件、网络、进程全部继承用户权限。

#### 如何给 OpenCode 加隔离

- **模式 A（整体隔离）**：靠外部方案。Docker Sandboxes 支持 `sbx run opencode`；也可以自己打容器，或者放到 E2B、Daytona、Vercel Sandboxes 上跑。
- **模式 B（工具路由隔离）**：官方没有内置，需要自己改。常见思路：
  1. 在 `internal/llm/tools/shell/shell.go` 里把 `bash` 工具调用包装成 `bwrap` / `firejail` / Anthropic `sandbox-runtime` 执行；
  2. 把危险工具拆成 MCP server，每个 MCP server 跑在隔离容器或 Wasm 里（参考微软的 [Wassette](https://github.com/microsoft/wassette)）；
  3. 用 [Sandbox Agent](https://github.com/rivet-dev/sandbox-agent) 这类通用适配器，把 OpenCode 放进 sandbox 后通过 HTTP 远程控制。

### 横向对比

| Agent | 模式 A（整体隔离） | 模式 B（host + 工具路由隔离） | 备注 |
|-------|-------------------|------------------------------|------|
| **Claude Code** | ✅ Docker Sandboxes | ✅ 内置 Native Sandbox | 开源 runtime 可直接复用 |
| **Codex CLI** | ✅ Docker Sandboxes / Codex Cloud | ✅ 内置 Native Sandbox | 配置在 `config.toml` |
| **OpenCode** | ⚠️ 需外部方案 | ⚠️ 官方无内置，需自行实现 | 灵活性高但默认无隔离 |

### 设计要点总结

不管是哪条路线，要做好 coding agent 的隔离，通常都要同时抓这几点：

1. **双隔离**：文件隔离和网络隔离必须同时存在。只禁文件不禁网，数据可能被外传；只禁网不禁文件，本地敏感文件照样能被读。
2. **网络默认拒绝**：采用 allow-only 策略，只放行已知域名（LLM API、package registry、GitHub 等）。
3. **写入最小权限**：写操作默认拒绝，只显式放行工作区；读取可以宽一些，但要 deny 掉 `~/.ssh`、`~/.aws`、`~/.bashrc` 等敏感路径。
4. **凭证脱敏**：子进程环境变量里的 `*_API_KEY`、token、secret 要 mask 或完全 deny。
5. **审计与违规检测**：macOS 可以监听 Seatbelt violation log；Linux 目前主要靠 seccomp 返回 EPERM 或配合 `strace`。

Pi 选择强调"只有操作系统或虚拟化/容器边界才是真正的隔离"，这个观点在 Claude Code 和 Codex 的设计里也得到了印证：它们的 native sandbox 用的正是 Seatbelt、bubblewrap 这类 OS 级原语；而 Docker Sandboxes 则干脆把整个 agent 丢进 microVM。

### 参考来源

- [Claude Code Docs – Configure the sandboxed Bash tool](https://code.claude.com/docs/en/sandboxing)
- [Anthropic `sandbox-runtime`](https://github.com/anthropic-experimental/sandbox-runtime)

- [Docker Docs – OpenCode agent in sandbox](https://docs.docker.com/ai/sandboxes/agents/opencode)
- [OpenAI Codex – Sandboxing concepts](https://developers.openai.com/codex/concepts/sandboxing)
- [OpenAI Codex GitHub](https://github.com/openai/codex)
- [OpenCode Sandbox Analysis – Agent Safehouse](https://agent-safehouse.dev/docs/agent-investigations/opencode)
- [Sandbox Agent – rivet-dev](https://github.com/rivet-dev/sandbox-agent)

# 常见的几款沙箱
## docker sandboxes

> Docker 沙箱在隔离的微型虚拟机沙箱中运行 AI coding agent。每个沙箱都有自己的 Docker 守护进程、文件系统和网络——agent可以构建容器、安装软件包和修改文件，而无需触及您的主机系统。

##

