---
name: jimeng-generator
description: "Generate images using 即梦AI (Jimeng) via opencli. Use when user wants to generate images, create AI artwork, or produce photos from text descriptions. Prerequisites: opencli must be installed and Chrome extension must be connected."
---

# 即梦图片生成器

通过 opencli 调用即梦AI 生成图片。

## 快速开始

```bash
# 设置较长超时（图片生成需要时间）
export OPENCLI_BROWSER_COMMAND_TIMEOUT=180000

# 生成图片
opencli jimeng generate "a beautiful sunset over ocean"
```

## 查看历史

```bash
opencli jimeng history
```

## 常见用法

```bash
# 英文 prompt（效果更稳定）
opencli jimeng generate "beautiful woman photo, realistic style"

# 中文 prompt
opencli jimeng generate "一个穿着汉服的古典美女"

# 风景
opencli jimeng generate "mountain landscape, sunrise, photorealistic"

# 艺术风格
opencli jimeng generate "cyberpunk city, neon lights, digital art"
```

## 前提条件

1. 安装 opencli：`npm install -g @jackwener/opencli`
2. 安装 Chrome 扩展：
   - 下载：`https://github.com/jackwener/opencli/releases` → `opencli-extension.zip`
   - 打开 `chrome://extensions`，开启 Developer mode
   - Load unpacked → 选择解压文件夹
3. 验证：`opencli doctor`
