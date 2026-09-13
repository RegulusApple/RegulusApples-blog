# HANDOFF_V1 — RegulusApple's Blog 交付说明

> 生成日期：2026-08-29
> 用途：让新的 Codex 任务或维护者无需重读完整对话，即可继续维护、写作、测试和发布 RegulusApple's Blog。
> 项目根目录在本文统一写作 `<BLOG_ROOT>`，实际位置请由接手者在当前工作区确认，避免在文档中固化个人目录信息。

## 0. 接手结论

- 当前博客**已经是 Hexo 架构**，不是普通的单页原型。
- Hexo 版本为 `8.1.2`，主题是本项目自行制作的 `regulusapples-blog`，**不是** `hexo-theme-solitude`。
- Solitude、SoCoco 和 Eurkon 仅作为功能、内容组织、配置方式和魔改方法的参考；不要直接把 Solitude 配置复制进当前主题。
- 当前线上地址：<https://halfolds-blog.regulusapplex.chatgpt.site/>
- 当前分支：`codex/hexo-migration`。接手前先执行 `git status --short` 和 `git log -5 --oneline`，以仓库实时结果为准。
- 工作区中的 `素材/` 是用户素材目录，目前未纳入 Git。除非用户明确要求，不要删除、移动、批量改名或提交该目录。
- 本交付文档只说明接手方式；生成文档时没有修改博客页面、文章、素材或部署状态。

## 1. 当前架构

### 1.1 技术链路

```text
Markdown 文章 / 页面
        ↓
Hexo 8 读取根配置与主题配置
        ↓
自定义 regulusapples-blog 主题（EJS + CSS + 原生 JavaScript）
        ↓
public/ 静态站点
        ↓
tools/prepare-sites.mjs
        ↓
dist/client + dist/server（Sites 发布产物）
        ↓
Codex Sites 托管
```

运行环境与依赖以以下文件为准：

- `<BLOG_ROOT>/package.json`
- `<BLOG_ROOT>/package-lock.json`
- `<BLOG_ROOT>/_config.yml`

`package.json` 中的 Hexo 要求 Node.js `>=20.19.0`。建议使用 Node.js 20 LTS 或更新的稳定版本，并保留 lockfile，安装时优先使用 `npm install`；需要严格复现依赖时使用 `npm ci`。

### 1.2 目录职责

| 路径 | 作用 | 什么时候修改 |
| --- | --- | --- |
| `<BLOG_ROOT>/_config.yml` | Hexo 根配置：站点标题、URL、固定链接、分页、Markdown、搜索、生成器 | 改站点级规则时 |
| `<BLOG_ROOT>/package.json` | 依赖和 `clean/build/dev/new/deploy` 命令 | 增减插件或调整脚本时 |
| `<BLOG_ROOT>/scaffolds/post.md` | 新文章默认模板 | 想统一新文章 Front Matter 和章节骨架时 |
| `<BLOG_ROOT>/source/_posts/` | 正式文章 Markdown | 写文章、改文章时 |
| `<BLOG_ROOT>/source/<page>/index.md` | 关于、搜索、统计、读书架等独立页面入口 | 增改页面标题、路由、Front Matter 时 |
| `<BLOG_ROOT>/source/images/` | 会原样发布到 `/images/` 的站点图片 | 增加头像、封面、相册图等素材时 |
| `<BLOG_ROOT>/themes/regulusapples-blog/_config.yml` | 自定义主题的数据配置 | 改导航、个人信息、Hero、分类按钮、相册、音乐、读书、评论、统计时 |
| `<BLOG_ROOT>/themes/regulusapples-blog/layout/` | EJS 页面模板 | 改页面结构、增加模块时 |
| `<BLOG_ROOT>/themes/regulusapples-blog/source/css/style.css` | 全站浅色/深色、响应式和组件视觉 | 改配色、尺寸、圆角、比例时 |
| `<BLOG_ROOT>/themes/regulusapples-blog/source/js/main.js` | 搜索、主题切换、目录、灯箱、音乐、评论、PWA 等交互 | 改前端行为时 |
| `<BLOG_ROOT>/tools/prepare-sites.mjs` | 把 Hexo 静态结果整理为 Sites 可部署产物 | 改托管适配时 |
| `<BLOG_ROOT>/tools/verify-generated-site.mjs` | 生成站点的回归检查 | 页面结构或固定测试文章变化时 |
| `<BLOG_ROOT>/.openai/hosting.json` | 当前 Sites 项目的绑定信息 | 处理 Sites 托管时；不要公开其中内部标识 |

### 1.3 主题模板对应关系

- 全局外壳、顶部导航、侧栏、搜索弹层、主题切换、页脚：`themes/regulusapples-blog/layout/layout.ejs`
- 首页 Hero、文章列表、分类筛选、记忆区：`themes/regulusapples-blog/layout/index.ejs`
- 文章正文、目录、字数/阅读时间、相关文章、评论、上一篇/下一篇：`themes/regulusapples-blog/layout/post.ejs`
- 归档、分类、标签：`archive.ejs`、`category.ejs`、`tag.ejs`
- 搜索、统计、相册、音乐、读书架、留言板：对应的同名 EJS 模板
- 侧边栏和分页：`themes/regulusapples-blog/layout/_partial/`

修改结构前先定位对应模板，不要把页面级结构全部堆进 `layout.ejs`。

## 2. 当前已经具备的能力

### 2.1 内容能力

- Hexo 文章、归档、分类、标签与分页。
- Markdown 正文、代码高亮、KaTeX 数学公式和图片懒加载。
- 文章目录、字数和预计阅读时间。
- 相关文章、上一篇/下一篇导航。
- 本地搜索索引与全局搜索弹层。

### 2.2 特色页面与前端能力

- 相册与灯箱。
- 音乐页与播放控件界面。
- 手工维护的读书架。
- 文章统计页、留言页、关于页、友链页、站点信息页和 404 页。
- 浅色/深色模式、响应式布局。
- Web App Manifest 与 Service Worker，可作为 PWA 使用。

### 2.3 已留接口但尚未完成外部接入的功能

- Giscus：主题配置中默认关闭，仓库、分类等标识尚未填写。
- Umami / Google Analytics：默认关闭，站点标识尚未填写。
- 音乐：列表结构已有，但音频 URL 需要用户提供或接入合法音源。
- 读书架：当前是主题配置中的手工数据，不是豆瓣或第三方 API 同步。
- 留言板：页面和容器已有；要产生真实留言，需要先接评论后端。

这些功能不能仅通过“显示一个入口”视为完成。接手者应区分：页面存在、交互可用、外部服务已接通、生产环境已验证，这四个状态。

## 3. 如何修改博客

### 3.1 改文字、身份和站点信息

- 博客名称、副标题、描述、作者、语言、站点 URL：修改 `<BLOG_ROOT>/_config.yml`。
- 昵称、角色描述、头像、个人简介、首页 Hero 文案与图片：修改 `<BLOG_ROOT>/themes/regulusapples-blog/_config.yml`。
- 图片文件放入 `<BLOG_ROOT>/source/images/`，配置中使用 `/images/文件名`。

### 3.2 改导航和页面入口

1. 在 `themes/regulusapples-blog/_config.yml` 的菜单配置中增删入口。
2. 如果是新独立页面，在 `source/页面名/index.md` 创建 Front Matter。
3. 在 `themes/regulusapples-blog/layout/` 增加或复用对应布局。
4. 同时检查桌面顶部导航、移动端导航和侧栏，不要只改一个入口。

现有特殊页面入口可直接参考：

- `source/reading/index.md`
- `source/music/index.md`
- `source/album/index.md`
- `source/stats/index.md`
- `source/message/index.md`
- `source/search/index.md`

### 3.3 改配色、组件比例和响应式

主要修改 `themes/regulusapples-blog/source/css/style.css`。当前风格要求应继续遵守：

- 浅色模式尽可能白、轻、低噪声，人物图底色与模块自然过渡。
- 深色模式使用柔和紫黑，避免纯黑和高饱和荧光色大面积铺设。
- 保留 EVA 初号机方向的紫色主色与黄绿色小面积强调色。
- 所有卡片和按钮使用圆角；按钮悬停/按下以文字轻微上浮和颜色过渡为主。
- 顶部功能栏保持固定，浅色下与页面背景协调。
- 修改后至少检查宽屏、笔记本宽度、平板和手机断点，并分别检查浅色和深色。

不要直接给人物图片套 `filter` 改色；这会让角色本身颜色失真。人物区域的协调应通过容器背景、遮罩渐变、`object-fit` 和留白完成。

### 3.4 改功能与交互

- 搜索、主题切换、目录、灯箱、音乐和评论加载均集中在 `themes/regulusapples-blog/source/js/main.js`。
- 新增交互时确保重复初始化不会累积事件监听器。
- 搜索弹层要同时支持鼠标、键盘、关闭按钮和 `Escape`。
- 深浅主题下组件应保持同一布局坐标；主题变化只改变视觉变量，不应改变结构尺寸。
- 修改 Service Worker 时同步更新 `source/sw.js` 的缓存版本，避免线上继续使用旧静态资源。

## 4. 如何新增和重写文章

### 4.1 新建文章

在 `<BLOG_ROOT>` 中执行：

```powershell
npm install
npm run new -- "文章标题"
```

Hexo 会按 `_config.yml` 的 `new_post_name` 规则，在 `source/_posts/` 生成带日期的 Markdown。默认内容来自 `scaffolds/post.md`，应优先修改生成后的文章，不要手工复制旧文章作为模板。

### 4.2 Front Matter 要点

新文章建议至少维护：

```yaml
---
title: 文章标题
date: 2026-08-29 20:00:00
updated: 2026-08-29 20:00:00
categories:
  - 学习
tags:
  - Hexo
description: 用一两句话概括文章。
cover: /images/example-cover.jpg
toc: true
aside: true
comment: true
---
```

注意：

- 新文章使用 Hexo 标准字段 `categories:`（复数）；已有文章中的单数字段可暂时保留，迁移时再统一。
- 分类用于内容归档；首页显示哪些分类按钮，则由 `themes/regulusapples-blog/_config.yml` 的分类列表控制。新增分类时通常两处都要检查。
- `cover` 留空时不要写不存在的图片路径。
- `updated` 不会自动代表真实编辑时间，完成大改后手工更新。
- 当前固定链接规则是 `/notes/:title/`，文件名和标题变化可能改变链接，已发布文章不要随意重命名 slug。

### 4.3 图片与附件

当前 `post_asset_folder` 为 `false`，推荐流程是：

1. 把文章图片放到 `source/images/`，必要时按文章名建立子目录。
2. Markdown 中使用 `/images/...` 的站点绝对路径。
3. 文件名使用简短的英文、数字和连字符，减少跨平台和 URL 编码问题。
4. 不要直接引用 `素材/` 中的原图；先挑选并复制需要发布的版本到 `source/images/`。

### 4.4 草稿

可使用：

```powershell
npx hexo new draft "草稿标题"
npx hexo server --draft
```

根配置的 `render_drafts` 当前为 `false`，因此普通构建不会发布草稿。正式发布前把草稿移动为文章，或使用 Hexo 的 publish 命令。

### 4.5 重写现有文章

- 直接编辑 `source/_posts/` 中对应 Markdown。
- 尽量保留文件名和既有 URL；只改 `title` 通常比改文件名安全。
- 大幅改变文章长度或删除固定测试文章后，必须同步检查 `tools/verify-generated-site.mjs`。该脚本目前对一篇既有文章的路径、首页标题和字数标记存在具体断言。

## 5. 本地预览、构建、验证与发布

### 5.1 本地预览

```powershell
npm run dev
```

默认访问 <http://localhost:4000/>。如果页面看起来仍是旧版本：

1. 先强制刷新。
2. 在浏览器开发者工具中清理该站点的 Service Worker 和缓存。
3. 再执行 `npm run clean` 后重启预览。

### 5.2 构建与回归检查

```powershell
npm run clean
npm run build
node tools/verify-generated-site.mjs
```

- Hexo 静态结果位于 `public/`。
- Sites 发布产物位于 `dist/`。
- `public/` 与 `dist/` 均为生成目录，不应手工编辑，也不应作为源代码提交。
- 验证失败时先阅读失败断言，不要为了“让测试绿”直接删掉检查项；确认是功能回归还是文章内容导致的预期变化。

### 5.3 Git 推送

建议流程：

```powershell
git status --short
git diff --check
git diff
git add <明确的文件>
git commit -m "描述本次修改"
git push
```

不要使用 `git add .` 顺手提交 `素材/`、生成目录或临时文件。提交前用 `git diff --cached` 再确认一次。

### 5.4 当前生产部署方式

当前线上发布由 Codex Sites 管理，项目由 `.openai/hosting.json` 绑定。根配置中的 `deploy.type` 为空，因此：

- `npm run deploy` 当前**不是**生产发布命令。
- SoCoco 教程中的 `hexo-deployer-git` 与 `hexo d` 只适用于将来明确切换到 GitHub Pages 的方案，不要直接套到当前项目。
- 需要发布时，应先构建和验证，再调用 `sites:sites-building` 与 `sites:sites-hosting` 对应流程保存并部署版本。
- 不要把临时凭证、内部项目标识或私有仓库地址写入文档、文章或 Git 提交。

若用户以后明确要迁移到 GitHub Pages、Cloudflare Pages 或 Vercel，应单独设计部署方案和回滚方案，不要与当前 Sites 发布链路混用。

## 6. 参考网站：它们讲了什么、应该参考什么

### 6.1 SoCoco：Hexo 搭建博客

链接：<https://sococo.cn/2025/01/23/2025-01-23_blog_init/>

这篇文章的重点不是页面排版，而是一条面向新手的 Hexo 建站流程：

- 安装 Git、Node.js 和可选的 Markdown 编辑工具。
- 安装 Hexo CLI、理解 Hexo 项目目录。
- 使用 `hexo new post` 写文章。
- 本地清理、生成和预览。
- 配置 GitHub 仓库、SSH 与 `hexo-deployer-git`，再部署到 GitHub Pages。
- 后续再处理主题和域名。

对本项目应参考：环境准备、目录认知、文章创建、构建前清缓存、把写作与 Git 版本管理连成固定流程。

不应照抄：删除整个 `.ssh` 目录、固定使用 RSA、全局安装所有工具、直接配置 `hexo d`。这些做法应按当前机器安全状态和当前 Sites 托管方式重新判断。

### 6.2 Solitude GitHub 仓库

链接：<https://github.com/everfu/hexo-theme-solitude>

仓库用于确认 Solitude 的官方定位和能力边界。其公开功能包括 Pjax/图片懒加载、PWA、多个评论系统、昼夜切换、灯箱、LaTeX、AI 摘要、代码高亮，以及即刻短文、装备、工具、音乐、友链鱼塘、相册、豆瓣、弹幕留言等特色页。

对本项目应参考：

- 功能模块清单和分阶段启用思路。
- 评论、搜索、PWA、特色页等模块应该有独立配置与开关。
- 浏览器扩展应依赖稳定的公开接口和生命周期，而不是耦合内部变量。
- 主题升级时应保留用户配置，避免直接覆盖定制内容。

不应照抄：`theme: solitude`、Solitude 的模板路径、`_config.solitude.yml` 字段或其前端私有实现。当前项目是 `regulusapples-blog` 主题，模板语言和配置结构均不同。

### 6.3 Solitude 官方文档

入口：<https://solitude.js.org/cn>

优先阅读：

- [介绍](https://solitude.js.org/cn/docs/getting-started/introduction)：理解根 `_config.yml` 与主题配置分层，以及按需加载和页面生命周期。
- [安装](https://solitude.js.org/cn/docs/getting-started/installation)：参考“主题默认配置复制到博客根目录、升级时合并而非覆盖”的维护策略。
- [高级配置](https://solitude.js.org/cn/configuration/advance-config)：参考字数统计、KaTeX、PWA 等功能依赖和开关设计。
- [留言板](https://solitude.js.org/cn/docs/features/message)：理解留言页依赖真实评论服务，页面本身不是留言后端。
- [Browser API](https://solitude.js.org/docs/configuration/browser-api)：参考统一公开 API、主题切换事件和页面切换生命周期。

对 RegulusApple Blog 的正确用法是学习“配置模型和功能设计”，再在 `themes/regulusapples-blog/` 中实现等价能力；不是把 Solitude 文档里的 YAML 原样粘贴进当前配置。

### 6.4 Eurkon：Hexo 博客文章统计图

链接：<https://blog.eurkon.com/post/1213ef82.html>

这是一篇针对 Hexo 的 ECharts 魔改教程，核心内容是：

- 建立独立 `charts` 页面。
- 从 Hexo 的文章、分类和标签数据生成图表。
- 展示发布时间统计、标签排名、分类饼图或多层分类旭日图。
- 让图表适配明暗模式。
- 点击图表后跳转到对应分类或标签页面。
- 处理 `require`、ECharts 加载顺序和 `cheerio` 依赖等常见错误。

当前博客已经有基础统计页。若继续增强，建议借鉴它的数据维度、点击跳转、明暗主题配色和可配置属性；实现时应改写为当前 EJS + 原生 JavaScript 架构，并优先按需加载 ECharts，不能直接复制其 Butterfly/Pug 路径和 helper 代码。

## 7. 后续魔改的建议顺序

### 第一优先级：先把已有能力做实

1. 为 Giscus 或另一评论系统补齐真实配置，并在文章页和留言页验证。
2. 为音乐页补充合法、稳定的音频源和错误处理。
3. 明确读书架是手工维护还是第三方同步；手工方案更稳定、隐私风险更小。
4. 将统计页从数字卡片逐步升级为真实文章数据图表。

### 第二优先级：增强写作体验

1. 完善文章脚手架，统一分类、摘要、封面、目录和评论字段。
2. 增加草稿、预览和发布检查清单。
3. 为技术文章补充代码复制、标题锚点和公式回归测试。

### 第三优先级：再做大型特色功能

- 即刻短文、装备页、在线工具、友链订阅、豆瓣同步、AI 摘要等。
- 每个功能先确定数据来源、隐私、可维护性、失效降级和移动端表现。
- 不要只添加菜单入口；应完成内容源、页面、交互、错误状态和生产验证。

## 8. 易踩坑与保护规则

- `regulusapples-blog` 是定制主题。更新 Hexo 或参考 Solitude 时，不要用主题包覆盖 `themes/regulusapples-blog/`。
- 首页分类按钮来自主题配置，文章分类来自 Front Matter，两者不是同一数据源。
- 相册、音乐、读书架主要从主题配置取数据，对应 Markdown 页面本身只是路由入口。
- 搜索依赖生成的 `search.json`；改搜索字段后要重新构建。
- PWA 可能缓存旧 CSS/JS；线上视觉不一致时先排查 Service Worker。
- 深浅主题只应改变变量和视觉，不应让搜索按钮等控件发生坐标漂移。
- 不要给角色图片应用全局色相或灰度滤镜。
- 不要删除用户未提交的 `素材/`。
- 不要把任何密钥、评论服务私钥、分析后台令牌或部署凭证提交进仓库。

## 9. 建议下一位代理调用的 skills

- `handoff`：下一次会话结束前重新生成精简交接，skill 位于 `C:\Users\<USER>\.agents\skills\handoff\SKILL.md`；即使技能目录没有自动列出，也应先在该位置检查。
- `sites:sites-building`：项目存在 `.openai/hosting.json`，所有站点代码修改与构建应使用该 skill。
- `sites:sites-hosting`：只有在用户要求发布、更新线上站点或检查部署时调用。
- `browser:control-in-app-browser`：验证线上/本地页面、响应式、搜索和深浅主题交互时调用。
- `research`：继续研究 Hexo、Solitude 或第三方集成的最新官方资料时调用。
- `diagnosing-bugs`：用户报告乱码、路径错误、搜索错位、缓存异常或构建失败时调用。
- `imagegen`：用户明确要求生成或编辑位图素材时调用；普通 CSS 背景调整不需要。

## 10. 新任务的推荐起手式

新的代理开始工作时按以下顺序：

1. 完整读取本文件与用户最新要求。
2. 在 `<BLOG_ROOT>` 执行 `git status --short`、`git branch --show-current`、`git log -5 --oneline`。
3. 读取根 `_config.yml`、主题 `_config.yml`、目标页面模板、`style.css` 和 `main.js` 中与任务相关的部分。
4. 保留 `素材/` 和所有无关改动。
5. 修改后执行与风险匹配的本地预览、完整构建和回归检查。
6. 只有用户要求发布时才部署，并在部署后打开生产 URL 验证。

当前没有必须继续执行的代码修改；下一步应以用户的新需求为准。
