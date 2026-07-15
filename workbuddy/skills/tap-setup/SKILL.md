---
name: tap-setup
description: >-
  为"已登录/需认证"的网站自适应地准备 Tap——先诊断、只补缺失的一环、过人类信任闸门，再验证。公开页面/
  开放 API 无需此步（MCP 连上即可用）。触发场景：用户想在需要登录的网站（银行/后台/内部系统/社交）用
  Tap；用户说"配置 tap""连接 tap""tap 连不上"；或在已登录站点上运行报错 peer/bridge 不可达。本技能
  通过 `tap embed --verify` 自适应地驱动设置，而非盲目跑安装器。
version: 1.1.0
tags: [setup, login, bridge, chrome-extension]
---

# Tap：已登录站点的自适应设置

**何时需要**：仅限**已登录站点**。公开页面 / 开放 API 完全无需设置——MCP 服务器（经 `npx @taprun/cli`）已经能跑。已登录站点是例外：Chrome 扩展通过 native-messaging 桥接抵达一个**稳定的本地 `tap` 二进制**（npx 的临时路径不能当桥接，所以这里必须真正安装）。

## 第一步永远是诊断，不是安装（先检索）

**先运行这条并读取真实输出——不要凭记忆假设装了什么：**

```bash
npx -y @taprun/cli embed --verify
```

它会打印一个**前置条件阶梯**（稳定二进制 → NM 桥接清单 ��� 扩展 → host socket），每一环 ✓/✗。**只修 ✗ 的环，从最便宜的起；✓ 的跳过。** 若全 ✓，直接告诉用户"你已就绪"并停下——别再做任何事。

## 逐环修复（最便宜优先；两道人工闸门必须显式）

| 环（仅当 ✗） | 修复 | 需人工同意？ |
|---|---|---|
| 无稳定二进制 | `npx -y @taprun/cli bridge setup`——`bridge setup` 把**正在运行的**引擎自复制到 `~/.tap/bin/tap`（正是 npx 为 MCP 服务器下载的那份字节，**无二次下载**），并在同一步写入 NM 清单。仅当 npx 缺失时回退到远程安装——**运行前先展示命令并取得同意**：`brew install LeonTing1010/tap/taprun`（有 brew 时），或 `curl -fsSL https://taprun.dev/install.sh \| sh` | npx 路径：**否**（不新拉任何东西）。brew/curl 回退：**是**（远程安装器——绝不静默运行） |
| NM 桥接清单缺失 | `tap bridge setup`（幂等；若尚无稳定二进制则如上经 npx 执行） | 否 |
| 扩展未安装 | 打开商店页，让用户点 **Add to Chrome** 并接受权限提示：`https://chromewebstore.google.com/detail/tap/llcidejeoobdegbkolbjhfoeckphldce` | **是**（那一次点击 = 信任边界；无法自动化） |
| host socket 未活 | 确认 Chrome 在运行且扩展已启用；必要时让用户切换扩展开关 | 否 |

## 收尾

1. **再跑一次 `npx -y @taprun/cli embed --verify` 确认全 ✓。**
2. 若 Tap 的 MCP 工具仍连不上，让用户重启 WorkBuddy（MCP 在启动时加载）。
3. 报告最终阶梯状态——不要夸大；只报告验证过的。

## 铁律

- **逻辑在引擎里；本技能只做编排。** 用 `tap embed --verify` 诊断；挂载知识在 `tap embed`。本技能**不写任何配置文件、不硬编码任何路径**——只调用那些命令、读取其输出、补上缺失的环。
- **两道人工闸门（装二进制、装扩展）不能也不该自动化**：那是 Tap 的本地优先安全属性——凭据从不离开本机，而扩展权限那次点击，正是让 Tap 复用你已登录会话的信任步骤。**绝不静默运行 `curl | sh`**：先展示命令、取得同意、再运行。
- **WorkBuddy 通过 `~/.workbuddy/mcp.json` 连接 Tap（stdio：`npx -y @taprun/cli mcp stdio`）——不要运行 `tap embed claude-code` / `tap embed cursor` 等**：那些会为别的 agent 注册重复的 MCP 服务器。本技能只负责已登录站点的浏览器侧前置条件（二进制/桥接/扩展/握手）；MCP 挂载属于用户的 mcp.json。
- **别做过头**：全 ✓ 就停；公开站点根本不该触发本技能。
