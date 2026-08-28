(function () {
  function escapeHtml(value) {
    return String(value || '').replace(/[&<>\"']/g, function (character) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character];
    });
  }

  function stripHtml(value) {
    var element = document.createElement('div');
    element.innerHTML = String(value || '');
    return (element.textContent || element.innerText || '').replace(/\s+/g, ' ').trim();
  }

  function normalize(value) {
    return stripHtml(value).toLocaleLowerCase();
  }

  var articleBody = document.querySelector('.article-body');
  var toc = document.getElementById('article-toc');

  if (articleBody && toc) {
    var headings = articleBody.querySelectorAll('h2, h3');
    if (headings.length) {
      toc.innerHTML = '';
      headings.forEach(function (heading, index) {
        var id = heading.id || 'section-' + (index + 1);
        heading.id = id;
        var link = document.createElement('a');
        link.href = '#' + id;
        link.className = heading.tagName.toLowerCase() === 'h3' ? 'toc-subitem' : '';
        link.innerHTML = '<span>' + String(index + 1).padStart(2, '0') + '</span>' + escapeHtml(heading.textContent);
        toc.appendChild(link);
      });
    }

    articleBody.querySelectorAll('img').forEach(function (image) {
      if (!image.hasAttribute('loading')) image.setAttribute('loading', 'lazy');
      image.setAttribute('decoding', 'async');
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (event) {
      var targetId = link.getAttribute('href');
      var target = targetId && document.querySelector(targetId);
      if (target) {
        event.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        history.replaceState(null, '', targetId);
      }
    });
  });

  var searchPage = document.querySelector('[data-search-page]');
  if (searchPage) {
    var form = document.getElementById('search-form');
    var input = document.getElementById('search-input');
    var status = document.getElementById('search-status');
    var results = document.getElementById('search-results');
    var entries = [];
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    input.value = initialQuery;

    function entryText(entry) {
      return stripHtml([
        entry.title,
        entry.description,
        entry.text,
        entry.content,
        entry.tags,
        entry.categories
      ].filter(Boolean).join(' '));
    }

    function entrySnippet(entry, query) {
      var text = entryText(entry);
      var lowerText = normalize(text);
      var terms = normalize(query).split(/\s+/).filter(Boolean);
      var index = terms.length ? lowerText.indexOf(terms[0]) : 0;
      if (index < 0) index = 0;
      var start = Math.max(0, index - 48);
      var snippet = text.slice(start, start + 156);
      return (start > 0 ? '…' : '') + snippet + (start + 156 < text.length ? '…' : '');
    }

    function safeUrl(value) {
      var url = String(value || '#');
      return /^(\/|https?:\/\/)/i.test(url) ? url : '#';
    }

    function renderResults() {
      var query = input.value.trim();
      if (!query) {
        status.textContent = '输入关键词后开始搜索。';
        results.innerHTML = '';
        return;
      }

      var terms = normalize(query).split(/\s+/).filter(Boolean);
      var matches = entries.filter(function (entry) {
        var text = normalize(entryText(entry));
        return terms.every(function (term) { return text.indexOf(term) !== -1; });
      });

      status.textContent = '找到 ' + matches.length + ' 篇相关记录。';
      if (!matches.length) {
        results.innerHTML = '<div class="search-empty">暂时没有找到相关内容，换个关键词试试。</div>';
        return;
      }

      results.innerHTML = matches.map(function (entry) {
        var title = escapeHtml(entry.title || '未命名文章');
        var date = escapeHtml(entry.date || '');
        var description = escapeHtml(entry.description || entrySnippet(entry, query));
        return '<article class="search-result"><p class="post-meta"><span>' + date + '</span><span>文章</span></p><h2><a href="' + escapeHtml(safeUrl(entry.url)) + '">' + title + '</a></h2><p>' + description + '</p></article>';
      }).join('');
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var query = input.value.trim();
      var nextUrl = query ? '?q=' + encodeURIComponent(query) : window.location.pathname;
      history.replaceState(null, '', nextUrl);
      renderResults();
    });

    fetch(searchPage.getAttribute('data-search-path'))
      .then(function (response) {
        if (!response.ok) throw new Error('Search index unavailable');
        return response.json();
      })
      .then(function (payload) {
        entries = Array.isArray(payload) ? payload : (payload.data || []);
        renderResults();
      })
      .catch(function () {
        status.textContent = '搜索索引暂时不可用，请稍后再试。';
      });
  }
})();
