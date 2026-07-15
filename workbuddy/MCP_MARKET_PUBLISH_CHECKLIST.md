# 腾讯云 MCP 市场发布清单（Tap MCP Server）

把 Tap 的 MCP server（`npx @taprun/cli mcp stdio`）发布到腾讯云 MCP 市场，让 WorkBuddy /
CodeBuddy 用户能**一键连上 Tap 引擎**。这是 SkillHub 三件套的**前置依赖**——用户必须先连上
MCP，Skill 才调得动 Tap。

> 官方参考：云开发 MCP 市场「上架」指南 https://docs.cloudbase.net/ai/mcp/develop/publish
> 市场入口：https://cloud.tencent.com/developer/mcp

---

## 0. 上架前自检（硬性门槛）

- [ ] **代码开源 + 商业友好许可证**：Tap 引擎私有（proprietary），但 MCP server 的接入形态是
      `npx @taprun/cli`——需确认市场是否接受"以 npx 包形式分发、引擎闭源"的提交。
      ⚠️ 这是**最关键的不确定项**：CloudBase 上架指引默认要求"代码开源（MIT/Apache）"。
      Tap 的 `@taprun/cli` 走 npm 发布、引擎闭源，与"仓库开源"要求可能冲突。
      **行动**：先就"闭源引擎 + 开放 npm 包/CLI"的合规性，向市场审核方确认，再决定提交形态。
- [ ] **安全性**：MCP server 不读取用户本地非必要数据。Tap 的本地优先设计天然契合（凭据不出本机）；
      但 `op:fetch` 会按 plan 发起网络请求——需在 `DOC.md` 里如实说明，避免审核以"越权访问"打回。
- [ ] **Transport 类型 = Stdio**：Tap 用 `npx @taprun/cli mcp stdio`，符合 Stdio 要求。✅

---

## 1. 准备上架文档与配置

按官方要求准备两个文件（参考模板 https://cnb.cool/cloudbase/mcp-tpl ）：

### 1.1 `meta.json`（市场配置）

```json
{
  "name": "tap",
  "title": "Tap — 本地优先的登录态浏览器自动化",
  "description": "在你的真实 Chrome 里录制一次浏览器任务，之后零 token 确定性重放；凭据不出本机。",
  "author": { "name": "LeonTing1010" },
  "gitUrl": "https://github.com/LeonTing1010/tap",
  "tags": ["browser-automation", "local-first", "zero-token", "productivity"],
  "logo": ["<Logo URL>"],
  "env_params": {}
}
```

> ⚠️ 字段以官方 `meta.json` schema 为准（`name/title/description/author/gitUrl/tags/port/logo/env_params`）。
> Tap 是 stdio、无端口、无必填环境变量，故 `port` 省略、`env_params` 留空。
> `logo` 需提供一个可公网访问的图片 URL。

### 1.2 `DOC.md`（展示文档）

展示在市场详情页，建议覆盖：

- [ ] 一句话定位：本地优先、登录态、零 token 重放的浏览器自动化。
- [ ] 安装/连接方式：WorkBuddy 用户级 `~/.workbuddy/mcp.json` 填入
      `{ "mcpServers": { "tap": { "command": "npx", "args": ["-y", "@taprun/cli", "mcp", "stdio"] } } }`；
      或 CodeBuddy 的 MCP 配置。
- [ ] 四个动词：`capture / verify / mark / run` + `tap://{site}/{name}` 资源说明。
- [ ] 典型场景：每月拉发票/账单、登录后数据抓取、定期巡检。
- [ ] 明确的限制（避免过度承诺）：仅 macOS/Windows + Chromium 浏览器；首次 `npx` 拉取约 50MB 引擎。

---

## 2. 提交上架

1. 打开提交表单：https://doc.weixin.qq.com/forms/AJEAIQdfAAoALAAaAa6ACgYH8yRdSbQif#/fill
   （「提交 云开发 MCP Server 模板 / 需求」）
2. 填写上架信息：选「提交模板」，填 MCP Server 名称、代码仓库、联系方式。
3. 若依赖特殊环境变量，提供测试用环境变量供审核（Tap 无需，可跳过）。
4. 点击**提交**，等待审核。
5. 审核通过后，MCP 市场展示 Tap，用户可一键安装。

---

## 3. 审核与时效

- 审核方会验证 MCP Server 可在云开发中部署/运行通过（stdio 形态下，重点验 `npx @taprun/cli mcp stdio` 能起、工具列表正常）。
- 时效随复杂度而定；不通过会返回原因 → 修改后重提。
- 上架后建议在项目文档加友情链接，引导用户到市场一键安装。

---

## 4. 与 SkillHub 三件套的配合（关键）

**顺序：先 MCP 市场，后 SkillHub。**

| 链路 | 解决什么 | 发布位置 |
|---|---|---|
| 腾讯云 MCP 市场 | 一键连上 Tap 引擎（capture/verify/mark/run + tap:// 资源） | 本清单 |
| SkillHub 三件套 | agent 知道"何时用 Tap"（重复+登录任务） | `SKILLHUB_PUBLISH_CHECKLIST.md` |

- [ ] MCP 市场上架后，回填 `taprun/workbuddy/README.md`「分发下一步」，标记"MCP 市场条目"已完成。
- [ ] 在 SkillHub 清单第 5 步收尾项里，明示"装 Skill 前需先连 Tap 的 MCP"——否则用户装了 Skill 却无引擎可调。

---

## 5. 待确认的不确定项（提交前必须厘清）

1. **闭源引擎能否上架**：市场默认要求"代码开源"。需向审核方确认 `@taprun/cli`（npm 开放、引擎闭源）是否被接受。
2. **`meta.json` 字段枚举**：`tags` 取值、是否必填 `port`（stdio 应可省）。
3. **提交表单归属**：表单是"云开发 MCP 市场"通道；确认它与 WorkBuddy 内置 MCP 市场是同一入口（README 里写的"腾讯云 MCP 市场"）。

> 若闭源合规无法走通，备选方案：不进市场，仅在 WorkBuddy 文档/README 里提供 `mcp.json` 片段让用户手动粘贴
> （仍是零代码、可视化粘贴，只是非"一键"）。
