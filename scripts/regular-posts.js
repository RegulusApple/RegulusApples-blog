'use strict';

const pagination = require('hexo-pagination');

function isWeekly(post) {
  return Boolean(post && (post.weekly === true || post.weekly === 'true' || post.layout === 'weekly-post'));
}

function toArray(collection) {
  if (!collection) return [];
  if (typeof collection.toArray === 'function') return collection.toArray();
  if (Array.isArray(collection)) return collection.slice();
  return Array.from(collection);
}

function postQuery(hexo, collection, orderBy = '-date') {
  const { Query } = hexo.model('Post');
  return new Query(toArray(collection).filter((post) => !isWeekly(post))).sort(orderBy);
}

function paginationFormat(config) {
  return `${config.pagination_dir || 'page'}/%d/`;
}

hexo.extend.generator.register('index', function generateIndex(locals) {
  const config = this.config;
  const indexConfig = config.index_generator || {};
  const posts = postQuery(this, locals.posts, indexConfig.order_by || '-date');

  posts.data.sort((a, b) => (b.sticky || 0) - (a.sticky || 0));

  return pagination(indexConfig.path || '', posts, {
    perPage: indexConfig.per_page,
    layout: indexConfig.layout || ['index', 'archive'],
    format: paginationFormat(config),
    data: { __index: true }
  });
});

hexo.extend.generator.register('archive', function generateArchive(locals) {
  const config = this.config;
  const archiveConfig = config.archive_generator || {};
  if (archiveConfig.enabled === false) return [];

  let archiveDir = config.archive_dir || 'archives/';
  if (!archiveDir.endsWith('/')) archiveDir += '/';

  const allPosts = postQuery(this, locals.posts, archiveConfig.order_by || '-date');
  const allPostArray = allPosts.toArray();
  if (!allPostArray.length) return [];

  const result = [];
  const perPage = archiveConfig.per_page;
  const { Query } = this.model('Post');

  const generate = (path, posts, data = {}) => {
    result.push(...pagination(path, posts, {
      perPage,
      layout: ['archive', 'index'],
      format: paginationFormat(config),
      data: { ...data, archive: true }
    }));
  };

  generate(archiveDir, allPosts);
  if (!archiveConfig.yearly) return result;

  const postsByYear = {};
  allPostArray.forEach((post) => {
    const year = post.date.year();
    const month = post.date.month() + 1;
    if (!postsByYear[year]) {
      postsByYear[year] = Array.from({ length: 13 }, () => []);
    }
    postsByYear[year][0].push(post);
    postsByYear[year][month].push(post);
  });

  Object.keys(postsByYear).forEach((yearKey) => {
    const year = Number(yearKey);
    const yearData = postsByYear[yearKey];
    if (!yearData[0].length) return;

    generate(`${archiveDir}${year}/`, new Query(yearData[0]), { year });
    if (!archiveConfig.monthly) return;

    for (let month = 1; month <= 12; month += 1) {
      if (!yearData[month].length) continue;
      generate(`${archiveDir}${year}/${String(month).padStart(2, '0')}/`, new Query(yearData[month]), {
        year,
        month
      });
    }
  });

  return result;
});

hexo.extend.generator.register('category', function generateCategories(locals) {
  const config = this.config;
  const categoryConfig = config.category_generator || {};
  const perPage = categoryConfig.per_page;
  const orderBy = categoryConfig.order_by || '-date';

  return locals.categories.reduce((result, category) => {
    const posts = postQuery(this, category.posts, orderBy);
    if (!posts.length) return result;

    return result.concat(pagination(category.path, posts, {
      perPage,
      layout: ['category', 'archive', 'index'],
      format: paginationFormat(config),
      data: { category: category.name }
    }));
  }, []);
});

hexo.extend.generator.register('tag', function generateTags(locals) {
  const config = this.config;
  const tagConfig = config.tag_generator || {};
  const perPage = tagConfig.per_page;
  const orderBy = tagConfig.order_by || '-date';

  return locals.tags.reduce((result, tag) => {
    const posts = postQuery(this, tag.posts, orderBy);
    if (!posts.length) return result;

    return result.concat(pagination(tag.path, posts, {
      perPage,
      layout: ['tag', 'archive', 'index'],
      format: paginationFormat(config),
      data: { tag: tag.name }
    }));
  }, []);
});

hexo.extend.generator.register('post', function generatePosts(locals) {
  const posts = toArray(locals.posts.sort('-date'));
  const regularPosts = posts.filter((post) => !isWeekly(post));

  posts.forEach((post) => {
    delete post.prev;
    delete post.next;
  });

  regularPosts.forEach((post, index) => {
    if (index) post.prev = regularPosts[index - 1];
    if (index < regularPosts.length - 1) post.next = regularPosts[index + 1];
  });

  return posts.map((post) => {
    const { path, layout } = post;
    if (!layout || layout === 'false') {
      return { path, data: post.content };
    }

    const layouts = ['post', 'page', 'index'];
    if (layout !== 'post') layouts.unshift(layout);
    post.__post = true;
    return { path, layout: layouts, data: post };
  });
});
