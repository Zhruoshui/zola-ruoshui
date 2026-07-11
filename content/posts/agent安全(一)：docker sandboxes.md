+++
title = "agent安全(一)：docker sandboxes"
date = 2026-07-01
authors = ["ruoshui"]

[taxonomies]
tags = ["agentic-coding"]

[extra]
comment = true
repo_view = true
+++

# docker sandboxes

> Docker 沙箱在隔离的微型虚拟机沙箱中运行 AI coding agent。每个沙箱都有自己的 Docker 守护进程、文件系统和网络——agent可以构建容器、安装软件包和修改文件，而无需触及您的主机系统。

### 安装
安装看官方的即可：

{{ ref_card(title="get-started", url="https://docs.docker.com/ai/sandboxes/get-started/", image="https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/webp/docker.webp") }}

由于我是archlinux，可以先看看aur仓库有没有（神！），下载的化可以使用这个：

{{ ref_card(title="docker sbx aur", url="https://aur.archlinux.org/packages/docker-sbx", image="https://image.aruoshui.fun/i/2026/07/10/e68i9b-2.webp") }}

```shell
# 使用 yay
yay -S docker-sbx

# 或使用 paru
paru -S docker-sbx
```

### 快速开始
安装完成后，使用`sbx`命令启动并登录，会打开OAuth登录docker，完成后就可以先配置网络规则：

![docker sandboxes](https://image.aruoshui.fun/i/2026/07/09/phr1o5-2.webp)

这里就先使用：Balanced平衡模式,规则啥的后续都可以再配置，无需担心
> 它允许常用开发服务的流量通过，同时阻止其他所有流量

### 传递凭证
沙箱跟外部隔离后，大多数代理需要其模型提供商的 API 密钥。那么docker sandbox是如何保护的呢？这是官方文章中的说明：

{{ ref_card(title="credentials", url="https://docs.docker.com/ai/sandboxes/security/credentials", image="https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/webp/docker.webp") }}

> 主机上的 HTTP/HTTPS agent会拦截来自沙箱的出站请求，在主机上查找匹配的凭据，并在转发之前覆盖身份验证标头。
> 
> 真实的凭据保留在主机上；沙箱只能看到一个标记值。
> 
> 存储的密钥在操作系统密钥链中静态加密（或在没有密钥链的 Linux 主机上以加密文件的形式存储）

```shell
Manage stored secrets for sandbox environments.

SERVICE SECRETS (e.g. "github", "anthropic", "openai")
  When a sandbox starts, the proxy uses stored secrets to authenticate API
  requests on behalf of the agent. The secret is never exposed directly.
  Scoped globally (shared across all sandboxes) or to a specific sandbox.

REGISTRY SECRETS (e.g. "ghcr.io", "myregistry.azurecr.io")
  Used to pull private template images and kit artifacts before sandbox
  creation. Host-only secrets (no -g) are not injected into sandboxes;
  global secrets (-g) are written as ~/.docker/config.json in every new sandbox.
  Use "sbx secret set --registry <host> --password-stdin" to store them.

Usage:
  sbx secret [command]

Available Commands:
  ls          List stored secrets
  rm          Remove a secret
  set         Create or update a secret
  set-custom  (Experimental) Create or update a custom secret

Flags:
  -h, --help   help for secret

Global Flags:
  -D, --debug   Enable debug logging

Use "sbx secret [command] --help" for more information about a command.
```

##### github cli
可以先配置一下github cli，方便拉取代码,操作远程仓库：

`sbx secret set -g github -t "$(gh auth token)" ` 

gh是github的cli,，安装和使用可以看：

{{ ref_card(title="github cli", url="https://cli.github.com/", image="https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/webp/github-light.webp") }}

##### 传递api请求地址和apikey等凭证数据
如果你使用的是官方的订阅，那很方便了，你不用管，沙箱启动后直接认证登录即可使用，默认的。而如果像我这样大量使用中转站等第三方的调用，就需要主动传递一下。

比如这里在claude中使用，claude的官方订阅key可以直接使用：`sbx secret set -g anthropic`，这里存的环境变量是`ANTHROPIC_API_KEY`，使用这个`sbx secret`能避免将你的key暴露出来：

> 真实的凭据保留在主机上；沙箱只能看到一个标记值
> 
> 当沙箱发出出站请求时，主机端agent会决定三件事：请求是否与工具包（或内置agent）声明的服务匹配、要写入的请求头以及要注入的值。工具包声明匹配项和请求头；主机端则提供请求值。实际的请求值永远不会进入沙箱——agent只能看到一个类似“sentinel likeproxy-managed”的实例。
> 
> 关于这个凭证是保存在那，可以查阅：https://docs.docker.com/ai/sandboxes/security/credentials/

截止v0.34.0版本，目前对应实现的sbx secret有以下几个：
| 服务      | 环境变量              | API 域                                                                                                                   |
| ------------ | ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `anthropic`  | `ANTHROPIC_API_KEY`                | `api.anthropic.com`, `console.anthropic.com`, `claude.ai`, `mcp-proxy.anthropic.com`                                          |
| `cursor`     | `CURSOR_API_KEY`                   | `api2.cursor.sh`, `api3.cursor.sh`, `repo42.cursor.sh`, `cursor.com`                                                          |
| `droid`      | `FACTORY_API_KEY`                  | `api.factory.ai`, `app.factory.ai`, `relay.factory.ai`                                                                        |
| `github`     | `GH_TOKEN`, `GITHUB_TOKEN`         | `api.github.com`, `github.com`, `raw.githubusercontent.com`, `gist.github.com`, `copilot.github.com`, `api.githubcopilot.com` |
| `google`     | `GEMINI_API_KEY`, `GOOGLE_API_KEY` | `generativelanguage.googleapis.com`, `oauth2.googleapis.com`, `aiplatform.googleapis.com`, `vertexai.googleapis.com`          |
| `groq`       | `GROQ_API_KEY`                     | `api.groq.com`                                                                                                                |
| `mistral`    | `MISTRAL_API_KEY`                  | `api.mistral.ai`                                                                                                              |
| `nebius`     | `NEBIUS_API_KEY`                   | `api.studio.nebius.com`, `api.tokenfactory.nebius.com`                                                                        |
| `openai`     | `OPENAI_API_KEY`                   | `api.openai.com`, `openai.com`, `chatgpt.com`, `www.chatgpt.com`                                                              |
| `openrouter` | `OPENROUTER_API_KEY`               | `openrouter.ai`                                                                                                               |
| `xai`        | `XAI_API_KEY`                      | `api.x.ai`                                                                                                                    |

以claude code为例，如果我想使用自己的中转服务或者第三方模型，`ANTHROPIC_API_KEY`是用不了的，中转一般是使用的`ANTHROPIC_AUTH_TOKEN`，我暂时也没有找到合适的secret使用方式。codex呢，也是一样。由于我都是自己建一个模型平台的聚合服务，密钥泄露了就泄露了吧，真无所谓了（其实是买不了官方的：悲）

如果你跟我情况一样，那就需要自己进容器来配置了，稍后会讲到

### 建立一个沙箱
Docker sandbox提供了TUI界面，安装完成后使用命令`sbx`即可打开：

![sbx](https://image.aruoshui.fun/i/2026/07/10/vsbzal-2.webp)

tui界面一看就懂，我们这里使用命令行：

docker sandboxes目前支持：
*claude, codex, copilot, cursor, docker-agent, droid, gemini, kiro, opencode, shell*

首先切换到你的项目目录：`cd ~/my-project`，然后`git init`

当工作区是 Git 仓库时，可以选择三种方式之一将代码与沙箱共享。
1. **直接模式（默认）** 
  
agent拥有对所选的工作目录的读写权限，agent所做的更改会立即反映在主机上。可以像往常一样进行暂存、提交和推送操作。

- 创建名为my-sandbox的沙箱：`sbx create --name my-sandbox claude . ` 

- 进入创建的沙箱：`sbx run --name my-sandbox`

- 正常使用agent开发即可

但是如果有multi-agent，也就是要在同一个代码库上运行多个agent，它们可能会相互干扰更改。这个时候你就可以选择使用克隆模式。

> 模式适用于需要专注完成单个工作流程的场景，且与代理的协作是顺序进行的
 
2. **克隆模式（--clone）**  

需要在创建沙箱命令中添加：--clone

在克隆模式下，沙箱会成为主机上的一个 Git 远程仓库。整个工作目录，包括未跟踪的文件和被 .gitignore 文件排除的文件，都会以只读方式挂载到沙箱内部。 

agent会在沙箱内部提交更改；可以通过从该远程仓库获取更改来将其工作拉取出来。

> **克隆模式（Clone Mode）专为并行处理而设计**：
> 
> 在克隆模式下，一个沙箱环境可以同时承载多个分支。子代理调度器（例如 Claude Code 的 agent-view）可以将任务分配给不同的代理，让每个代理都在克隆环境内的各自分支或工作树上独立地执行任务。

{{ note(header="⚠️ 注意", body="克隆模式在创建时即已确定。要将现有沙箱切换到克隆模式，需要将其删除并重新以克隆模式创建") }}

使用方式： 

- sbx create --clone --name my-sandbox claude .
- sbx run --name my-sandbox
- 为演示我先在主分支上新建一个readme.md文件，然后提交代码（模拟初始仓库）
- 建立分支：可以让agent建分支或者自己使用`sbx exec -it my-sandbox bash`进入沙箱自己用命令建。这里我建名为`feat/my-feature`的分支
  > tips：可以使用/statusline让claude建一个状态栏来方便查看当前分支等。
- 分支开发：于新的`feat/my-feature`分支新建一个md，然后提交代码
- 完成操作后，回到主机上获取其对应的 Git 分支，`<name>`替换成沙箱名： 
  ```shell
  git fetch sandbox-<name>         
  git log sandbox-<name>/feat/my-feature
  git diff main..sandbox-<name>/feat/my-feature
  ```
- 将分支拉取到主机
  ```shell
  # 主机
  git checkout -b feat/my-feature sandbox-<name>/feat/my-feature
  ```

这样就模拟完成了clone模式的一个开发流程。如果想要实现平行开发，可以将每个独立的任务分配给一个单独的子代理。 

Claude Code会在agent view中自动处理子代理的分支隔离。 

实现：单沙箱 + 多分支 + 子代理自动隔离 → 主机 fetch 审查

3. **主机worktree**
这个模式如果不使用沙箱的化也是经常使用的，加上沙箱的化，流程就变成了：
- 主机建 worktree + 分支：
  `git worktree add -b feat/my-feature ../my-feature-work`
- 启动沙箱指向 worktree 
  `sbx run claude ../my-feature-work`
  {{ note(header="⚠️ 注意", body="沙箱内 agent 只改文件，不执行 git 命令。") }}
- 主机审查提交
  ```shell
  cd ../my-feature-work
  git diff
  git add . && git commit -m "feat: my feature"
  git push -u origin feat/my-feature
  ```
- 合并后清理
  git worktree remove ../my-feature-work

--- 
以上介绍的三种模式，开发时候自由选取即可

现在再来详细介绍一下创建沙箱的命令：

```shell
sbx run --name my-sandbox claude   # 在此处启动名为my-sandbox的沙箱，运行claude code 这个agent，喜欢别的agent可以修改 claude 参数
```
> 一旦创建了命名沙箱，`--name` 参数用于从任何工作目录重新连接到该沙箱，无论是否指定位置

运行后会拉取一个对应agent的镜像，完成后会在该终端打开claude code。

plus：添加 `:ro` 可以将额外的工作区挂载为只读模式：`sbx run claude ~/project-a ~/shared-libs:ro ~/docs:ro` 

使用如下命令可以查看系统当前各个沙箱（其实本来就是镜像）的状态：

```shell
sbx ls
SANDBOX       AGENT    STATUS    PORTS   WORKSPACE
my-sandbox    claude   running           ~/my-project
```

这个镜像也是可以自己做的，

### 沙箱网络规则设置　

{{ ref_card(title="本地策略配置", url="https://docs.docker.com/ai/sandboxes/governance/local/", image="https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/webp/docker.webp") }}

{{ ref_card(title="策略概念与语法", url="https://docs.docker.com/ai/sandboxes/governance/concepts/", image="https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/webp/docker.webp") }}

{{ ref_card(title="监控与日志", url="https://docs.docker.com/ai/sandboxes/governance/monitoring/", image="https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/webp/docker.webp") }}


- 默认拒绝（Deny-by-default）：只有明确允许的域名/地址才能访问。
- 仅代理 HTTP/HTTPS：原始 TCP、UDP、ICMP 被网络层阻断。
- 出站请求由宿主机代理转发，代理负责策略判定和凭证注入。

刚开始安装完成就配置过一次`balance`预设，这里是预设的一些说明：
| 预设 | 值 | 说明 |
| :--- | :--- | :--- |
| Open | allow-all | 允许所有出站流量，相当于通配规则 |
| Balanced | balanced | 默认拒绝，但内置 AI API、包管理器、代码托管、镜像仓库、云服务等常用域名的允许列表 |
| Locked Down | deny-all | 全部阻断，需手动添加每一条允许规则 |

#### 使用sbx tui界面
![sbx net ](https://image.aruoshui.fun/i/2026/07/11/10yr57a-2.webp)

- network log 可以看到所有网络访问日志，能够选中每一条来方便的`allow`，`block`
- 切换到network rules，能看到设置的网络规则，可以自己增删（在底部可以看到操作命令），像我这里就自己配置了火山引擎的coding plan服务
- 文件规则，可配置可读可写

#### 使用命令行
##### 全局
```shell
# 允许单个域名
sbx policy allow network api.anthropic.com

# 拒绝单个域名
sbx policy deny network ads.example.com

# 批量添加多个域名/模式（逗号分隔）
sbx policy allow network "api.anthropic.com,*.npmjs.org,*.pypi.org"

# 允许特定 IP + 端口（用于非 HTTP TCP 流量，如 SSH）
sbx policy allow network "10.1.2.3:22"
```

##### 限定到单个沙箱
```
sbx policy allow network --sandbox my-sandbox api.example.com
sbx policy deny network --sandbox my-sandbox ads.example.com
```

---

##### 显示所有生效策略的来源、作用范围、规则摘要。
```shell
# 列出当前策略
sbx policy ls 
```

##### 查看网络请求日志

运行 `sbx policy log` 可查看网络请求日志。输出分为 **Blocked requests** 和 **Allowed requests** 两部分，包含以下列：

| 列 | 含义 |
| :--- | :--- |
| SANDBOX | 发起请求的沙箱 |
| TYPE | 请求类型 |
| HOST | 目标主机 |
| PROXY | 代理方式 |
| RULE | 匹配到的规则 |
| REASON | 附加原因 |
| LAST SEEN | 最近发生时间 |
| COUNT | 发生次数 |

![log](https://image.aruoshui.fun/i/2026/07/11/117bvjf-2.webp)

**PROXY 字段**:
| 值 | 含义 |
| :--- | :--- |
| forward | 经正向代理转发，支持凭证注入 |
| forward-bypass | 经正向代理但不注入凭证 |
| transparent | 透明代理拦截，执行策略但不注入凭证 |
| network | 非 HTTP 流量（原始 TCP/UDP/ICMP）；UDP/ICMP 始终被阻断 |
| browser-open | 进程请求在宿主机浏览器中打开 URL |


### 沙箱配置
默认的沙箱配置是：

```markdown
### 系统基础

| 项目 | 内容 |
| :--- | :--- |
| OS | Ubuntu 26.04 LTS（Resolute Raccoon） |
| Kernel | Linux 7.0.11 x86_64 |
| CPU | 20 核 |
| 内存 | 16 GB（可用约 14 GB） |
| 磁盘 | 20 GB overlay，几乎空闲 |
| 用户 | agent（uid 1000），属于 sudo、docker 组 |
| Shell | /bin/bash |

### 已安装的开发工具

| 工具 | 版本 / 路径 |
| :--- | :--- |
| Node.js | v22.22.1 |
| npm | 已安装 |
| Python | 3.14.4 |
| pip / uv | 已安装 |
| Java | 已安装 |
| Go | 已安装 |
| Docker | 29.6.1 |
| Git | 2.53.0 |
| GitHub CLI (gh) | 2.46.0 |
| Rust (rustc/cargo) | 未安装 |

### Docker 环境

- Docker daemon 在沙箱内可直接访问
- `docker` 和 `docker compose` 插件都可用

### 网络与代理

- **DNS**：172.17.0.0、fd36:73b3:761d::
- **搜索域**：my-sandbox.docker.internal
- **HTTP/HTTPS 流量走代理**：gateway.docker.internal:3128
- **no_proxy**：包含 localhost、127.0.0.1、::1、gateway.docker.internal
- Java、Node 等工具已配置好代理环境变量
- 代理 CA 证书以 `PROXY_CA_CERT_B64` 注入

### Git 相关

- 沙箱内运行着一个 git-daemon（端口 9418），用于 clone 模式下主机拉取分支
- GitHub token 已自动注入为 `GH_TOKEN`，所以 `gh` 和 HTTPS push 通常可直接使用

### 持久化环境

- 可以向`/etc/sandbox-persistent.sh` 里面追加 `export` 来持久化环境变量

```

### 主机和沙箱之间传递文件
sbx cp命令可以在主机和沙箱之间复制文件或目录：

```shell
sbx cp <host path> <sandbox>:<path>
sbx cp <sandbox>:<path> <host path> 
```
只不过不支持在两个沙箱之间传递文件，得通过主机作为一个跳板来实现（可能后续版本会加上吧）

### 沙箱中让agent放手一搏
我使用的omarchy系统有一个小功能：

![password less](https://image.aruoshui.fun/i/2026/07/11/z8d60a-2.webp)

能让系统临时15分钟免密使用sudo
> 在 /etc/sudoers.d/ 里写一条 NOPASSWD 规则，任何属于该用户的进程（含 agent 子进程、后台任务）都能免密，然后使用用 `systemd-run --on-active=15m` 起一个一次性 transient timer

现在到沙箱中，拥有 sudo 权限，就完全可以为所欲为了，自由安装软件依赖包什么的，不限制agent完成开发。

#### github cli
通过前边secret凭证，就能直接使用gh来跟github互通，且默认的网络配置已经做好

![github](https://image.aruoshui.fun/i/2026/07/11/10o0q2r-2.webp)

#### docker 

| 项目 | 内容 |
| :--- | :--- |
| Docker 版本 | 29.6.1 |
| containerd | 已运行 |
| Storage Driver | overlayfs |
| Cgroup Driver | cgroupfs |
| Cgroup 版本 | v2 (/sys/fs/cgroup 是 cgroup2) |
| Runtime | runc (/usr/bin/runc) |
| Docker Root | /var/lib/docker |
| BuildKit | v0.31.1，默认启用 |
| CPU / 内存 | 20 核 / 约 15 GB（主机与沙箱是共享的） |

环境配置足够实现在沙箱环境中构建的镜像和容器，这是是在沙箱的私有 Docker 守护进程上运行的，而不是在主机上。

{{ note(header="⚠️ 注意", body="当沙箱被删除时，这些镜像和容器也会被删除。") }}

### 沙箱和主机之间的服务贯通

#### 沙箱访问主机服务

1. 宿主机启动服务，绑定到 0.0.0.0（或 localhost）
2. 沙箱里配置策略：
sbx policy allow network localhost:<port>
3. 沙箱内用 host.docker.internal:<port> 访问：
curl http://host.docker.internal:<port>

> 沙箱内的 Docker 容器要访问主机服务时，同样用 host.docker.internal:<port>。

例如访问本地 Ollama：

```bash
sbx policy allow network localhost:11434
curl http://host.docker.internal:11434
```
---

#### 二、主机访问沙箱服务

我们在沙箱内使用docker启动一个服务：

`docker run -d --name demo-nginx --restart unless-stopped -p 8080:80 nginx:alpine`

沙箱默认对主机隔离，主机上的工具无法直接连接沙箱内的端口。需要通过 `sbx ports` 把宿主机端口映射到沙箱端口。

当前服务已监听沙箱的 0.0.0.0:8080。

![nginx](https://image.aruoshui.fun/i/2026/07/11/12btbs1-2.webp)

**基本用法**

```bash
# 宿主机 8080 端口转发到 my-sandbox 的 8080 端口
sbx ports my-sandbox --publish 8080:8080

# 然后在宿主机访问
open http://localhost:8080
```

**让系统自动分配宿主机端口**

```bash
sbx ports my-sandbox --publish 8080
# Published 127.0.0.1:32772 -> 8080/tcp
# Published [::1]:32772 -> 8080/tcp

sbx ports my-sandbox   # 查看实际分配的宿主机端口
```

**查看和删除映射**

```bash
# 查看当前映射
sbx ports my-sandbox
sbx ls

# 删除映射
sbx ports my-sandbox --unpublish 8080:8000

# 只指定沙箱端口，删除所有映射到该沙箱端口的宿主机端口
sbx ports my-sandbox --unpublish 8080
```

**关键要求**

1.  **服务必须监听所有接口**
    沙箱内的服务不能仅绑定 `127.0.0.1`，必须绑定 `0.0.0.0` 或 `[::]`，否则转发无法命中。

    ```bash
    # 例如 Vite
    npm run dev -- --host 0.0.0.0

    # 例如 Python HTTP server
    python -m http.server 3000 --bind 0.0.0.0
    ```

2.  **只能在沙箱运行后发布端口**
    `sbx run` 和 `sbx create` 没有 `--publish` 参数，必须先启动沙箱，再执行 `sbx ports`。