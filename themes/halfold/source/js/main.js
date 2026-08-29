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

  var readPostsStorageKey = 'halfold-read-posts';
  var parseReadPosts = function (value) {
    try {
      var parsed = JSON.parse(value || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  };
  var getCookieReadPosts = function () {
    try {
      var cookie = document.cookie.split('; ').find(function (item) {
        return item.indexOf(readPostsStorageKey + '=') === 0;
      });
      return cookie ? parseReadPosts(decodeURIComponent(cookie.slice(readPostsStorageKey.length + 1))) : [];
    } catch (error) {
      return [];
    }
  };
  var getReadPosts = function () {
    try {
      var stored = parseReadPosts(localStorage.getItem(readPostsStorageKey));
      if (stored.length) return stored;
    } catch (error) {
      // Fall back to a first-party cookie when storage is unavailable.
    }
    return getCookieReadPosts();
  };
  var saveReadPosts = function (readPosts) {
    var serialized = JSON.stringify(readPosts);
    try { localStorage.setItem(readPostsStorageKey, serialized); } catch (error) {}
    try {
      document.cookie = readPostsStorageKey + '=' + encodeURIComponent(serialized) + '; max-age=31536000; path=/; samesite=lax';
    } catch (error) {}
  };
  var markPostRead = function (path) {
    if (!path) return;
    var readPosts = getReadPosts();
    if (readPosts.indexOf(path) === -1) {
      readPosts.push(path);
      saveReadPosts(readPosts);
    }
  };
  var syncUnreadLabels = function () {
    var readPosts = getReadPosts();
    document.querySelectorAll('.post-row[data-post-path] [data-unread-label]').forEach(function (label) {
      var row = label.closest('[data-post-path]');
      label.hidden = !row || readPosts.indexOf(row.dataset.postPath) !== -1;
    });
  };
  syncUnreadLabels();
  document.querySelectorAll('.post-row[data-post-path]').forEach(function (row) {
    row.querySelectorAll('a[href]').forEach(function (link) {
      link.addEventListener('click', function () {
        markPostRead(row.dataset.postPath);
        syncUnreadLabels();
      });
    });
  });
  var currentArticle = document.querySelector('.article-page[data-post-path]');
  if (currentArticle) markPostRead(currentArticle.dataset.postPath);
  window.addEventListener('pageshow', syncUnreadLabels);

  var navGroups = Array.from(document.querySelectorAll('[data-nav-group]'));
  var subnavPanels = Array.from(document.querySelectorAll('[data-subnav-panel]'));
  if (navGroups.length && subnavPanels.length) {
    var normalizePath = function (path) {
      var normalized = String(path || '/').split('?')[0].replace(/\/+$/, '');
      return normalized || '/';
    };
    var currentPath = normalizePath(window.location.pathname);
    var getNavGroupForPath = function (path) {
      if (['/album', '/music', '/reading'].some(function (prefix) { return path === prefix || path.indexOf(prefix + '/') === 0; })) return 'memory';
      if (['/about', '/links', '/stats', '/message', '/sitetime'].some(function (prefix) { return path === prefix || path.indexOf(prefix + '/') === 0; })) return 'about';
      return 'articles';
    };
    var isNavPathActive = function (path) {
      var targetPath = normalizePath(path);
      return targetPath === '/' ? currentPath === '/' : currentPath === targetPath || currentPath.indexOf(targetPath + '/') === 0;
    };
    var setNavGroup = function (groupKey) {
      navGroups.forEach(function (button) {
        var isActive = button.dataset.navGroup === groupKey;
        button.classList.toggle('is-active', isActive);
        button.setAttribute('aria-expanded', String(isActive));
      });
      subnavPanels.forEach(function (panel) {
        var isActive = panel.dataset.subnavPanel === groupKey;
        panel.hidden = !isActive;
        panel.querySelectorAll('a[data-nav-path]').forEach(function (link) {
          link.classList.toggle('is-active', isActive && isNavPathActive(link.dataset.navPath));
          if (isActive && isNavPathActive(link.dataset.navPath)) link.setAttribute('aria-current', 'page');
          else link.removeAttribute('aria-current');
        });
      });
    };
    navGroups.forEach(function (button) {
      button.addEventListener('mouseenter', function () { setNavGroup(button.dataset.navGroup); });
      button.addEventListener('focus', function () { setNavGroup(button.dataset.navGroup); });
    });
    setNavGroup(getNavGroupForPath(currentPath));
  }

  var themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    var setTheme = function (theme) {
      var isDark = theme === 'dark';
      document.documentElement.dataset.theme = isDark ? 'dark' : 'light';
      themeToggle.setAttribute('aria-pressed', String(isDark));
      themeToggle.setAttribute('aria-label', isDark ? '切换到浅色模式' : '切换到深色模式');
      themeToggle.title = isDark ? '切换到浅色模式' : '切换到深色模式';
      themeToggle.querySelector('span').textContent = isDark ? '☾' : '☼';
      themeToggle.querySelector('b').textContent = isDark ? '深色' : '浅色';
      var themeColor = document.querySelector('meta[name="theme-color"]');
      if (themeColor) themeColor.setAttribute('content', isDark ? '#211b35' : '#fbfaf4');
      document.dispatchEvent(new CustomEvent('halfold:theme-change', { detail: { theme: isDark ? 'dark' : 'light' } }));
    };
    setTheme(document.documentElement.dataset.theme || 'light');
    themeToggle.addEventListener('click', function () {
      var nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem('halfold-theme', nextTheme); } catch (error) {}
      setTheme(nextTheme);
    });
  }

  var searchTrigger = document.getElementById('search-trigger');
  var searchOverlay = document.getElementById('search-overlay');
  var globalSearchInput = document.getElementById('global-search-input');
  if (searchTrigger && searchOverlay && globalSearchInput) {
    var lastFocusedElement = null;
    var closeSearch = function () {
      searchOverlay.hidden = true;
      document.body.classList.remove('search-open');
      if (lastFocusedElement) lastFocusedElement.focus();
    };
    var openSearch = function () {
      lastFocusedElement = document.activeElement;
      searchOverlay.hidden = false;
      document.body.classList.add('search-open');
      requestAnimationFrame(function () { globalSearchInput.focus(); });
    };
    searchTrigger.addEventListener('click', openSearch);
    searchOverlay.querySelectorAll('[data-search-close]').forEach(function (closeButton) {
      closeButton.addEventListener('click', closeSearch);
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && !searchOverlay.hidden) closeSearch();
    });
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

  var lightboxItems = document.querySelectorAll('[data-lightbox]');
  if (lightboxItems.length) {
    var lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.setAttribute('role', 'dialog');
    lightbox.setAttribute('aria-modal', 'true');
    lightbox.setAttribute('aria-label', '图片预览');
    lightbox.innerHTML = '<button class="lightbox-close" type="button" aria-label="关闭图片预览">×</button><figure><img alt=""><figcaption></figcaption></figure>';
    document.body.appendChild(lightbox);
    var lightboxImage = lightbox.querySelector('img');
    var lightboxCaption = lightbox.querySelector('figcaption');
    var closeLightbox = function () {
      lightbox.classList.remove('is-open');
      document.body.classList.remove('lightbox-open');
    };
    lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', function (event) {
      if (event.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') closeLightbox();
    });
    lightboxItems.forEach(function (item) {
      item.addEventListener('click', function (event) {
        event.preventDefault();
        lightboxImage.src = item.getAttribute('href');
        lightboxImage.alt = item.querySelector('img').alt;
        lightboxCaption.textContent = item.getAttribute('data-lightbox') || '';
        lightbox.classList.add('is-open');
        document.body.classList.add('lightbox-open');
      });
    });
  }

  var comments = document.querySelector('[data-comments]');
  if (comments && comments.dataset.provider === 'giscus') {
    var requiredGiscusFields = ['repo', 'repoId', 'category', 'categoryId'];
    var giscusReady = requiredGiscusFields.every(function (field) { return comments.dataset[field]; });
    var commentMount = comments.querySelector('.comment-mount');
    if (giscusReady && commentMount) {
      commentMount.innerHTML = '';
      var giscusScript = document.createElement('script');
      giscusScript.src = 'https://giscus.app/client.js';
      giscusScript.async = true;
      giscusScript.crossOrigin = 'anonymous';
      giscusScript.setAttribute('data-repo', comments.dataset.repo);
      giscusScript.setAttribute('data-repo-id', comments.dataset.repoId);
      giscusScript.setAttribute('data-category', comments.dataset.category);
      giscusScript.setAttribute('data-category-id', comments.dataset.categoryId);
      giscusScript.setAttribute('data-mapping', comments.dataset.mapping || 'pathname');
      giscusScript.setAttribute('data-reactions-enabled', '1');
      giscusScript.setAttribute('data-emit-metadata', '0');
      giscusScript.setAttribute('data-input-position', 'top');
      giscusScript.setAttribute('data-theme', document.documentElement.dataset.theme === 'dark' ? 'dark_dimmed' : 'light');
      giscusScript.setAttribute('data-lang', comments.dataset.lang || 'zh-CN');
      commentMount.appendChild(giscusScript);
    }
    document.addEventListener('halfold:theme-change', function (event) {
      var frame = document.querySelector('iframe.giscus-frame');
      if (frame && frame.contentWindow) {
        frame.contentWindow.postMessage({ giscus: { setConfig: { theme: event.detail.theme === 'dark' ? 'dark_dimmed' : 'light' } } }, 'https://giscus.app');
      }
    });
  }

  var musicPlayer = document.querySelector('[data-music-player]');
  if (musicPlayer) {
    var audio = document.getElementById('music-audio');
    var trackRows = Array.from(musicPlayer.querySelectorAll('[data-track]'));
    var currentTitle = document.getElementById('music-current-title');
    var currentArtist = document.getElementById('music-current-artist');
    var selectTrack = function (row, shouldPlay) {
      trackRows.forEach(function (track) {
        track.classList.toggle('is-active', track === row);
        track.setAttribute('aria-pressed', String(track === row));
      });
      currentTitle.textContent = row.dataset.title;
      currentArtist.textContent = row.dataset.audio ? row.dataset.artist : row.dataset.artist + ' · 音频地址待接入';
      if (row.dataset.audio) {
        audio.src = row.dataset.audio;
        if (shouldPlay) audio.play().catch(function () {});
      }
    };
    trackRows.forEach(function (row) {
      row.addEventListener('click', function () { selectTrack(row, true); });
    });
    audio.addEventListener('ended', function () {
      var currentIndex = trackRows.indexOf(musicPlayer.querySelector('.track-row.is-active'));
      var next = trackRows[(currentIndex + 1) % trackRows.length];
      if (next) selectTrack(next, true);
    });
  }

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('/sw.js').then(function (registration) {
        if (registration.update) registration.update().catch(function () {});
      }).catch(function () {});
    });
  }
})();
