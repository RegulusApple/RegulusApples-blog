'use client';

import { useMemo, useState } from 'react';

type Category = '学习' | '项目' | '读书' | '生活' | '随笔' | '技术';

type Post = {
  slug: string;
  title: string;
  excerpt: string;
  category: Category;
  date: string;
  readingTime: string;
  tags: string[];
  accent: string;
};

const posts: Post[] = [
  {
    slug: 'learning-as-a-reviewable-system',
    title: '把学习变成可回看的系统',
    excerpt: '从一次次零散的搜索、实验与复盘开始，慢慢搭出属于自己的知识地图。',
    category: '学习',
    date: '2026.08.26',
    readingTime: '6 min read',
    tags: ['方法', '记录'],
    accent: 'blue',
  },
  {
    slug: 'a-small-project-review',
    title: '一个小项目的拆解与复盘',
    excerpt: '项目真正有价值的部分，往往不只是最后交付的结果，也包括中途做过的判断。',
    category: '项目',
    date: '2026.08.20',
    readingTime: '8 min read',
    tags: ['复盘', '实践'],
    accent: 'violet',
  },
  {
    slug: 'reading-clear-minded-in-change',
    title: '读书摘记：在变化里保持清醒',
    excerpt: '有些书不会立刻给出答案，但会帮我们换一个角度，重新看见问题。',
    category: '读书',
    date: '2026.08.12',
    readingTime: '4 min read',
    tags: ['书摘', '思考'],
    accent: 'rose',
  },
  {
    slug: 'a-note-to-my-future-self',
    title: '给未来自己的生活备忘',
    excerpt: '关于一些微小但重要的事：慢一点、走出去、保留好奇心。',
    category: '生活',
    date: '2026.08.05',
    readingTime: '3 min read',
    tags: ['日常', '备忘'],
    accent: 'amber',
  },
  {
    slug: 'record-memory-reinvention',
    title: '记录、记忆与重新发明',
    excerpt: '写下来的瞬间，既是在保存过去，也是在给未来留下重新理解自己的入口。',
    category: '随笔',
    date: '2026.07.28',
    readingTime: '5 min read',
    tags: ['随想', '时间'],
    accent: 'green',
  },
  {
    slug: 'tools-for-the-things-that-matter',
    title: '让工具服务于真正想做的事',
    excerpt: '技术不是终点。把复杂的工具变得顺手，是为了把更多注意力留给问题本身。',
    category: '技术',
    date: '2026.07.18',
    readingTime: '7 min read',
    tags: ['工具', '效率'],
    accent: 'cyan',
  },
];

const categories: { name: Category; count: string; note: string }[] = [
  { name: '学习', count: '12', note: 'knowledge in motion' },
  { name: '项目', count: '08', note: 'build, test, reflect' },
  { name: '读书', count: '16', note: 'slow ideas, long echoes' },
  { name: '生活', count: '21', note: 'small things matter' },
  { name: '随笔', count: '09', note: 'thoughts between lines' },
  { name: '技术', count: '14', note: 'tools for better work' },
];

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<'全部' | Category>('全部');
  const [query, setQuery] = useState('');
  const [isLight, setIsLight] = useState(false);

  const filteredPosts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return posts.filter((post) => {
      const matchesCategory = activeCategory === '全部' || post.category === activeCategory;
      const matchesQuery =
        !normalizedQuery ||
        `${post.title} ${post.excerpt} ${post.tags.join(' ')}`.toLowerCase().includes(normalizedQuery);

      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, query]);

  return (
    <div className={`site-shell${isLight ? ' light' : ''}`}>
      <header className="topbar">
        <a className="brand" href="#top" aria-label="回到 Halfold's Blog 首页">
          <span className="brand-mark">H</span>
          <span className="brand-copy">
            <strong>Halfold’s Blog</strong>
            <span>Personal archive · 01</span>
          </span>
        </a>

        <nav className="topnav" aria-label="主导航">
          <a className="active" href="#notes">Notes</a>
          <a href="#categories">Categories</a>
          <a href="#about">About</a>
        </nav>

        <div className="top-actions">
          <button
            className="icon-button"
            type="button"
            aria-label={isLight ? '切换为深色模式' : '切换为浅色模式'}
            onClick={() => setIsLight((value) => !value)}
          >
            {isLight ? '☾' : '☼'}
          </button>
          <a className="small-button" href="#about">Say hello</a>
        </div>
      </header>

      <main id="top" className="page-content">
        <section className="hero-section" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow"><span className="eyebrow-dot" /> A quiet corner on the internet</p>
            <h1 id="hero-title">Record.<br /><em>Remember.</em><br />Reinvent.</h1>
            <p className="hero-description">
              Welcome to Halfold’s Blog — a personal space for learning, projects, books,
              everyday life, and the ideas that stay after the screen goes dark.
            </p>
            <div className="hero-actions">
              <a className="primary-button" href="#notes">Explore notes <span>↗</span></a>
              <a className="text-button" href="#about">More about Halfold <span>→</span></a>
            </div>
          </div>

          <div className="hero-portrait" aria-label="Halfold 的头像">
            <div className="portrait-orbit orbit-one" />
            <div className="portrait-orbit orbit-two" />
            <div className="portrait-card">
              <img src="/avatar.jpg" alt="Halfold 的头像" />
              <span className="portrait-label">now / here</span>
              <span className="portrait-coordinate">31°14′N · 121°28′E</span>
            </div>
            <div className="portrait-note note-top">keep<br />curious</div>
            <div className="portrait-note note-bottom">vol. 01<br /><span>2026</span></div>
          </div>
        </section>

        <section className="quote-strip" aria-label="博客寄语">
          <span className="quote-mark">“</span>
          <p>What is written down becomes a place we can return to.</p>
          <span className="quote-line" />
          <span className="quote-caption">A note to self</span>
        </section>

        <section id="notes" className="content-layout" aria-labelledby="notes-title">
          <div className="notes-column">
            <div className="section-heading">
              <div>
                <p className="section-kicker">Recent notes</p>
                <h2 id="notes-title">A few things<br /><span>worth keeping.</span></h2>
              </div>
              <span className="section-index">01 / 03</span>
            </div>

            <div className="filter-row" aria-label="文章筛选">
              <div className="category-filters">
                {(['全部', ...categories.map((item) => item.name)] as const).map((category) => (
                  <button
                    key={category}
                    className={activeCategory === category ? 'filter-chip selected' : 'filter-chip'}
                    type="button"
                    onClick={() => setActiveCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
              <label className="search-field">
                <span aria-hidden="true">⌕</span>
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search notes"
                  aria-label="搜索文章"
                />
              </label>
            </div>

            <div className="notes-list">
              {filteredPosts.map((post, index) => (
                <article className={`note-card accent-${post.accent}`} key={post.title}>
                  <div className="note-card-topline">
                    <span className="note-number">0{index + 1}</span>
                    <span className="note-category">{post.category}</span>
                    <span className="note-date">{post.date}</span>
                  </div>
                  <h3>{post.title}</h3>
                  <p>{post.excerpt}</p>
                  <div className="note-card-footer">
                    <div className="tag-list">
                      {post.tags.map((tag) => <span key={tag}>#{tag}</span>)}
                    </div>
                    <a className="read-link" href={`/notes/${post.slug}`}>
                      Read note <span>↗</span>
                    </a>
                  </div>
                </article>
              ))}
              {filteredPosts.length === 0 && (
                <div className="empty-state">没有找到匹配的记录，换个关键词试试。</div>
              )}
            </div>
          </div>

          <aside className="side-column">
            <section className="side-card profile-card" id="about">
              <div className="side-card-heading">
                <span>01</span>
                <span>About the author</span>
              </div>
              <div className="mini-profile">
                <img src="/avatar.jpg" alt="Halfold" />
                <div>
                  <strong>Halfold</strong>
                  <span>student · maker · reader</span>
                </div>
              </div>
              <p>正在学习如何把好奇心变成作品，也在练习把生活里微小的瞬间认真保存下来。</p>
              <a className="side-link" href="mailto:hello@halfold.example">hello@halfold.example <span>↗</span></a>
            </section>

            <section className="side-card category-card" id="categories">
              <div className="side-card-heading">
                <span>02</span>
                <span>Explore by mood</span>
              </div>
              <div className="category-list">
                {categories.map((item) => (
                  <button
                    type="button"
                    key={item.name}
                    className="category-row"
                    onClick={() => {
                      setActiveCategory(item.name);
                      document.getElementById('notes')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    <span className="category-name"><i />{item.name}</span>
                    <span className="category-note">{item.note}</span>
                    <span className="category-count">{item.count}</span>
                  </button>
                ))}
              </div>
            </section>

            <section className="side-card now-card">
              <div className="side-card-heading">
                <span>03</span>
                <span>Currently</span>
              </div>
              <p className="now-label">reading</p>
              <h3>在不确定的世界里，保持一点自己的节奏。</h3>
              <div className="now-progress"><span /></div>
              <div className="now-meta"><span>slow thoughts</span><span>∞</span></div>
            </section>
          </aside>
        </section>

        <section className="archive-banner" aria-label="博客统计">
          <div><strong>80</strong><span>notes in archive</span></div>
          <div><strong>06</strong><span>areas of curiosity</span></div>
          <div><strong>∞</strong><span>more to come</span></div>
          <p>Record, Remember,<br /><em>Reinvent, Revolutionize.</em></p>
        </section>
      </main>

      <footer className="site-footer">
        <span>© 2026 Halfold’s Blog</span>
        <span>Made with curiosity & care</span>
        <a href="#top">Back to top ↑</a>
      </footer>

    </div>
  );
}
