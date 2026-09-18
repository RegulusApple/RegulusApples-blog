# HANDOFF V5 — RegulusApple's Blog 当前部署与维护状态

> 生成日期：2026-09-18  
> 用途：让下一位 agent 能从当前状态继续处理博客项目。  
> 本文是交接摘要；历史背景请参考项目内的 `handoff/HANDOFF_V1.md` 至 `handoff/HANDOFF_V4.md`，不要把旧文档中的过期部署状态当作当前事实。

## 0. 当前结论

- 项目当前是 Hexo 8.1.2 博客，使用自定义主题 `regulusapples-blog`。
- GitHub 仓库是 `RegulusApple/RegulusApples-blog`，正式远程为 `origin`。
- 当前本地分支为 `main`，已与 `origin/main` 对齐。
- 当前 HEAD 与远程一致：`c00c79c config: update site URL`。
- `_config.yml` 当前正式域名已经是：

~~~yaml
url: https://www.regulusapplex.space
root: /
~~~

- 本次会话新增了项目根目录 `README.md`，目前尚未提交，工作区状态为 `?? README.md`。
- 当前没有进行中的代码冲突，也没有未提交的源码修改。

## 1. 本次会话完成的事情

### 1.1 Git 分支恢复

本地 `main` 曾经与 GitHub `origin/main` 分叉：本地有一个旧提交，远程有 39 个本地没有的提交。用户明确同意不保留本地旧提交，改为以 GitHub 为准。

已执行并成功完成：

~~~powershell
git fetch --no-tags origin main
git reset --hard origin/main
~~~

因此不要再尝试恢复旧的本地分叉提交，也不要对 `origin/main` 使用 force push。

### 1.2 域名配置

此前裸域名 `regulusapplex.space` 的 GitHub Pages TLS 检查长时间卡住。采用 `www` 子域名方案后，用户在 DNS 服务商处添加了：

~~~text
类型：CNAME
主机记录：www
记录值：RegulusApple.github.io
~~~

裸域名的 GitHub A 记录暂时保留。

最后已知的 GitHub Pages 状态是：

- Custom domain：`www.regulusapplex.space`
- DNS check：successful
- Domain authorization：succeeded
- TLS certificate：仍在 provisioning，界面曾显示 `1 of 3`
- `Enforce HTTPS`：在证书签发完成前不可用

下一位 agent 接手时应重新检查 GitHub Pages 页面和以下地址，不要假设证书已经完成：

~~~text
https://www.regulusapplex.space
~~~

### 1.3 README

项目根目录新增了 `README.md`，内容包括：

- Hexo 技术栈和本地运行方法；
- 普通文章与周记的创建命令；
- 项目目录结构；
- GitHub Pages 自动部署流程；
- 常用 Git 命令；
- 当前域名和 `public/` 生成目录说明。

该文件已经通过 `git diff --check`，但尚未提交或推送。

## 2. 项目真实工作流

### 本地开发

~~~powershell
npm ci
npm run dev
~~~

本地预览地址通常为 `http://localhost:4000`。

### 生成和校验

~~~powershell
npm run clean
npx hexo generate
npm run verify
~~~

`npm run build` 除了生成 Hexo 网站，还会执行 `tools/prepare-sites.mjs` 准备可选的 `dist/` 输出。GitHub Pages 工作流当前直接生成并上传 `public/`，不依赖手动上传生成目录。

### 新建内容

~~~powershell
npm run new -- "文章标题"
npm run new:weekly -- "本周记录"
~~~

正式文章位于 `source/_posts/`，草稿位于 `source/_drafts/`，模板位于 `scaffolds/`。

### GitHub Pages 发布

`.github/workflows/pages.yml` 在 `main` 分支 push 后自动：

1. 安装 Node.js 20 和 npm 依赖；
2. 执行 Hexo clean/generate；
3. 执行 `npm run verify`；
4. 上传 `public/`；
5. 部署到 GitHub Pages。

推荐发布流程：

~~~powershell
git switch main
git pull --ff-only origin main
npx hexo clean
npx hexo generate
npm run verify
git add README.md
git commit -m "docs: add project README"
git push origin main
~~~

如果本次修改不只是 README，不要照抄最后两行，应按实际文件填写 commit 内容。

## 3. 重要文件索引

- `_config.yml`：Hexo 主配置和正式域名。
- `package.json`：项目命令、依赖和 Hexo 版本。
- `.github/workflows/pages.yml`：GitHub Pages 自动部署。
- `source/`：文章、页面、图片和其他站点内容。
- `themes/regulusapples-blog/`：当前自定义主题。
- `scaffolds/`：文章和周记模板。
- `tools/verify-generated-site.mjs`：生成站点校验脚本。
- `tools/prepare-sites.mjs`：准备可选 Sites/Worker 风格输出。
- `README.md`：本次新增的项目说明文档，当前未提交。
- `handoff/HANDOFF_V1.md` 至 `handoff/HANDOFF_V4.md`：历史交接资料，部分外部部署状态已过期。

## 4. 当前不要做的事情

- 不要执行 `git push --force`。
- 不要再次把本地 `main` 重置到旧分支或 `sites/main`。
- 不要把 `sites` 远程当作 GitHub 源码仓库使用；源码发布目标是 `origin`。
- 不要手动编辑 `public/`，它是 Hexo 生成目录。
- 不要在证书未完成时反复删除/添加自定义域名。
- 不要将 API 密钥、密码、Token 或其他敏感信息写入公开仓库。

## 5. 下一步建议

1. 先决定是否提交根目录 `README.md`。
2. 如果提交，运行 `git diff --check` 后提交并推送到 `origin/main`。
3. 在 GitHub Actions 中确认 README 提交触发的部署是否成功。
4. 在 GitHub Pages 设置中确认 `www.regulusapplex.space` 的 TLS 已完成，并勾选 `Enforce HTTPS`。
5. 访问 HTTPS 地址验证首页、文章页、资源和自定义域名。

## 6. 建议下一位 agent 使用的 skills

- `diagnosing-bugs`：如果 GitHub Pages 的 TLS、Actions 或线上资源仍然异常，先建立可复现的检查命令再诊断。
- `computer-use:computer-use`：需要检查 GitHub 网页设置、Actions 运行状态或 Pages 证书状态时使用。
- `writing-for-agents`：如果需要继续修改 `AGENTS.md`、handoff 文档或其他 agent-facing 文档时使用。

## 7. 安全说明

本文未记录账号密码、访问 Token、私钥或其他凭据。公开仓库意味着代码和文章可以被查看、复制和 Fork；只有仓库所有者或被授予写权限的协作者才能直接推送到原仓库。


