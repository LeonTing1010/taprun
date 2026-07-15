# Tap × WorkBuddy 集成（草稿）

本目录是 Tap 接入 **Tencent WorkBuddy** 的分发草稿，独立于 `taprun/` 根下的 `.claude-plugin`
插件（后者供 Claude Code / CodeBuddy Code 使用）。WorkBuddy 是桌面级 AI Agent 工作台，支持
**MCP 生态 + 自定义 Skills**，受众正是 Tap 想触达的非技术个体户 / SMB——因此它是比 Claude Code
插件市场更宽的分发通道。

## 1. 连接 Tap MCP（一次性）

WorkBuddy 通过 `~/.workbuddy/mcp.json`（用户级，所有项目复用）或 `<项目>/.workbuddy/mcp.json`
（项目级）以 stdio 接入。填入标准 `mcpServers` 配置：

```json
{
  "mcpServers": {
    "tap": {
      "command": "npx",
      "args": ["-y", "@taprun/cli", "mcp", "stdio"]
    }
  }
}
```

也可在 WorkBuddy 界面操作：侧边栏 → 插件 → MCP 服务器 → 配置 MCP，可视化粘贴。

> 首次连接时 `npx` 会拉取约 50MB 引擎，首次握手可能需最多一分钟。若连接超时，可在启动 WorkBuddy
> 时放宽：`MCP_TIMEOUT=120000`。

连接后，用自然语言描述需求，WorkBuddy 会自动调用 Tap 的 `capture / verify / mark / run` 四个动词
及 `tap://{site}/{name}` 资源。

## 2. 安装三个 Skill（让 agent 知道何时用 Tap）

三种方式任选其一：

- **SkillHub 一键安装**（若已发布到 SkillHub）
- 把 `skills/<name>/SKILL.md` **拖入聊天框**自动导入
- 放入 `~/.workbuddy/skills/` 后**重启 WorkBuddy**

| Skill | 作用 |
|---|---|
| `tap-capture-replay` | 教 agent：重复 + 已登录的浏览器任务用 Tap 录制一次、零 token 重放 |
| `tap-setup` | 已登录站点的自适应安装（诊断优先、只补缺失环、两道人工信任闸门） |
| `tap-triggers` | 声明 tap 何时无人值守运行（launchd，零 token） |

## 3. 分发下一步（尚未执行）

两份发布操作清单，分别覆盖"连引擎"与"装 Skill"两条链路：

- **[MCP 市场发布清单](./MCP_MARKET_PUBLISH_CHECKLIST.md)** —— 将 Tap 作为 MCP server 条目发布到
  [腾讯云 MCP 市场](https://cloud.tencent.com/developer/mcp)，实现一键连上引擎（含闭源合规等不确定项的确认）。
- **[SkillHub 发布清单](./SKILLHUB_PUBLISH_CHECKLIST.md)** —— 将三个 Skill 发布到 SkillHub，让非技术用户直接发现并装上。

> 顺序：先 MCP 市场（一键连引擎），后 SkillHub（教 agent 何时用）。详见各清单第 4/5 步的配合说明。

完成这两步，Tap 即借 WorkBuddy 已聚好的消费者买家，直接补上"漏斗卡在极窄技术人群"的分发缺口。

## 与 `.claude-plugin` 插件的关系

`.claude-plugin/` 下的 `tap` 插件供 Claude Code / CodeBuddy Code（编码 Agent，插件格式兼容）。
本目录面向 WorkBuddy（办公 Agent 工作台），复用**同一套引擎与 MCP server**，仅补充 WorkBuddy
格式的 Skills。引擎零改动。
