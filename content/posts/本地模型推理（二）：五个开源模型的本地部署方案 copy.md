+++
title = "本地模型推理（二）：五个开源模型的本地部署方案"
date = 2026-04-09
authors = ["ruoshui"]

[taxonomies]
tags = ["local llm"]

[extra]
comment = true
repo_view = true
+++

zai-org/GLM-5.1
gemma-4-31b
glm-4.7-flash
Qwen3.5-397B-A17B-GGUF
Qwen/Qwen3-Coder-Next
MiniMax-M2.5
Llama 4



## 写在前面

1. `zai-org/GLM-5.1`
2. `google/gemma-4-31B`
3. `MiniMaxAI/MiniMax-M2.5`
4. `Qwen/Qwen3.5-397B-A17B`
5. `Qwen/Qwen3-Coder-Next`
6. `glm-4.7-flash`
7. `llama 4`

文档主要关心三件事：

- 官方推荐用什么后端部署
- 本地怎么起服务
- 对硬件到底友不友好

注意：
> **MoE 模型的“激活参数”影响算力和吞吐，但“总参数”依然决定你要存下多少权重。**
>
> 也就是说，`A17B`、`A3B` 这种命名看起来很美好，不代表它们能像 17B / 3B 的 dense 模型一样轻松塞进一张消费级显卡里。

## 硬件判断口径

### 1. 权重体积的粗略算法

- BF16 / FP16：约 `2 bytes / 参数`
- FP8 / INT8：约 `1 byte / 参数`
- 4-bit：约 `0.5 bytes / 参数`

### 2. 长上下文特别吃内存

这些模型很多都在打 `128K`、`196K`、`256K` 甚至 `1M` 上下文。

真要本地跑，**上下文长度往往比模型本体更容易把你顶爆显存**。所以我的建议通常会分成两档：

- **实验 / 自用**：先把 context 收到 `16K ~ 64K`
- **生产 / 多用户并发**：再去考虑满血长上下文

## 1. GLM-5.1

### 模型情况

- 官方仓库：[zai-org/GLM-5](https://github.com/zai-org/GLM-5)
- 官方博客：[GLM-5.1](https://z.ai/2blog/glm-5.1)
- 权重页：[zai-org/GLM-5.1](https://huggingface.co/zai-org/GLM-5.1)
- 规格：`744B-A40B`

`GLM-5.1` 和 `GLM-5` 都是 `744B-A40B`，同时放出了 `BF16` 和 `FP8`。

### 官方支持的本地后端

- `vLLM`
- `SGLang`
- `xLLM`
- `KTransformers`

其中 `vLLM` 和 `SGLang` 是主线方案，`Ascend NPU` 还单独给了 `ascend.md`。

### 代表性部署方式

`vLLM` 有 `GLM-5.1-FP8` 的示例：

```bash
vllm serve zai-org/GLM-5.1-FP8 \
  --tensor-parallel-size 8 \
  --tool-call-parser glm47 \
  --reasoning-parser glm45 \
  --enable-auto-tool-choice \
  --served-model-name glm-5.1-fp8
```

`SGLang` 官方仓库里的示例也是同一个思路：

```bash
SGLANG_ENABLE_SPEC_V2=1 sglang serve \
  --model-path zai-org/GLM-5.1-FP8 \
  --tp-size 8 \
  --tool-call-parser glm47 \
  --reasoning-parser glm45 \
  --served-model-name glm-5.1-fp8
```

### 硬件判断

- `vLLM` 官方 recipe 写明的示例硬件是 **8x H200 / H20，141GB x 8**
- `BF16` 权重按参数量估算大约在 **1.5TB** 级别
- 就算换成 `FP8`，权重本体也还是 **700GB+** 级别

## 2. Gemma 4 31B

### 模型情况

- 官方文档：[Gemma docs](https://ai.google.dev/gemma/docs/core)
- 模型卡：[Gemma 4 model card](https://ai.google.dev/gemma/docs/core/model_card_4)
- 权重页：[google/gemma-4-31B](https://huggingface.co/google/gemma-4-31B)
- 规格：`30.7B dense`，支持图文输入，`256K` context

Gemma 4 系列有 dense 和 MoE 两条线，`31B` 这颗是 dense，因此它的部署判断反而简单很多。

### 官方/主流本地后端
Gemma 4 的生态最完整的一档：

- `Transformers`
- `vLLM`
- `SGLang`
- `llama.cpp`
- `Ollama`
- `MLX`

Google 官方文档里明确说可以直接用最新版 `Transformers` 起步，社区生态又很快把 `GGUF`、`Ollama`、`MLX` 都补齐了。

### 最简单的本地起步
官方文档给的 `Transformers` 写法很直接：
```python
from transformers import AutoProcessor, AutoModelForCausalLM

MODEL_ID = "google/gemma-4-31B-it"
processor = AutoProcessor.from_pretrained(MODEL_ID)
model = AutoModelForCausalLM.from_pretrained(
    MODEL_ID,
    dtype="auto",
    device_map="auto",
)
```

想直接变成 OpenAI 兼容服务，则使用 `vLLM` / `SGLang`；

### 硬件情况
Gemma 官方文档给出了推理内存参考：

| 精度 | 大致内存需求 |
| --- | --- |
| BF16 | `58.3 GB` |
| 8-bit | `30.4 GB` |
| 4-bit | `17.4 GB` |

本地落地范围：
- **4-bit**：单张 `24GB` 显卡、`32GB` 以上统一内存的 Mac、或者 `16GB VRAM + RAM offload` 都有机会
- **8-bit**：更适合 `48GB` 级别显卡 / `64GB+` 统一内存
- **BF16**：更像 `80GB` 级别卡或双卡环境
