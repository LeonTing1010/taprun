# Platform-Specific Selectors for Tap MCP

> ⚠️ **DEPRECATED (2026-06-07).** This file documents the old imperative MCP API (`mcp__tap__page_nav` / `page_eval` / `page_click`), which **no longer exists** — the Tap MCP surface is now only `capture` / `verify` / `mark` / `run`. Selectors are now encapsulated inside saved taps (`xhs/search`, `xhs/note-comments-extract`, `xhs/explore`, `weibo/hotsearch`, `weibo/*`); invoke them with `mcp__tap__run`. Keep this file ONLY as a selector crib when authoring a NEW tap via `mcp__tap__capture`. Do not follow the `mcp__tap__page_*` call examples below — they will fail.

Reusable selector patterns for social platforms (legacy reference — selectors only, NOT a current call API).

## Xiaohongshu (小红书)

### Navigate to search
```
mcp__tap__page_nav("https://www.xiaohongshu.com/search_result?keyword=KEYWORD&type=51")
```

### Extract feed titles + likes
```javascript
Array.from(document.querySelectorAll('section.note-item')).map(el => {
  const title = el.querySelector('.title span')?.innerText || el.querySelector('a.title')?.innerText || '';
  const likes = el.querySelector('.like-wrapper .count')?.innerText || el.querySelector('[class*="like"] [class*="count"]')?.innerText || '?';
  return title.trim() + ' | 赞:' + likes;
}).filter(t => t.length > 5).slice(0, 15).join('\n')
```

### Extract comments from a post
```javascript
Array.from(document.querySelectorAll('.comment-item, [class*="commentItem"]')).map(el => {
  const text = el.querySelector('.content span, [class*="content"]')?.innerText || '';
  const likes = el.querySelector('.like-count, [class*="likeCount"]')?.innerText || '0';
  return text.trim() + ' | 赞:' + likes;
}).filter(t => t.length > 5).slice(0, 20).join('\n')
```

### Switch category tabs
```javascript
// Categories: 推荐(0) 穿搭(1) 美食(2) 彩妆(3) 影视(4) 职场(5) 情感(6) 家居(7) 游戏(8) 旅行(9) 健身(10)
document.querySelectorAll('.channel-container .channel')[INDEX].click()
```

### Note: Login required for full content.

---

## 知乎 (Zhihu)

### Search questions
```
mcp__tap__page_nav("https://www.zhihu.com/search?q=KEYWORD&type=question")
```

### Extract question list
```javascript
Array.from(document.querySelectorAll('.SearchResult-Card h2, .List-item .ContentItem-title')).map(el => {
  return el.innerText?.trim();
}).filter(t => t && t.length > 5).slice(0, 10).join('\n')
```

### Extract question follower count
```javascript
document.querySelector('.NumberBoard-itemValue')?.innerText
```

### Extract answers + comments
```javascript
Array.from(document.querySelectorAll('.RichContent-inner, .CommentItemV2-content')).map(el => {
  return el.innerText?.slice(0, 200).trim();
}).filter(t => t.length > 10).slice(0, 10).join('\n---\n')
```

### Extract article content
```javascript
document.querySelector('.Post-RichTextContainer')?.innerText || document.querySelector('.RichText')?.innerText || ''
```

---

## 搜狗微信 (WeChat mini-program search proxy)

### Search for mini-programs by topic
```
mcp__tap__page_nav("https://weixin.sogou.com/weixin?type=1&query=TOPIC+小程序")
```

### Extract results
```javascript
Array.from(document.querySelectorAll('.news-box .txt-box, .wx-rb')).map(el => {
  const title = el.querySelector('h3 a, .tit')?.innerText || '';
  const desc = el.querySelector('p, .txt')?.innerText?.slice(0, 100) || '';
  return title + ' | ' + desc;
}).filter(t => t.length > 5).slice(0, 5).join('\n')
```

---

## V2EX

### Extract post content
```javascript
document.querySelector('.topic_content')?.innerText || document.querySelector('.markdown_body')?.innerText || ''
```

### Extract replies
```javascript
Array.from(document.querySelectorAll('.reply_content')).map(el => el.innerText).join('\n---\n')
```

---

## General Pattern (unknown platform)

```javascript
// Find all text blocks with engagement indicators
Array.from(document.querySelectorAll('a')).filter(a => a.innerText.length > 10 && a.innerText.length < 200).map(a => a.innerText.trim()).filter(t => t).slice(0, 30).join('\n')
```

---

## Tool Quickref

| Action | Tap MCP call |
|--------|-------------|
| Navigate | `mcp__tap__page_nav(url)` |
| Screenshot | `mcp__tap__tap_screenshot()` |
| Run JS | `mcp__tap__page_eval(expression)` |
| Click element | `mcp__tap__page_click(selector_or_text)` |
| New tab | `mcp__tap__tab_new(url)` |
