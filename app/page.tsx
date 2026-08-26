'use client';

import { useMemo, useState } from 'react';

type Category = '学习' | '项目' | '读书' | '生活' | '随笔' | '技术';
type Area = 'article' | 'archive' | 'categories' | 'tags' | 'album' | 'music' | 'myself' | 'links' | 'sitetime';

type Post = {
  slug: string;
  title: string;
  excerpt: string;
  category: Category;
  date: string;
  year: string;
  readingTime: string;
  tags: string[];
};

const posts: Post[] = [
  { slug: 'learning-as-a-reviewable-system', title: '把学习变成可回看的系统', excerpt: '从一次次零散的搜索、实验与复盘开始，慢慢搭出属于自己的知识地图。', category: '学习', date: '2026.08.26', year: '2026', readingTime: '6 分钟', tags: ['方法', '记录'] },
  { slug: 'a-small-project-review', title: '一个小项目的拆解与复盘', excerpt: '项目真正有价值的部分，往往不只是最后交付的结果，也包括中途做过的判断。', category: '项目', date: '2026.08.20', year: '2026', readingTime: '8 分钟', tags: ['复盘', '实践'] },
  { slug: 'reading-clear-minded-in-change', title: '读书摘记：在变化里保持清醒', excerpt: '有些书不会立刻给出答案，但会帮我们换一个角度，重新看见问题。', category: '读书', date: '2026.08.12', year: '2026', readingTime: '4 分钟', tags: ['书摘', '思考'] },
  { slug: 'a-note-to-my-future-self', title: '给未来自己的生活备忘', excerpt: '关于一些微小但重要的事：慢一点、走出去、保留好奇心。', category: '生活', date: '2026.08.05', year: '2026', readingTime: '3 分钟', tags: ['日常', '备忘'] },
  { slug: 'record-memory-reinvention', title: '记录、记忆与重新发明', excerpt: '写下来的瞬间，既是在保存过去，也是在给未来留下重新理解自己的入口。', category: '随笔', date: '2026.07.28', year: '2026', readingTime: '5 分钟', tags: ['随想', '时间'] },
  { slug: 'tools-for-the-things-that-matter', title: '让工具服务于真正想做的事', excerpt: '技术不是终点。把复杂的工具变得顺手，是为了把更多注意力留给问题本身。', category: '技术', date: '2026.07.18', year: '2026', readingTime: '7 分钟', tags: ['工具', '效率'] },
];

const categories: { name: Category; count: string; note: string }[] = [
  { name: '学习', count: '12', note: '把知识变成自己的路径' },
  { name: '项目', count: '08', note: '做出来，再回头复盘' },
  { name: '读书', count: '16', note: '慢一点，让想法留下回声' },
  { name: '生活', count: '21', note: '认真保存微小的日常' },
  { name: '随笔', count: '09', note: '写下线条之间的念头' },
  { name: '技术', count: '14', note: '让工具服务于真正想做的事' },
];

const areaLabels: Record<Area, string> = {
  article: '全部文章', archive: '归档', categories: '分类', tags: '标签', album: '相册', music: '音乐', myself: '关于我', links: '友情链接', sitetime: '站点信息',
};

const allTags = ['记录', '学习', '项目', '读书', '效率', '生活', '复盘', '随笔', '技术', '时间', '思考', '方法'];

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="eyebrow">{children}</p>;
}

export default function Home() {
  const [activeArea, setActiveArea] = useState<Area>('article');
  const [activeCategory, setActiveCategory] = useState<'全部' | Category>('全部');
  const [query, setQuery] = useState('');
  const [softMode, setSoftMode] = useState(false);

  const filteredPosts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return posts.filter((post) => {
      const matchesCategory = activeCategory === '全部' || post.category === activeCategory;
      const matchesQuery = !normalizedQuery || `${post.title} ${post.excerpt} ${post.tags.join(' ')}`.toLowerCase().includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, query]);

  const openArea = (area: Area) => {
    setActiveArea(area);
    if (area !== 'article') setActiveCategory('全部');
    window.history.replaceState({}, '', area === 'article' ? window.location.pathname : `#${area}`);
    window.setTimeout(() => document.getElementById('workspace')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
  };

  const openCategory = (category: Category) => {
    setActiveCategory(category);
    setActiveArea('article');
    window.history.replaceState({}, '', `#category-${category}`);
    window.setTimeout(() => document.getElementById('workspace')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
  };

  return (
    <div className={`site-shell${softMode ? ' soft-mode' : ''}`}>
      <header className="global-bar">
        <div className="global-bar-inner">
          <a className="brand" href="#top" aria-label="回到 Halfold’s Blog 首页"><span className="brand-mark">H</span><span className="brand-copy"><strong>Halfold’s Blog</strong></span></a>
          <nav className="topnav" aria-label="主导航">
            <button className={activeArea === 'article' ? 'active' : ''} type="button" onClick={() => openArea('article')}>文章</button>
            <button className={activeArea === 'archive' ? 'active' : ''} type="button" onClick={() => openArea('archive')}>归档</button>
            <button className={activeArea === 'myself' ? 'active' : ''} type="button" onClick={() => openArea('myself')}>关于</button>
          </nav>
          <div className="status"><i />清新记录中</div>
        </div>
      </header>

      <main id="top" className="page-content">
        <div className="solitude-layout">
          <aside className="solitude-sidebar" aria-label="博客功能分区">
            <section className="sidebar-profile">
              <div className="profile-index"><span>01</span><span>MYSELF</span></div>
              <div className="widget-profile"><img src="/avatar.png" alt="Halfold 的头像" /><div><strong>Halfold</strong><span>student · maker · reader</span></div></div>
              <p>正在学习如何把好奇心变成作品，也在练习把生活里的微小瞬间认真保存下来。</p>
            </section>

            <div className="side-group"><h2>文章</h2>{(['article', 'archive', 'categories', 'tags'] as Area[]).map((area) => <button key={area} className={activeArea === area ? 'side-link active' : 'side-link'} type="button" onClick={() => openArea(area)}>{areaLabels[area]}</button>)}</div>
            <div className="side-group"><h2>记忆</h2>{(['album', 'music'] as Area[]).map((area) => <button key={area} className={activeArea === area ? 'side-link active' : 'side-link'} type="button" onClick={() => openArea(area)}>{areaLabels[area]}</button>)}</div>
            <div className="side-group"><h2>关于</h2>{(['myself', 'links', 'sitetime'] as Area[]).map((area) => <button key={area} className={activeArea === area ? 'side-link active' : 'side-link'} type="button" onClick={() => openArea(area)}>{areaLabels[area]}</button>)}</div>
            <div className="side-group side-interest"><h2>兴趣标签</h2><div className="side-tags">{['学习', '项目', '读书', '生活', '技术', '随笔'].map((tag) => <button key={tag} type="button" onClick={() => openCategory(tag as Category)}>{tag}</button>)}</div></div>
          </aside>

          <div className="solitude-main">
            <div className="workspace-bar"><span>Halfold · 个人博客 · 2026</span><div className="workspace-actions"><button type="button" onClick={() => setSoftMode((value) => !value)}>{softMode ? '☼ 清新模式' : '☼ 显示模式'}</button><button type="button" onClick={() => openArea('article')}>⌕ 搜索</button></div></div>

            <section className="welcome-panel" aria-labelledby="hero-title">
              <div className="welcome-copy"><Eyebrow>welcome to my little corner</Eyebrow><h1 id="hero-title">Halfold’s<br /><em>Blog.</em></h1><p>Record，Remember，Reinvent，Revolutionize。把学习、项目、读书与生活，慢慢放进一个可以回看的地方。</p><button className="primary-button" type="button" onClick={() => openArea('article')}><span className="button-text">阅读最近文章</span><span>↗</span></button></div>
              <div className="welcome-art"><div className="art-dots" /><img src="/whitesmith.jpg" alt="Whitesmith 插画" /><span>WHITESMITH · 01</span></div>
            </section>

            <div id="workspace" className="workspace-anchor">
              {activeArea === 'article' && <ArticleArea posts={filteredPosts} activeCategory={activeCategory} setActiveCategory={setActiveCategory} query={query} setQuery={setQuery} />}
              {activeArea === 'archive' && <ArchiveArea />}
              {activeArea === 'categories' && <CategoriesArea onChoose={openCategory} />}
              {activeArea === 'tags' && <TagsArea onChoose={(tag) => { setQuery(tag); openArea('article'); }} />}
              {activeArea === 'album' && <AlbumArea />}
              {activeArea === 'music' && <MusicArea />}
              {activeArea === 'myself' && <MyselfArea />}
              {activeArea === 'links' && <LinksArea />}
              {activeArea === 'sitetime' && <SiteTimeArea />}
            </div>

            <footer className="solitude-footer"><span>文章：{posts.length} 篇</span><span>分类：{categories.length} 个</span><span>© 2026 Halfold</span></footer>
          </div>
        </div>
      </main>
    </div>
  );
}

function AreaHeader({ kicker, title, meta }: { kicker: string; title: React.ReactNode; meta: string }) {
  return <div className="area-header"><div><Eyebrow>{kicker}</Eyebrow><h2>{title}</h2></div><span>{meta}</span></div>;
}

function ArticleArea({ posts: visiblePosts, activeCategory, setActiveCategory, query, setQuery }: { posts: Post[]; activeCategory: '全部' | Category; setActiveCategory: (category: '全部' | Category) => void; query: string; setQuery: (query: string) => void }) {
  return <section className="area-panel article-area" aria-labelledby="article-title"><AreaHeader kicker="recent notes" title={<>找到一些<br /><em>值得留下的事。</em></>} meta={`${visiblePosts.length} 篇文章`} /><div className="article-controls"><div className="category-filters" aria-label="文章分类筛选">{(['全部', ...categories.map((item) => item.name)] as const).map((category) => <button key={category} className={activeCategory === category ? 'filter-chip selected' : 'filter-chip'} type="button" onClick={() => setActiveCategory(category)}>{category}</button>)}</div><label className="search-field"><span aria-hidden="true">⌕</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索文章" aria-label="搜索文章" /></label></div><div className="feed-list">{visiblePosts.map((post, index) => <article className="feed-post" key={post.slug}><span className="feed-post-index">{String(index + 1).padStart(2, '0')}</span><div><h3><a href={`/notes/${post.slug}`}>{post.title}</a></h3><p>{post.excerpt}</p><div className="feed-post-meta"><span>{post.category}</span><span>{post.date}</span><span>{post.readingTime}</span><a href={`/notes/${post.slug}`}>阅读 ↗</a></div></div></article>)}{visiblePosts.length === 0 && <div className="empty-state">没有找到匹配的记录，换个关键词试试。</div>}</div></section>;
}

function ArchiveArea() {
  return <section className="area-panel"><AreaHeader kicker="article / archive" title={<>一条关于<br /><em>成为自己的时间线。</em></>} meta="2026 / 06 篇" /><div className="archive-list">{posts.map((post, index) => <a className="archive-row" href={`/notes/${post.slug}`} key={post.slug}><strong>{post.year}</strong><span>{String(index + 1).padStart(2, '0')}</span><p>{post.title}<small>{post.category} · {post.date}</small></p><i>↗</i></a>)}</div></section>;
}

function CategoriesArea({ onChoose }: { onChoose: (category: Category) => void }) {
  return <section className="area-panel"><AreaHeader kicker="article / categories" title={<>六个关于<br /><em>好奇心的方向。</em></>} meta="06 个分类" /><div className="category-matrix">{categories.map((item) => <button key={item.name} type="button" onClick={() => onChoose(item.name)}><span>{item.name}</span><strong>{item.count}</strong><small>{item.note}</small></button>)}</div></section>;
}

function TagsArea({ onChoose }: { onChoose: (tag: string) => void }) {
  return <section className="area-panel"><AreaHeader kicker="article / tags" title={<>那些会不断<br /><em>回来的词。</em></>} meta={`${allTags.length} 个标签`} /><div className="tag-cloud-large">{allTags.map((tag, index) => <button className={index % 5 === 0 ? 'big' : index % 4 === 0 ? 'hot' : ''} type="button" key={tag} onClick={() => onChoose(tag)}>#{tag}</button>)}</div></section>;
}

function AlbumArea() {
  const memories = [{ src: '/coast.png', title: 'the sea / somewhere to breathe' }, { src: '/plane.png', title: 'send a thought into the air' }, { src: '/cycling.png', title: 'go a little farther today' }, { src: '/reading.png', title: 'stay with a good idea' }];
  return <section className="area-panel"><AreaHeader kicker="memory / album" title={<>一些值得<br /><em>保存的小场景。</em></>} meta="04 个片段" /><div className="memory-grid">{memories.map((memory, index) => <figure key={memory.src}><img src={memory.src} alt={memory.title} /><figcaption><span>{String(index + 1).padStart(2, '0')}</span>{memory.title}</figcaption></figure>)}</div></section>;
}

function MusicArea() {
  const tracks = [['01', 'A quiet morning', '04:32'], ['02', 'Still, moving', '03:18'], ['03', 'After the rain', '05:06']];
  return <section className="area-panel"><AreaHeader kicker="memory / music" title={<>留给那些<br /><em>不必很响的时刻。</em></>} meta="暂停中 / 03 首" /><div className="music-panel"><div className="music-disc">♫</div><div><p>Currently playing</p><h3>Not everything needs to be loud.</h3><small>音乐播放器占位 · 之后可以接入你的歌单</small></div></div><div className="track-list">{tracks.map((track) => <div key={track[0]}><span>{track[0]}</span><strong>{track[1]}</strong><small>{track[2]}</small></div>)}</div></section>;
}

function MyselfArea() {
  return <section className="area-panel"><AreaHeader kicker="about / myself" title={<>你好，我是<br /><em>Halfold。</em></>} meta="profile / 01" /><div className="about-panel"><img src="/avatar.png" alt="Halfold 的头像" /><div><p>一个正在学习、做项目、读书，也努力把生活过得具体的人。</p><div className="about-facts"><span>student</span><span>maker</span><span>reader</span><span>observer</span></div><p>这里是我的个人角落：记录正在发生的事，也给未来的自己留下一些可以重新打开的入口。</p></div></div></section>;
}

function LinksArea() {
  const links = [['GitHub', '项目与代码的入口', '#'], ['Angelina', '视觉素材与灵感库', '#'], ['Email', '欢迎来信交流', 'mailto:hello@halfold.example'], ['SoCoco', '博客搭建内容参考', 'https://sococo.cn/2025/01/23/2025-01-23_blog_init/']];
  return <section className="area-panel"><AreaHeader kicker="about / links" title={<>一些有用的<br /><em>去处。</em></>} meta="04 个链接" /><div className="link-list">{links.map((link) => <a href={link[2]} key={link[0]}><span>{link[0]}</span><small>{link[1]}</small><b>↗</b></a>)}</div></section>;
}

function SiteTimeArea() {
  return <section className="area-panel"><AreaHeader kicker="about / sitetime" title={<>关于这个<br /><em>小站的记录。</em></>} meta="updated / 2026" /><div className="site-stats"><div><strong>{posts.length}</strong><span>篇文章</span></div><div><strong>{categories.length}</strong><span>个分类</span></div><div><strong>∞</strong><span>继续写下去的日子</span></div></div><div className="site-message">这个页面会随着新的文章、照片和想法，慢慢变成真正属于 Halfold 的时间线。</div></section>;
}
