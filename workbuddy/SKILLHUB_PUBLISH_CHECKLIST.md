# SkillHub 发布操作清单（Tap 三件套）

把 `taprun/workbuddy/skills/` 下的三个 Skill 发布到 SkillHub，让 WorkBuddy 用户能一键安装。
本清单依据 SkillHub 官方发布流程（CLI + 官网两种路径）整理，并针对 Tap 的现状标注了待办。

> 官方参考：https://cloud.tencent.com/developer/article/2697005
> 平台：https://skillhub.cn ｜ CLI 安装：`curl -fsSL https://skillhub.cn/install/install.sh | bash`

---

## 0. 前置：补充 frontmatter 必填字段（发布前必须）

SkillHub 要求 `SKILL.md` 的 YAML frontmatter 含以下**必填**字段，而我们现有草稿只写了
`name / description / version / tags`。发布前需给每个 Skill 补上：

| 字段 | 说明 | Tap 建议值 |
|---|---|---|
| `name` | 技能名称（已有） | `tap-capture-replay` / `tap-setup` / `tap-triggers` |
| `description` | 技能描述（已有） | 沿用现有中文描述 |
| `version` | 版本号（已有） | `1.0.0` 起 |
| `category` | **技能分类（缺）** | `browser-automation` 或 `效率工具`（需确认 SkillHub 允许的分类枚举） |
| `platforms` | **支持平台（缺）** | `["workbuddy"]`（或 `"macos"`/`"windows"` 视 SkillHub 取值） |

> ⚠️ 先确认 SkillHub 的 `category` / `platforms` 取值枚举（在 `skillhub init` 或官网表单里可见），
> 避免审核因字段非法被打回。本清单未假设具体枚举值。

---

## 1. 本地测试（提交审核前）

对每个 Skill，在 WorkBuddy 里实测，确认 agent 能正确读取并执行：

- [ ] 把 `SKILL.md` 拖入 WorkBuddy 聊天框（或放入 `~/.workbuddy/skills/` 后重启），确认被识别。
- [ ] `tap-capture-replay`：用一句自然语言（如"帮我把每天查 GitHub trending 做成自动化"）触发 capture → run，确认零 token 重放。
- [ ] `tap-setup`：在已登录站点跑 `npx -y @taprun/cli embed --verify`，确认阶梯诊断输出正常、两道人工闸门提示到位。
- [ ] `tap-triggers`：写一份 `.trigger.json`，跑 `tap schedule` 确认编译为 launchd plist（macOS）。
- [ ] 边界输入：命令缺失 / 网络断开 / 网站改版时，Skill 不崩溃、给出可懂的错误。

---

## 2. 发布方式 A：CLI（推荐，便于版本管理）

```bash
# 2.1 安装 CLI
curl -fsSL https://skillhub.cn/install/install.sh | bash
skillhub -h                        # 验证安装

# 2.2 登录（浏览器或账号密码）
skillhub login

# 2.3 逐个初始化项目（每个 Skill 一次）
cd taprun/workbuddy/skills/tap-capture-replay
skillhub init --name tap-capture-replay --category <分类>

cd ../tap-setup
skillhub init --name tap-setup --category <分类>

cd ../tap-triggers
skillhub init --name tap-triggers --category <分类>

# 2.4 推送文件（不立即上线）
skillhub push

# 2.5 提交审核
skillhub publish
```

> `skillhub push` 只上传、`skillhub publish` 才提交审核。
> 三个 Skill 分别独立发布（SkillHub 以单个 SKILL.md 为单元）。

---

## 3. 发布方式 B：官网（图形界面）

1. 访问 https://skillhub.cn，登录账号，进入**技能发布**页面。
2. 填写技能信息（名称 / 描述 / 版本 / **分类** / **平台**）——对应 frontmatter 字段。
3. 上传 `SKILL.md`（及相关资源文件；Tap 三个 Skill 目前只有 SKILL.md，无额外资源）。
4. （可选）使用 AI 辅助生成优化 SKILL.md 文案。
5. 提交审核。

---

## 4. 审核（三线并行）

提交后平台做三线安全审核，**全部通过**才上架：

1. 内容合规过滤
2. 科恩实验室深度漏洞扫描
3. 云鼎实验室 AI 模型安全评估

- 审核时长随技能复杂度而定；简单技能较快。
- 不通过会返回原因 → 按原因修改后重新提交。
- 上架后接受 **TRACE 评测**（Trust / Reliability / Adaptability / Convention / Effectiveness），
  规范写法、完整说明、充分示例有助于评分。

---

## 5. 上架后：确认可安装 & 收尾

- [ ] 在 SkillHub 搜索 `tap-capture-replay` / `tap-setup` / `tap-triggers`，确认可搜到且状态为上架。
- [ ] 在 WorkBuddy 里用 SkillHub 一键安装任一个，确认拉取成功。
- [ ] 回填到 `taprun/workbuddy/README.md` 的"分发下一步"，把"发布到 SkillHub"标记为已完成。
- [ ] 三个 Skill 共用同一引擎（MCP server `npx @taprun/cli mcp stdio`）；用户仍需按 README 第 1 节连接 MCP，
      Skill 本身只教 agent "何时用 Tap"。可在 Skill 描述或 README 里明示这一依赖，避免用户装了 Skill 却没连 MCP。

---

## 6. 与 MCP 市场发布的配合

SkillHub 解决"agent 何时用 Tap"；**腾讯云 MCP 市场**解决"一键连上 Tap 的 MCP server"。
两者互补：

- 先发 MCP 市场条目 → 用户一键连上 Tap（含 `capture/verify/mark/run` + `tap://` 资源）。
- 再发 SkillHub 三件套 → agent 知道在重复/登录类任务上调用 Tap。

建议顺序：**MCP 市场条目优先**（否则 Skill 装了也无引擎可调），SkillHub 其次。

> 配套 MCP 市场发布清单另见 `taprun/workbuddy/MCP_MARKET_PUBLISH_CHECKLIST.md`（待起草）。
