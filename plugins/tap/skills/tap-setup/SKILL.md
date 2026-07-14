---
name: tap-setup
description: >-
  自驱动地为【登录态/认证网站】把 Tap 准备好——不是跑一遍脚本，而是先诊断、只补缺的那一级、
  过人工同意门、再验证。公开页/开放 API 不需要它（插件的 MCP 走 npx 已能用）。触发场景：用户
  想在银行/后台/内部仪表盘/社交等【需要登录】的站点用 Tap；用户说「装一下 tap / 配置 tap /
  连一下 tap / tap 连不上 / 让 tap 能用我的登录态」；或 Tap 的 run 在登录站报 peer/桥不可达。
  This skill DRIVES setup adaptively via `tap embed --verify`; it does not blindly run an installer.
license: MIT
metadata:
  author: LeonTing1010
  version: '1.0.0'
---

# Tap：自驱动登录态准备（spin 式）

**什么时候需要**：只在【登录态站点】。公开页 / 开放 API 用 Tap **不需要任何设置**——插件里的 MCP
server 走 `npx @taprun/cli` 已经能跑。登录站才需要：Chrome 扩展经由 native-messaging 桥去够一个
**稳定的本地 `tap` 二进制**（npx 的临时路径当不了桥，所以这里必须有真实安装）。

## 第一步永远是诊断，不是安装（检索优先）

**先跑这条，读它的真实输出，别凭记忆假设装没装：**

```bash
npx -y @taprun/cli embed --verify
```

它打印一个**前置阶梯**（稳定二进制 → NM 桥 manifest → 扩展 → host socket），逐级 ✓/✗。
**只针对 ✗ 的那一级做最小修复，已 ✓ 的跳过。** 全 ✓ 就直接告诉用户"已就绪"，别多做。

## 逐级修复（cheapest-first，两处人工门必须显式征询）

| 阶梯（✗ 才做） | 修复 | 人工同意？ |
|---|---|---|
| 无稳定二进制 | **先展示命令、征得用户同意再跑**：`brew install LeonTing1010/tap/taprun`（有 brew）或 `curl -fsSL https://taprun.dev/install.sh \| sh` | **要**（安装远程脚本，绝不静默执行） |
| NM 桥 manifest 缺 | `tap bridge setup`（幂等；二进制在了就跑） | 否 |
| 扩展未装 | 打开商店页让用户点 **Add to Chrome** 并接受权限：`https://chromewebstore.google.com/detail/tap/llcidejeoobdegbkolbjhfoeckphldce` | **要**（一次点击 = 信任边界，不可自动） |
| host socket 未活 | 确认 Chrome 已开、扩展已启用；必要时让用户重开一下扩展 | 否 |

## 收尾

1. **再跑一次 `npx -y @taprun/cli embed --verify` 确认全 ✓。**
2. 若 Tap 的 MCP 工具还没连上，让用户跑 `/reload-plugins`（免重启）。
3. 报告最终阶梯状态，不夸大——只说验证到的。

## 铁律

- **逻辑在内核，skill 只编排**：诊断走 `tap embed --verify`，接入知识在 `tap embed`；这个 skill
  **不手写任何配置文件、不硬编码路径**——只调这些命令、读它们的输出、补缺级。
- **两处人工门（装二进制、装扩展）自动化不了,也不该**：那是 Tap 本地优先的安全特性——
  凭证从不离开本机，扩展权限那一下点击就是让 Tap 复用你已登录会话的信任那一步。**永不静默
  `curl | sh`**：先把命令给用户看、拿到同意再执行。
- **CC 里 MCP 已由插件（npx）提供**：**不要**再跑 `tap embed claude-code`——那会多注册一个重复
  的 tap MCP。这个 skill 只管登录站的浏览器侧前置（二进制/桥/扩展/握手），MCP 接入归插件。
- **别过度**：全 ✓ 就停手；公开站根本别触发本 skill。
