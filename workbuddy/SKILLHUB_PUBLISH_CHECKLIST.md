# SkillHub 发布操作清单（Tap 三件套）

把 `taprun/workbuddy/skills/` 下的三个 Skill 发布到 SkillHub，让 WorkBuddy 用户能一键安装。
本清单依据 **已安装并审阅的 SkillHub CLI（`~/.skillhub/skills_store_cli.py`）实际行为** 整理，
不依赖任何官方文档假设。命令均已用 `--dry-run` 在本机验证通过。

> 平台：https://skillhub.cn
> CLI 安装：`curl -fsSL https://skillhub.cn/install/install.sh | bash`
> 官方参考：https://cloud.tencent.com/developer/article/2697005

---

## 0. 前置：frontmatter 必填字段（发布前必须）

通过审阅 CLI 的 `_validate_metadata()` 与 publish payload 组装逻辑，确认 SkillHub 对
`SKILL.md` frontmatter 的**硬要求**是三个字段，其余为可选：

| 字段 | 是否必填 | 说明 | Tap 已填值 |
|---|---|---|---|
| `slug` | **必填** | kebab-case，3–128 字符（正则校验） | `tap-capture-replay` / `tap-setup` / `tap-triggers` |
| `version` | **必填** | 合法 SemVer | `1.0.0` / `1.1.0` / `1.0.0` |
| `displayName` | **必填** | 人类可读名称 | 已补（见各 SKILL.md） |
| `name` | 运行时用（WorkBuddy 读） | 与 slug 一致即可 | 已有 |
| `description` | 可选（进 payload） | 长描述 | 已有 |
| `summary` | 可选（进 payload） | 一句话摘要 | 可补，未强制 |
| `tags` | 可选（进 payload） | 标签数组 | 已有 |
| `license` / `homepage` | 可选（进 payload） | — | 可补，未强制 |
| `category` / `platforms` | **不在 publish payload 内** | CLI 不校验、不上传；仅供 WorkBuddy 运行时/官网表单参考 | `效率工具` / `[macos, windows]` |

> ⚠️ **重要纠正（与旧版清单不同）**：CLI 的 `publish` 请求体只含
> `slug / version / displayName / summary / description / tags / license / homepage / changelog`，
> **`category` 与 `platforms` 完全不参与发布契约**。因此：
> - 分类（如 `效率工具`）若需在 SkillHub 网站上展示，应在**官网表单**提交时填写，而非靠 frontmatter。
> - 之前担心的"`category` 枚举非法会被打回"对 CLI 发布路径不成立——它根本不发这个字段。
> - `category` / `platforms` 保留在 frontmatter 中是给 WorkBuddy 运行时识别用的，无害。

三个 SKILL.md 的 `slug` + `displayName` 已补齐，并用 `--dry-run` 验证全部通过
（见文末"验证记录"）。

---

## 1. 本地测试（提交审核前）

对每个 Skill，在 WorkBuddy 里实测，确认 agent 能正确读取并执行：

- [ ] 把 `SKILL.md` 拖入 WorkBuddy 聊天框（或放入 `~/.workbuddy/skills/` 后重启），确认被识别。
- [ ] `tap-capture-replay`：用一句自然语言（如"帮我把每天查 GitHub trending 做成自动化"）触发 capture → run，确认零 token 重放。
- [ ] `tap-setup`：在已登录站点跑 `npx -y @taprun/cli embed --verify`，确认阶梯诊断输出正常、两道人工闸门提示到位。
- [ ] `tap-triggers`：写一份 `.trigger.json`，跑 `tap schedule` 确认编译为 launchd plist（macOS）。
- [ ] 边界输入：命令缺失 / 网络断开 / 网站改版时，Skill 不崩溃、给出可懂的错误。

---

## 2. 发布方式 A：CLI（推荐，已验证）

```bash
# 0. 安装 CLI（已审阅：仅写 ~/.skillhub 与 ~/.local/bin，无 sudo、不改 shell PATH）
#    ✅ 本机已执行并验证：
#       bash /tmp/skillhub-kit/cli/install.sh --cli-only --no-self-upgrade
#    验证：skillhub -h   →  显示 search/skill/install/soul/pack/upgrade/list/
#                            self-upgrade/login/logout/config/auth/verify/publish
#    （如换机器重装：curl -fsSL https://skillhub.cn/install/install.sh | bash）

# 1. 登录（注意：CLI 没有交互式浏览器登录，必须带 --key）
#    用社区 token（skh_...）或企业 API key（sk-ent-...）：
skillhub login --key skh_你的token

# 2. 先 dry-run 预检（只校验 metadata + 打包，不发起 HTTP 请求）
skillhub publish --dry-run /Users/leo/Projects/tap/taprun/workbuddy/skills/tap-capture-replay
skillhub publish --dry-run /Users/leo/Projects/tap/taprun/workbuddy/skills/tap-setup
skillhub publish --dry-run /Users/leo/Projects/tap/taprun/workbuddy/skills/tap-triggers

# 3. 逐个正式发布（无 init / 无 push；publish 直接吃本地目录）
skillhub publish /Users/leo/Projects/tap/taprun/workbuddy/skills/tap-capture-replay \
  --changelog "Tap 录制一次、零 token 确定性重放"
skillhub publish /Users/leo/Projects/tap/taprun/workbuddy/skills/tap-setup \
  --changelog "已登录站点自适应配置（embed --verify 阶梯诊断）"
skillhub publish /Users/leo/Projects/tap/taprun/workbuddy/skills/tap-triggers \
  --changelog "trigger.json 编译为 launchd plist，无人值守零 token"
```

> 说明（与旧版清单不同，已纠正）：
> - **没有 `skillhub init` 也没有 `skillhub push`**——这两个子命令在本 CLI 中不存在。
> - `publish <path>` 直接接收**本地 skill 目录**（目录内须含 `SKILL.md`）或 `.zip`。
> - `--version` 可覆盖 frontmatter 里的 version；`--json` 输出结构化结果。
> - 登录态用 token 保存于本地；`skillhub auth whoami` 可查当前身份，`skillhub logout` 清除。

---

## 3. 发布方式 B：官网（图形界面）

1. 访问 https://skillhub.cn，登录账号，进入**技能发布**页面。
2. 填写技能信息：slug / displayName / 版本 / 描述 / 标签 / **分类**（官网表单才有分类项，frontmatter 里的 `category` 不上传）。
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

> 配套 MCP 市场发布清单另见 `taprun/workbuddy/MCP_MARKET_PUBLISH_CHECKLIST.md`。

---

## 附：本机验证记录

```
$ skillhub -h
usage: skills_store_cli.py [-h] [-v] [--index INDEX] [--dir DIR] [--skip-self-upgrade]
  {search,skill,install,soul,pack,upgrade,list,self-upgrade,login,logout,config,auth,verify,publish} ...

$ skillhub publish --dry-run .../tap-capture-replay
✓ Dry-run passed: tap-capture-replay@1.0.0
$ skillhub publish --dry-run .../tap-setup
✓ Dry-run passed: tap-setup@1.1.0
$ skillhub publish --dry-run .../tap-triggers
✓ Dry-run passed: tap-triggers@1.0.0
```

CLI 已安装于 `~/.local/bin/skillhub`（在 PATH 内），发布只需补一个 `skillhub login --key ...` 即可执行 §2。
