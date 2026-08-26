import { notFound } from 'next/navigation';
import Link from 'next/link';

const articles = {
  'learning-as-a-reviewable-system': {
    category: '学习',
    date: '2026.08.26',
    readingTime: '6 min read',
    title: '把学习变成可回看的系统',
    excerpt: '从一次次零散的搜索、实验与复盘开始，慢慢搭出属于自己的知识地图。',
    tags: ['方法', '记录'],
    sections: [
      { title: '先留下痕迹', paragraphs: ['学习最容易被忽略的部分，是那些没有被写下来的尝试。一个结论、一段代码、一次失败的实验，都值得留下足够的上下文。'] },
      { title: '再建立连接', paragraphs: ['记录不是把资料堆在一起，而是不断回答“它和我之前知道的什么有关”。当笔记开始互相链接，知识就从收藏夹里走出来，变成可以反复使用的工具。'], quote: '好的笔记不是终点，而是下一次思考的起点。' },
      { title: '最后定期回看', paragraphs: ['每隔一段时间回头看看，删掉不再成立的部分，补上新的例子。对我来说，这比追求一次写出完美笔记更重要。'] },
    ],
  },
  'a-small-project-review': {
    category: '项目',
    date: '2026.08.20',
    readingTime: '8 min read',
    title: '一个小项目的拆解与复盘',
    excerpt: '项目真正有价值的部分，往往不只是最后交付的结果，也包括中途做过的判断。',
    tags: ['复盘', '实践'],
    sections: [
      { title: '从目标开始，而不是从工具开始', paragraphs: ['面对一个新项目，我会先把“想做什么”写成一句可以验证的话，再去决定使用什么工具。工具会变化，但问题本身应该足够稳定。'] },
      { title: '给不确定性留位置', paragraphs: ['计划不需要假装一切都已知。把风险、依赖和可能推翻当前方案的条件写出来，反而能让调整变得更从容。'], quote: '复盘不是寻找一个人负责，而是找到下一次可以更早做出的判断。' },
      { title: '交付之后再走一遍', paragraphs: ['把结果交出去以后，再从用户的视角走一遍流程。那些当时觉得“以后再说”的小问题，往往就是下一次迭代最值得处理的入口。'] },
    ],
  },
  'reading-clear-minded-in-change': {
    category: '读书',
    date: '2026.08.12',
    readingTime: '4 min read',
    title: '读书摘记：在变化里保持清醒',
    excerpt: '有些书不会立刻给出答案，但会帮我们换一个角度，重新看见问题。',
    tags: ['书摘', '思考'],
    sections: [
      { title: '答案之外', paragraphs: ['我越来越喜欢那些不急着给出结论的书。它们允许问题保持一会儿，让读者在自己的生活里完成剩下的部分。'] },
      { title: '保持自己的速度', paragraphs: ['阅读不是和别人比较进度，也不是把书变成待完成的任务。有时读几页，停下来想一想，才是一本书真正开始发挥作用的时刻。'], quote: '清醒不是永远确定，而是知道自己正在不确定。' },
      { title: '把一句话带回生活', paragraphs: ['一本书最好的读后感，可能不是一篇文章，而是在某个具体时刻想起它，并因此做出一点不同的选择。'] },
    ],
  },
  'a-note-to-my-future-self': {
    category: '生活',
    date: '2026.08.05',
    readingTime: '3 min read',
    title: '给未来自己的生活备忘',
    excerpt: '关于一些微小但重要的事：慢一点、走出去、保留好奇心。',
    tags: ['日常', '备忘'],
    sections: [
      { title: '别把生活推迟到以后', paragraphs: ['想看的风景、想见的人、想尝试的事情，不必等到所有条件都刚刚好。生活常常是在不完整里向前发生的。'] },
      { title: '保存小小的证据', paragraphs: ['一张照片、一段文字、一次散步，都可以成为“我曾经这样生活过”的证据。记住它们，不是为了怀旧，而是为了知道自己走了多远。'], quote: '慢一点没有关系，只要还在向着真正想去的地方。' },
      { title: '继续保持好奇', paragraphs: ['愿下一次打开这篇备忘时，依然愿意对陌生的事物多看一眼。'] },
    ],
  },
  'record-memory-reinvention': {
    category: '随笔',
    date: '2026.07.28',
    readingTime: '5 min read',
    title: '记录、记忆与重新发明',
    excerpt: '写下来的瞬间，既是在保存过去，也是在给未来留下重新理解自己的入口。',
    tags: ['随想', '时间'],
    sections: [
      { title: '记录会改变记忆', paragraphs: ['我们以为记录是在复制过去，其实每一次写下，都在为那段经历选择新的角度。于是记忆不只是被保存，也在被重新组织。'] },
      { title: '给未来一个入口', paragraphs: ['未来的自己未必记得今天的情绪，但可以通过文字重新接近它。那些当时看似琐碎的细节，可能会在很久以后变得明亮。'], quote: '我们写给未来的，往往也是另一个版本的自己。' },
      { title: '继续发明自己', paragraphs: ['记录不是把自己固定下来。恰恰相反，它让我们看见变化，从而拥有重新选择和重新开始的可能。'] },
    ],
  },
  'tools-for-the-things-that-matter': {
    category: '技术',
    date: '2026.07.18',
    readingTime: '7 min read',
    title: '让工具服务于真正想做的事',
    excerpt: '技术不是终点。把复杂的工具变得顺手，是为了把更多注意力留给问题本身。',
    tags: ['工具', '效率'],
    sections: [
      { title: '先弄清楚什么值得自动化', paragraphs: ['不是所有重复工作都需要被自动化。真正值得处理的，是那些消耗注意力、容易出错，而且不会因为偶尔做一次就获得新经验的环节。'] },
      { title: '让工具变得可解释', paragraphs: ['一个好工具应该让人知道它正在做什么、为什么这样做，以及出了问题以后该从哪里开始排查。顺手之外，清晰同样重要。'], quote: '工具越复杂，使用它的理由就越应该简单。' },
      { title: '把时间还给问题', paragraphs: ['当工具稳定地退到背景里，我们才真正拥有更多空间去理解问题、提出假设，并做出更有创造力的选择。'] },
    ],
  },
} as const;

type Slug = keyof typeof articles;

export function generateStaticParams() {
  return Object.keys(articles).map((slug) => ({ slug }));
}

export default async function NotePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  if (!(slug in articles)) notFound();
  const article = articles[slug as Slug];

  return (
    <div className="site-shell article-shell">
      <header className="global-bar">
        <div className="global-bar-inner">
          <Link className="brand" href="/" aria-label="回到 Halfold's Blog 首页">
            <span className="brand-mark">H</span>
            <span className="brand-copy"><strong>Halfold’s Blog</strong></span>
          </Link>
          <Link className="small-button" href="/">返回文章</Link>
        </div>
      </header>

      <main className="article-content">
        <div className="article-topline">
          <Link href="/">← Recent notes</Link>
          <span>{article.category} · {article.readingTime}</span>
        </div>
        <article className="article-card">
          <header className="article-header">
            <p className="section-kicker">{article.date} · field note</p>
            <h1>{article.title}</h1>
            <p className="article-excerpt">{article.excerpt}</p>
            <div className="tag-list">{article.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div>
          </header>
          <div className="article-divider" />
          <div className="article-body">
            {article.sections.map((section) => (
              <section key={section.title}>
                <h2>{section.title}</h2>
                {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                {'quote' in section && section.quote && <blockquote>{section.quote}</blockquote>}
              </section>
            ))}
          </div>
          <footer className="article-footer">
            <Link href="/">← Back to all notes</Link>
            <span>Written by Halfold</span>
          </footer>
        </article>
      </main>
    </div>
  );
}
