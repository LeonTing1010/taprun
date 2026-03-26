---
name: jimeng-generator
description: "Generate images using 即梦AI (Jimeng) via opencli. Use when user wants to generate images, create AI artwork, or produce photos from text descriptions. Prerequisites: opencli must be installed and Chrome extension must be connected."
argument-hint: '<prompt> [--count <N>]'
license: MIT
metadata:
  author: LeonTing1010
  version: '2.0.0'
---

# 即梦AI 图片生成

通过 opencli 调用即梦AI生成图片。

## 前置条件

- `opencli` 已安装（`npm i -g @jackwener/opencli`）
- Chrome 已安装 opencli Browser Bridge 扩展
- Chrome 已登录 jimeng.jianying.com

## 使用场景

用户说 "生成图片"、"画一张"、"做个封面"、"AI 作图" 时触发。

## 核心流程

```
① 确认需求 → 几张图？什么内容？
② 触发生成（异步，不等待）
③ 等待 30-40 秒
④ 查询结果，拿到图片 URL
⑤ 返回给用户
```

## 精准控制规则

- **调用次数 = ceil(需要的图片数 / 每次生成数)**，不多不少
- 每次 generate 生成 3-4 张图
- generate 是异步的，触发后立即返回
- history 可以多次调用，但拿到图片就返回，不重复返回已有的
- 所有图片 URL 去重后返回

## 命令

### 触发生成

```bash
opencli jimeng generate "<prompt>"
# 返回 status=submitted，约 20 秒
# 每次生成 3-4 张图
```

### 查询结果

```bash
opencli jimeng history --limit <N>
# 返回最近 N 条记录的所有图片
# 每条记录展开为多行（每行一张图）
# 输出列: prompt, status, image_url, created_at
```

### 输出格式

支持 `-f json`、`-f yaml`、`-f csv`、`-f md`（默认 table）。
用 `-f json` 方便程序化处理。

## 示例

### 生成 6 张图

```bash
# 1. 触发 2 次生成（每次 3-4 张）
opencli jimeng generate "森林中的小屋，阳光透过树叶"
opencli jimeng generate "森林中的小屋，阳光透过树叶"

# 2. 等待 30-40 秒
sleep 35

# 3. 查询结果
opencli jimeng history --limit 2
# 返回 6-8 张图片 URL
```

### 生成 3 张图

```bash
opencli jimeng generate "赛博朋克城市夜景"
sleep 35
opencli jimeng history --limit 1
```

## 模型选择

| model 值 | 版本 | 说明 |
|----------|------|------|
| `high_aes_general_v50` | 5.0 Lite | 默认 |
| `high_aes_general_v42` | 4.6 | 当前实测最稳定 |
| `high_aes_general_v40` | 4.0 | 旧版 |
