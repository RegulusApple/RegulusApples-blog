# HANDOFF V4 — RegulusApple's Blog 升级总览与当前接手说明

> 生成日期：2026-09-13  
> 用途：让下一位 agent 能快速理解本项目从旧原型到当前 Hexo 博客的升级过程、最近几轮界面调整，以及当前仍未完成的外部部署事项。  
> 本文件放在项目内的 handoff/，覆盖 V3 中已经过时的当前状态；V1、V2、V3 仍保留作为历史记录。

## 0. 当前结论

- 项目现在是基于 Hexo 8.1.2 的博客，使用自制 regulusapples-blog 主题，不是直接使用 Solitude 主题。
- 当前工作分支为 codex/hexo-migration，当前 HEAD 为 f00c86a：Update blog content and assets。
- 当前 Git remote 已整理为：origin 指向用户的 GitHub 仓库，sites 指向现有 Codex Sites 发布源。不要把两个 remote 混用。
- 当前工作区在生成本文件前已有用户未提交改动：source/about/index.md。这部分改动必须保留，不能用批量回滚、git reset --hard、git checkout -- 或 git clean -fd 覆盖。
- 当前 Codex Sites 线上地址仍是：https://halfolds-blog.regulusapplex.chatgpt.site/
- regulusapplex.space 已购买，但阿里云域名信息模板当前显示“注册局审核中”；审核通过、模板关联域名、解除 ClientHold 并配置 DNS 之前，不应把自定义域名视为已上线。
- 本次 V4 只新增交接文档，没有修改博客源码、文章内容或部署状态。

## 1. 几次升级到底做了什么

下面按阶段说明已经发生的实际升级。详细差异以对应 commit 为准，本文只保留下一位 agent 需要知道的结论。

### 1.1 从旧网页原型迁移为 Hexo 博客

对应提交：df0c4c6，Migrate blog architecture to Hexo

- 移除旧的 Next/Vite 单页原型结构，建立标准 Hexo 项目。
- 引入根配置、文章目录、页面目录、scaffold、主题目录和生成目录。
- 创建自制 regulusapples-blog 主题，使用 EJS、CSS 和原生 JavaScript 实现页面，不依赖 Solitude 的模板结构。
- 建立首页、文章页、归档、分类、标签、关于、链接等基本页面。
- 形成如下内容链路：

~~~text
source/ Markdown
    ↓
themes/regulusapples-blog EJS + CSS + JavaScript
    ↓
Hexo generate
    ↓
public/ 静态站点
    ↓
tools/prepare-sites.mjs
    ↓
Codex Sites 发布产物
~~~

### 1.2 分阶段补齐博客能力

对应提交：349f69a、cf33702、9dd7385

- 第一阶段：搜索、文章目录、KaTeX、代码高亮、分类/标签页面等阅读基础能力。
- 第二阶段：相册、统计页、留言板页面容器、Manifest、Service Worker 和 PWA 基础。
- 第三阶段：音乐页、读书架、侧栏音乐控件以及对应的页面模板。
- 这些功能中，页面存在不等于外部服务已接入。评论、真实音乐音源、留言板后端、分析统计 ID 仍不能擅自补接。

### 1.3 首页、导航和阅读体验升级

对应提交：d4c2775、d043552、4508bff、a377827、c530b8a、56fbcd2、ef6ca95、354a3fe、464c124

- 首页视觉逐步调整为当前紫色、黄绿色强调色、浅色渐变和大留白的个人博客风格。
- 增加首页搜索入口和全局搜索弹层。
- 首页文章列表增加分类、标签、日期、New/Unread 等信息。
- 使用浏览器端状态保存文章已读状态。
- 顶部导航从单层链接整理为分组导航，并支持 hover 展开子导航。
- 保留浅色/深色模式、响应式布局、搜索关闭和键盘 Escape 等基础交互。

### 1.4 内容结构和周小结分流

对应提交：caa6b7c、df357f6、50862cc

- 将博客内容从通用占位文本逐步替换为 RegulusApple 的个人介绍、文章、音乐、阅读和项目内容。
- 新增周小结模板、weekly 页面、weekly-post 布局和 Monthly Trace 月份入口。
- scripts/regular-posts.js 将普通文章和 weekly: true 的周小结分开，周小结不应混入普通首页、普通归档和普通文章统计。
- 新增并持续编辑 source/_posts/2026-08-31-26TI杯模邀复盘记录.md，其中包括比赛复盘、方案分析、资料整理和“一些传承”等内容。
- 个人介绍位于 source/about/index.md。f00c86a 已更新身份说明和相关素材；当前该文件还有用户未提交的增补，下一位 agent 必须先检查 diff。
- 用户明确要求的保研资料不属于博客内容，应继续放在博客目录之外的“保研”文件夹，不要导入 source/_posts/ 或随博客发布。

### 1.5 工作区和发布边界整理

对应提交：bb4707e，Clean blog workspace boundaries

- 增加项目级 AGENTS.md、handoff/HANDOFF_V1.md、HANDOFF_V2.md、HANDOFF_V3.md 和 SoCoco 控件调研记录。
- 将生成目录、依赖、缓存、旧框架产物等加入忽略规则。
- 明确 GitHub 用于源码和版本记录，Codex Sites 用于现有线上站点发布；两者不是同一个发布目标。
- 当前 素材/ 中已有部分素材被纳入 Git，但素材目录不是自动等于网站发布目录。新增素材前要确认它是否应该进入 source/。

## 2. 最近 Contents / 文章侧栏的连续调整

这一部分是 V4 相对 V3 最重要的更新。V3 记录的是较早阶段的状态，不能直接作为当前实现依据。

### 2.1 将 Contents 移到文章页右侧

对应提交：70c6bfd，Move article contents to right rail

- 文章页改为桌面端三列：左侧博客模块、中间文章正文、右侧 Contents。
- Contents 从左侧 sidebar 中移出，挂载到 themes/regulusapples-blog/layout/layout.ejs 的 .article-toc-sidebar。
- 文章正文新增了比赛复盘文章后续的“传承”内容。

### 2.2 增加冻结/锁定行为

对应提交：85db898，Freeze article rails and simplify contents hover

- 文章页的左右辅助区域不再随着正文一起完全离开视口。
- 早期曾尝试用 position: fixed，造成左侧模块脱离 grid 排版、覆盖文章内容等问题；该做法已经废弃。
- 当前使用 position: sticky，保留元素在页面 grid 中的空间，避免正文被遮挡。

### 2.3 给 Contents 展开增加自然动画

对应提交：33d9b99，Animate contents rail expansion

- Contents 目录层级的出现和恢复使用 max-height、margin-top、opacity、transform 和 filter 过渡。
- 模块 hover 时采用较平滑的约 0.42s 展开过渡，文字清晰度和透明度也同步过渡。

### 2.4 恢复文章页左侧个人介绍

对应提交：cf84813，Restore profile card on article pages

- 文章页左侧重新保留个人介绍卡片。
- 个人介绍卡片不应因为冻结音乐模块而被隐藏或固定。

### 2.5 修复侧栏覆盖问题并恢复目录项高亮

对应提交：5172b53，Fix article rail overlap and restore toc hover

- 将错误的 fixed 侧栏修正为 sticky 侧栏。
- 恢复鼠标移动到某个具体目录项时的高亮行为。
- 具体目录项 hover/focus 会成为当前交互焦点，并显示它的直接次级标题。

### 2.6 最终确定只冻结左侧音乐模块

对应提交：8264c08，Keep profile flow and freeze music only

当前最终布局规则是：

- 左侧个人介绍：正常页面流，不冻结。
- 左侧 Now Playing 音乐模块：桌面端 sticky，随页面滚动保持在顶部附近。
- 右侧 Contents：桌面端 sticky，保持在顶部附近。
- 右侧 Contents 过长时，右侧目录容器允许自己的纵向滚动；这不应扩散成左侧整列出现滚轮。
- 1000px 及以下进入移动布局，左右模块恢复普通页面流，不保留桌面端 sticky 语义。

## 3. 当前 Contents 的准确行为契约

当前实现位置：

- 模板挂载：themes/regulusapples-blog/layout/layout.ejs
- 目录解析和状态：themes/regulusapples-blog/source/js/main.js
- 字号、虚化、颜色和动画：themes/regulusapples-blog/source/css/style.css

### 3.1 目录解析

- 只在文章页创建 Contents。
- 解析正文中的 h2、h3、h4、h5、h6。
- 通过标题层级建立父子关系。
- 不额外生成标题前编号；如果文章标题文字本身写了编号，那属于文章内容，不由 Contents 删除。

### 3.2 常态和滚动状态

- 根级标题始终显示。
- 根据滚动位置计算当前标题。
- 当前标题及其祖先作为 active path。
- active path 的直接子级按层级显示。
- 无关的更深层级隐藏。
- 默认显示的目录文字保留虚化和较低透明度。
- 当前标题清晰显示并使用橙色高亮。

这里必须区分两个概念：

~~~text
显示 = 结构上占据目录位置
清晰 = 取消 blur、提高 opacity、使用更明确颜色
~~~

### 3.3 鼠标移到单个目录标题

- 被指向的标题高亮。
- 如果它有子标题，显示它下面的直接次一级标题。
- 不因为 hover 一个目录项就无条件展开整棵后代树。
- 键盘 focus 与鼠标 hover 使用同一套核心状态。
- 鼠标离开目录项后，恢复由滚动位置决定的状态。

### 3.4 鼠标移到整个 Contents 模块

这是用户多次澄清后的最终语义：

- 鼠标进入 Contents 卡片本身时，目录全部展开，包括所有已经解析到的层级。
- 同时取消目录项的虚化，使当前模块中的目录文字整体清晰。
- 这不是“只取消虚化而不展开”。早期 V3 的这条描述已经过时。
- 展开过程需要有自然动画，不能突然跳变。
- 具体被鼠标指向的目录项仍然高亮。
- 鼠标离开整个 Contents 模块后，清除模块 hover 状态和单项 hover 状态，恢复滚动状态下的层级、虚化和当前标题高亮。

当前关键状态和 class：

~~~text
moduleHovered
hoveredEntry
.is-expanded
.is-revealed
.is-current
.is-hovered
.is-module-clear
~~~

当前 CSS 基线约为：根目录文字 14px、子目录文字 13px、默认 blur(3px)。如果用户再次要求“字体更大”或“动画更自然”，先用 grilling 明确是改全部目录、只改子级、改卡片宽度，还是只改过渡参数。

## 4. 必须继续使用 grilling 的沟通纪律

这个要求来自用户，并已经在 V3 中提出；V4 再次强调，因为此前 Contents 已发生过多次语义误解。

凡是涉及 Contents、冻结、模块、动画、虚化、显示、展开、亮起、恢复或回滚，不能只根据一句短话直接改代码。先：

1. 读取 C:\Users\Regulus\.agents\skills\SKILLS_INDEX.md，再读取命中的 skill 完整说明；
2. 检查实际代码、当前工作树、生成结果和最近提交，事实由 agent 自行确认；
3. 用自己的话复述当前行为和目标行为的差异；
4. 对仍然属于产品决策的问题集中 grilling，一次列出当前所有决策前沿；
5. 明确默认、滚动、单目录项 hover、整个模块 hover、离开模块、键盘 focus、移动端和动画行为；
6. 用户确认完整状态机后再修改。

尤其不要混淆：

~~~text
显示出来 ≠ 取消虚化
展开 ≠ 只显示当前项
模块 hover ≠ 单项 hover
高亮 ≠ 改变目录层级
冻结 ≠ fixed 脱离 grid
回滚 ≠ 直接 reset --hard
上传 ≠ 本地预览
发布 ≠ GitHub push
~~~

如果用户说“不是这个”“修复”“回滚”“你删掉了”，先停止扩展修改，说明当前实现和用户目标的差异，再确认是：

- 修正当前行为；
- 撤销最近一个局部行为；
- 回到某个明确 commit；还是
- 只恢复线上版本。

没有确认前，不要把需求误判成整站回滚。

## 5. 当前文件和命令落点

### 5.1 常用源文件

- 根配置：_config.yml
- 依赖和命令：package.json
- 普通文章：source/_posts/
- 周小结草稿：source/_drafts/
- 个人介绍：source/about/index.md
- 主题配置：themes/regulusapples-blog/_config.yml
- 全局模板：themes/regulusapples-blog/layout/layout.ejs
- 侧栏模块：themes/regulusapples-blog/layout/_partial/sidebar.ejs
- 文章正文模板：themes/regulusapples-blog/layout/post.ejs
- 样式：themes/regulusapples-blog/source/css/style.css
- 前端交互：themes/regulusapples-blog/source/js/main.js
- Service Worker：source/sw.js
- 普通/周小结分流：scripts/regular-posts.js
- Sites 产物准备：tools/prepare-sites.mjs
- 生成站点校验：tools/verify-generated-site.mjs
- 站点绑定配置：.openai/hosting.json，不要把其中内部标识写入公开文档或文章。

### 5.2 本地运行

首次安装依赖：

~~~powershell
npm install
~~~

启动本地预览：

~~~powershell
npx hexo server --draft --port 4001
~~~

访问：http://localhost:4001/

也可以使用：

~~~powershell
npm run dev
~~~

默认端口通常为 4000。服务器保持运行时，修改文章并保存后通常只需刷新浏览器；遇到缓存问题先使用 Ctrl + F5，再考虑重启服务器。

### 5.3 构建和验证

~~~powershell
npm run clean
npm run build
npm run verify
node --check themes/regulusapples-blog/source/js/main.js
git diff --check
~~~

npm run build 会生成 public/ 并准备 Sites 产物。public/、dist/ 是生成目录，不要手工编辑。

当前资源版本关系为：

~~~text
layout.ejs: style.css?v=30
layout.ejs: main.js?v=21
source/sw.js: regulusapples-blog-v14
~~~

修改 CSS/JS 后必须同步检查 layout 引用、Service Worker 缓存名和校验脚本，避免浏览器继续使用旧资源。

### 5.4 Git 与发布

当前 remote 约定：

~~~text
origin  = GitHub 源码仓库
sites   = Codex Sites 发布源
~~~

源码提交建议：

~~~powershell
git status --short
git diff --check
git diff --cached
git add <明确的文件>
git commit -m "描述本次修改"
git push
~~~

- 不要使用 git add .，尤其不要把临时文件、未确认的素材、生成目录和敏感配置顺手提交。
- git push 是推送 GitHub 源码，不代表 Codex Sites 已发布。
- 当前根配置的 deploy.type 为空，npm run deploy 不是当前 Codex Sites 正式发布命令。
- 用户明确说“上传/发布”后，才进入 Sites building/hosting 流程；本地预览、GitHub push、Sites 发布必须分别报告。

## 6. 外部接入和域名当前状态

- 评论：只有页面/占位能力，是否接入 Giscus 或其他服务等待用户单独决定。
- 音乐：有 Now Playing 界面和曲目元数据，但真实音频地址尚未由用户确认；不要擅自接入第三方音源。
- 留言板：页面容器存在，真实留言后端尚未接入。
- 统计：没有真实 Umami 或 Google Analytics 标识，不要自行添加。
- GitHub：用于保存 Hexo 源码、文章和版本历史。
- Codex Sites：当前正式站点托管平台。
- 阿里云：购买了 regulusapplex.space 域名；实名认证账号已通过，但域名信息模板仍在注册局审核中。审核通过后还要关联模板、解除 ClientHold、配置 DNS 和验证 HTTPS。

## 7. 下一位 agent 的接手清单

- [ ] 先读取 HANDOFF_V1.md、HANDOFF_V2.md、HANDOFF_V3.md 和本文件。
- [ ] 执行 git status --short，保留 source/about/index.md 的用户未提交改动。
- [ ] 处理 Contents 或视觉交互前，先按本文件第 4 节 grilling。
- [ ] 不要把 V3 中“模块 hover 只取消虚化、不展开隐藏层级”的旧描述当作当前规则；当前规则是模块 hover 全部展开并带动画。
- [ ] 不要冻结整个左侧；最终只冻结左侧音乐模块，个人介绍保持正常页面流。
- [ ] 文章页右侧 Contents 仍保留，不能误删或移回左侧。
- [ ] 修改后执行 clean/build/verify、JavaScript 语法检查和 git diff --check。
- [ ] 涉及 CSS/JS 时同步检查资源版本和 Service Worker。
- [ ] 用户未明确要求发布前，只做本地修改和预览。
- [ ] 任何回滚先确认对象是需求、源码行为、生成缓存还是线上版本。

## 8. V4 文档变更记录

~~~text
范围：新增 handoff/HANDOFF_V4.md
内容：汇总 Hexo 迁移、功能阶段、首页与导航、周小结分流、Contents 右移/冻结/动画/高亮/全展开、个人介绍恢复、音乐单独冻结、Git 与域名状态
特别修正：纠正 V3 已过时的“模块 hover 不展开隐藏层级”描述
代码：未修改
文章：未修改；保留用户在 source/about/index.md 中的未提交改动
线上：未上传、未发布
~~~
