---
name: tap-triggers
slug: tap-triggers
displayName: Tap 定时触发（launchd）
description: >-
  声明一个已保存的 tap"何时"无人值守运行——~/.tap/triggers/ 下的 trigger.json 声明会被确定性地编译成
  launchd plist（dev.taprun.trigger.* 命名空间），每次触发零 token。前台受限计划（trusted:true）在声明时
  即被拒绝。适用于用户想"每天跑这个 tap""定时检查""排个日程""放到 launchd"。注意：当前仅 macOS +
  launchd；Windows 端为同一声明格式下的 systemd 等价物（待实现）。
version: 1.0.0
tags: [schedule, trigger, launchd, automation]
category: 效率工具
platforms: [macos, windows]
---

# tap-triggers —— 位于 plan 之上的触发层

## 这是什么（一句话为什么）

Plan 回答**做什么**并编码**验证**；它刻意不回答**何时**。云端 "routines" 把三者打包，但每次触发都要付一个 agent 会话。Tap 的 "编译一次、免费重放" 非对称要求相反：触发层也必须零 token。操作系统自带世界级触发引擎（launchd）；本技能只拥有从可版本化声明到 launchd 产物的**确定性编译**。

## 声明格式

`~/.tap/triggers/<site>/<name>[.<slot>].trigger.json`——一个文件一个触发。slot（可选的文件名第三段）让一个 plan 有多个独立触发（`visibility-recheck.am.trigger.json`、`…pm.trigger.json`）。

```jsonc
{
  "ref": "xhs/visibility-recheck",        // 或 tap://xhs/visibility-recheck
  "args": { "note_url": "…", "note_id": "…" },   // 可选，原样 → tap --args
  "when": {                                // 下列 EXACTLY ONE：
    "calendar": { "Hour": 10, "Minute": 30 }     // launchd StartCalendarInterval
    // "calendar": [ {…}, {…} ]                  // 多个触发时刻
    // "interval_seconds": 3600                  // StartInterval（>= 60）
    // "watch_path": "~/Downloads"               // WatchPaths（变动时触发）
  },
  "sink": {                                 // 可选，结果落点
    "path": "~/.tap/ledger/{name}-{date}.json",  // {date}{site}{name}{run_id}
    "select": "return"                      // return | envelope | return.<field>…
  },
  "on": {                                   // 可选，统一订阅
    "ok":     [ { "write": "...", "select": "..." } ],
    "failed": [ { "notify_os": "🛑 扫描失败——查日志" } ]
  },
  "note": "这个触发为什么存在",            // 可选，作为 plist 注释
  "disabled": true                          // 可选；保留声明，materializer 视 plist 为孤儿
}
```

## 用法

```bash
# 编译所有声明 → ~/Library/LaunchAgents/dev.taprun.trigger.*.plist
tap schedule            # 以 JSON 报告，任何拒绝则 exit 1

# 删除声明已消失/禁用的 plist
tap schedule --prune

# 激活 / 触发 / 移除（launchd 侧——`tap schedule` 只写文件）
launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/dev.taprun.trigger.<site>.<name>.plist
launchctl kickstart -k gui/$(id -u)/dev.taprun.trigger.<site>.<name>   # 立即触发
launchctl bootout   gui/$(id -u)/dev.taprun.trigger.<site>.<name>
launchctl list | grep dev.taprun.trigger                                # 状态
```

日志在 `~/Library/Logs/taprun/<label>.log|.err`。

## 硬闸门（编译时，均有测试覆盖）

- **前台闸门（安全）**——含 `trusted:true` op 的 plan 被**拒绝**：trusted 输入是 CDP 坐标级操作，需要前台标签页；03:00 的无人值守运行无法提供。是结构性 JSON 检查，不是文本匹配。
- **引用完整性**——悬空 `ref`（磁盘上无对应 plan）在声明时即被拒，而非在失败日志里才发现。
- **写变体警告（质量）**——变更类 plan 会编译但告警：确认后置条件非空虚，且 `intent_key` 在无人值守前已完成去重。
- **命名空间 containment（安全）**——孤儿清扫与 `--prune` 结构性限定在 `dev.taprun.trigger.*`；外部 LaunchAgents 构造上不可达。
- **幂等**——未变的声明不重写；有改动则报告 `updated`。

## 边界（记下以免被人"好心改坏"）

- **不要给引擎加调度循环**——触发层应只做声明→产物的编译。
- **不要从 materializer 自动 bootstrap 进 launchd。** 写文件是幂等且可审阅的；改 launchd 状态是单独、人类可见的一步（刻意的两阶段：先编译，再激活）。
- 浏览器事件触发（"当我打开 Xero 时拉报表"）是只有本地优先才能做的类，云端 routine 做不到——但当前无命名消费者，待有需求再议。
- 当前仅 macOS + launchd。Linux/Windows 端口 = 同一声明格式下的 systemd timer 等价物。无人值守运行只有在 Chrome 运行时才能抵达扩展 peer（launchd → tap CLI → host.sock → NM host）；L1/L2 fetch 类 plan（无 tab）无论如何都能跑——触发场景优先选它们。
