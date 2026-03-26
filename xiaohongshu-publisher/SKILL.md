---
name: xiaohongshu-publisher
description: "Publish image-text notes to Xiaohongshu (小红书) via opencli. Use when user wants to post to Xiaohongshu, publish a note, share content on 小红书. Prerequisites: opencli must be installed, Chrome extension connected, and logged into creator.xiaohongshu.com."
argument-hint: '<content> [--title <title>] [--images <paths>]'
license: MIT
metadata:
  author: LeonTing1010
  version: '1.0.0'
---

# 小红书图文笔记发布

通过 opencli 发布小红书图文笔记。

## 前置条件

- `opencli` 已安装（`npm i -g @jackwener/opencli`）
- Chrome 已安装 opencli Browser Bridge 扩展
- Chrome 已登录 creator.xiaohongshu.com

## 使用场景

用户说 "发小红书"、"发个笔记"、"发到小红书"、"写篇小红书" 时触发。

## 核心流程

```
① 确认内容 → 标题（≤20字）、正文、图片、话题
② 如果需要生成图片 → 调用 jimeng-generator skill
③ 如果图片是 URL → 先下载到本地
④ 发布笔记
⑤ 确认结果
```

## 约束

- 标题最多 **20 个字符**，超了必须缩短
- 图片最多 **9 张**，支持 jpg/png/gif/webp
- 图片必须是**本地路径**，URL 需先下载
- 话题不含 `#` 号

## 命令

### 发布笔记

```bash
opencli xiaohongshu publish "<正文内容>" \
  --title "<标题>" \
  --images "<图片路径1>,<图片路径2>" \
  --topics "<话题1>,<话题2>"
```

### 存为草稿

```bash
opencli xiaohongshu publish "<正文>" \
  --title "<标题>" \
  --images "<图片路径>" \
  --draft
```

### 查看创作者数据

```bash
opencli xiaohongshu creator-profile    # 账号信息
opencli xiaohongshu creator-notes      # 笔记列表
opencli xiaohongshu creator-stats      # 数据总览
```

## 示例：完整图文发布

```bash
# 1. 生成封面图（可选，配合 jimeng-generator skill）
opencli jimeng generate "极简科技风插画，暗色背景"
sleep 35
# 获取图片 URL
IMG_URL=$(opencli jimeng history --limit 1 -f json | python3 -c "import json,sys; print(json.load(sys.stdin)[0]['image_url'])")
# 下载到本地
curl -sL "$IMG_URL" -o /tmp/cover.webp

# 2. 发布
opencli xiaohongshu publish "笔记正文内容..." \
  --title "标题不超过20字" \
  --images "/tmp/cover.webp" \
  --topics "话题1,话题2"
```

## 图片准备规则

1. 用户提供本地路径 → 直接用
2. 用户提供 URL → `curl -sL <url> -o /tmp/xhs_img_N.webp` 下载后用
3. 用户要求生成图片 → 先调 jimeng-generator，下载后用
4. 多张图片用逗号分隔：`--images "/tmp/a.webp,/tmp/b.webp"`
