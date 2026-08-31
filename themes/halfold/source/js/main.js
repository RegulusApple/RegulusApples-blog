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
    document.querySelectorAll('[data-post-path] [data-unread-label]').forEach(function (label) {
      var row = label.closest('[data-post-path]');
      label.hidden = !row || readPosts.indexOf(row.dataset.postPath) !== -1;
    });
  };
  syncUnreadLabels();
  document.querySelectorAll('[data-post-path]').forEach(function (row) {
    var links = row.matches('a[href]') ? [row].concat(Array.from(row.querySelectorAll('a[href]'))) : Array.from(row.querySelectorAll('a[href]'));
    links.forEach(function (link) {
      link.addEventListener('click', function () {
        markPostRead(row.dataset.postPath);
        syncUnreadLabels();
      });
    });
  });
  var currentArticle = document.querySelector('.article-page[data-post-path]');
  if (currentArticle) markPostRead(currentArticle.dataset.postPath);
  window.addEventListener('pageshow', syncUnreadLabels);

  var categoryFilters = Array.from(document.querySelectorAll('[data-category-filter]'));
  var homepagePostRows = Array.from(document.querySelectorAll('.category-strip ~ .post-list > .post-row[data-post-category]'));
  if (categoryFilters.length && homepagePostRows.length) {
    var categoryCount = document.querySelector('[data-category-count]');
    var categoryEmpty = document.querySelector('[data-category-empty]');
    var applyCategoryFilter = function (category) {
      var visibleIndex = 0;
      categoryFilters.forEach(function (filter) {
        var isActive = filter.dataset.categoryFilter === category;
        filter.classList.toggle('active', isActive);
        if (isActive) filter.setAttribute('aria-current', 'page');
        else filter.removeAttribute('aria-current');
      });
      homepagePostRows.forEach(function (row) {
        var isVisible = category === 'all' || row.dataset.postCategory === category;
        row.hidden = !isVisible;
        if (isVisible) {
          visibleIndex += 1;
          var number = row.querySelector('.post-number');
          if (number) number.textContent = String(visibleIndex).padStart(2, '0');
        }
      });
      if (categoryCount) categoryCount.textContent = visibleIndex + ' 篇文章';
      if (categoryEmpty) categoryEmpty.hidden = visibleIndex !== 0;
      syncUnreadLabels();
    };
    categoryFilters.forEach(function (filter) {
      filter.addEventListener('click', function (event) {
        event.preventDefault();
        applyCategoryFilter(filter.dataset.categoryFilter || 'all');
      });
    });
  }

  var miniMusicPlayer = document.querySelector('[data-mini-music-player]');
  if (miniMusicPlayer) {
    var miniAudio = miniMusicPlayer.querySelector('[data-mini-music-audio]');
    var miniData = miniMusicPlayer.querySelector('[data-mini-music-data]');
    var miniTracks = [];
    try { miniTracks = JSON.parse(miniData ? miniData.textContent || '[]' : '[]'); } catch (error) { miniTracks = []; }
    var miniPlay = miniMusicPlayer.querySelector('[data-mini-music-play]');
    var miniNext = miniMusicPlayer.querySelector('[data-mini-music-next]');
    var miniTitle = miniMusicPlayer.querySelector('[data-mini-music-title]');
    var miniArtist = miniMusicPlayer.querySelector('[data-mini-music-artist]');
    var miniState = miniMusicPlayer.querySelector('[data-mini-music-state]');
    var miniIndex = 0;
    var miniTrack = function () { return miniTracks[miniIndex] || {}; };
    var miniArtistText = function (track) {
      return [track.artist || 'RegulusApple · playlist', track.year].filter(Boolean).join(' · ');
    };
    var renderMiniTrack = function () {
      var track = miniTrack();
      var hasAudio = Boolean(track.audio);
      if (miniTitle) miniTitle.textContent = track.title || '选择一首歌';
      if (miniArtist) miniArtist.textContent = miniArtistText(track);
      if (miniState) miniState.textContent = hasAudio ? '可播放' : '待接入';
      if (miniPlay) {
        miniPlay.disabled = !hasAudio;
        miniPlay.querySelector('span').textContent = miniAudio && !miniAudio.paused ? 'Ⅱ' : '▶';
        miniPlay.setAttribute('aria-label', hasAudio ? (miniAudio && !miniAudio.paused ? '暂停当前歌曲' : '播放当前歌曲') : '音频待接入');
      }
      if (miniAudio) {
        if (hasAudio) {
          if (miniAudio.getAttribute('src') !== track.audio) {
            miniAudio.src = track.audio;
            miniAudio.load();
          }
        } else {
          miniAudio.removeAttribute('src');
          miniAudio.load();
        }
      }
    };
    var playMiniTrack = function () {
      var track = miniTrack();
      if (!track.audio || !miniAudio) return;
      if (miniAudio.paused) miniAudio.play().catch(function () {});
      else miniAudio.pause();
    };
    var nextMiniTrack = function () {
      if (!miniTracks.length) return;
      var wasPlaying = miniAudio && !miniAudio.paused;
      miniIndex = (miniIndex + 1) % miniTracks.length;
      renderMiniTrack();
      if (wasPlaying && miniTrack().audio && miniAudio) miniAudio.play().catch(function () {});
    };
    if (miniPlay) miniPlay.addEventListener('click', playMiniTrack);
    if (miniNext) miniNext.addEventListener('click', nextMiniTrack);
    if (miniAudio) {
      miniAudio.addEventListener('play', renderMiniTrack);
      miniAudio.addEventListener('pause', renderMiniTrack);
      miniAudio.addEventListener('ended', nextMiniTrack);
      miniAudio.addEventListener('error', function () {
        if (miniState) miniState.textContent = '音频不可用';
      });
    }
    renderMiniTrack();
  }

  var monthlyTrace = document.querySelector('[data-monthly-trace]');
  if (monthlyTrace) {
    var monthlyTraceDataNode = monthlyTrace.querySelector('[data-monthly-trace-data]');
    var monthlyTraceData = [];
    try { monthlyTraceData = JSON.parse(monthlyTraceDataNode ? monthlyTraceDataNode.textContent || '[]' : '[]'); } catch (error) { monthlyTraceData = []; }
    var monthlyTraceMonthView = monthlyTrace.querySelector('[data-monthly-month-view]');
    var monthlyTraceSummary = monthlyTrace.querySelector('[data-monthly-summary]');
    var monthlyTraceSummaryTitle = monthlyTrace.querySelector('[data-monthly-summary-title]');
    var monthlyTraceSummaryList = monthlyTrace.querySelector('[data-monthly-summary-list]');
    var monthlyTraceBack = monthlyTrace.querySelector('[data-monthly-back]');
    var monthlyTraceYear = monthlyTrace.querySelector('.home-widget-heading > span');
    var monthlyTraceButtons = Array.from(monthlyTrace.querySelectorAll('[data-monthly-month]'));
    var resetMonthlyTrace = function () {
      if (monthlyTraceMonthView) monthlyTraceMonthView.hidden = false;
      if (monthlyTraceSummary) monthlyTraceSummary.hidden = true;
      monthlyTrace.classList.remove('is-browsing');
      monthlyTraceButtons.forEach(function (button) { button.classList.remove('is-active'); });
    };
    var renderMonthlySummary = function (month) {
      var selectedMonth = monthlyTraceData.find(function (item) { return item.month === month && item.posts && item.posts.length; });
      if (!selectedMonth || !monthlyTraceSummaryList) return;
      monthlyTraceButtons.forEach(function (button) { button.classList.toggle('is-active', button.dataset.monthlyMonth === month); });
      if (monthlyTraceSummaryTitle) monthlyTraceSummaryTitle.textContent = month + ' / WEEK NOTES';
      monthlyTraceSummaryList.innerHTML = selectedMonth.posts.map(function (post) {
        return '<a class="monthly-trace-entry" href="' + escapeHtml(post.url) + '">' +
          '<time datetime="' + escapeHtml(post.isoDate) + '">' + escapeHtml(post.date) + '</time>' +
          '<span><strong>' + escapeHtml(post.title) + '</strong><small>' + escapeHtml(post.description) + '</small></span>' +
          '</a>';
      }).join('');
      if (monthlyTraceMonthView) monthlyTraceMonthView.hidden = true;
      if (monthlyTraceSummary) monthlyTraceSummary.hidden = false;
      monthlyTrace.classList.add('is-browsing');
    };
    monthlyTraceButtons.forEach(function (button) {
      button.addEventListener('click', function () { renderMonthlySummary(button.dataset.monthlyMonth); });
    });
    if (monthlyTraceBack) monthlyTraceBack.addEventListener('click', resetMonthlyTrace);
    monthlyTrace.addEventListener('mouseenter', function () { monthlyTrace.classList.add('is-hovered'); });
    monthlyTrace.addEventListener('mouseleave', function () {
      window.setTimeout(function () {
        if (monthlyTrace.matches(':hover')) return;
        monthlyTrace.classList.remove('is-hovered');
        resetMonthlyTrace();
      }, 120);
    });
    monthlyTrace.addEventListener('focusin', function () { monthlyTrace.classList.add('is-hovered'); });
    monthlyTrace.addEventListener('focusout', function (event) {
      if (event.relatedTarget && !monthlyTrace.contains(event.relatedTarget)) {
        monthlyTrace.classList.remove('is-hovered');
        resetMonthlyTrace();
      }
    });
    if (monthlyTraceYear) monthlyTraceYear.setAttribute('aria-label', '当前周小结年份');
  }

  var navGroups = Array.from(document.querySelectorAll('[data-nav-group]'));
  var subnavPanels = Array.from(document.querySelectorAll('[data-subnav-panel]'));
  if (navGroups.length && subnavPanels.length) {
    var sectionNavInner = document.querySelector('.section-nav-inner');
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
    var positionSubnav = function (button, panel) {
      if (!sectionNavInner || !button || !panel) return;
      var innerRect = sectionNavInner.getBoundingClientRect();
      var buttonRect = button.getBoundingClientRect();
      var panelRect = panel.getBoundingClientRect();
      var center = buttonRect.left + buttonRect.width / 2 - innerRect.left;
      var halfPanel = panelRect.width / 2;
      var minCenter = halfPanel + 8;
      var maxCenter = innerRect.width - halfPanel - 8;
      panel.style.setProperty('--subnav-center', Math.max(minCenter, Math.min(maxCenter, center)) + 'px');
    };
    var setNavGroup = function (groupKey, shouldShowPanel) {
      navGroups.forEach(function (button) {
        var isActive = button.dataset.navGroup === groupKey;
        button.classList.toggle('is-active', isActive && shouldShowPanel);
        button.setAttribute('aria-expanded', String(isActive && shouldShowPanel));
      });
      subnavPanels.forEach(function (panel) {
        var isActive = panel.dataset.subnavPanel === groupKey;
        panel.hidden = !(isActive && shouldShowPanel);
        panel.querySelectorAll('a[data-nav-path]').forEach(function (link) {
          link.classList.toggle('is-active', isActive && isNavPathActive(link.dataset.navPath));
          if (isActive && isNavPathActive(link.dataset.navPath)) link.setAttribute('aria-current', 'page');
          else link.removeAttribute('aria-current');
        });
        if (isActive && shouldShowPanel) {
          var button = navGroups.find(function (navButton) { return navButton.dataset.navGroup === groupKey; });
          positionSubnav(button, panel);
        }
      });
    };
    var hideTimer = null;
    var cancelHide = function () {
      if (hideTimer) window.clearTimeout(hideTimer);
      hideTimer = null;
    };
    var scheduleHide = function () {
      cancelHide();
      hideTimer = window.setTimeout(function () {
        setNavGroup(null, false);
      }, 140);
    };
    var showNavGroup = function (button) {
      cancelHide();
      setNavGroup(button.dataset.navGroup, true);
    };
    navGroups.forEach(function (button) {
      button.addEventListener('mouseenter', function () { showNavGroup(button); });
      button.addEventListener('mouseleave', scheduleHide);
      button.addEventListener('focus', function () { showNavGroup(button); });
    });
    subnavPanels.forEach(function (panel) {
      panel.addEventListener('mouseenter', cancelHide);
      panel.addEventListener('mouseleave', scheduleHide);
    });
    setNavGroup(getNavGroupForPath(currentPath), false);
    window.addEventListener('resize', function () {
      var visiblePanel = subnavPanels.find(function (panel) { return !panel.hidden; });
      if (!visiblePanel) return;
      var button = navGroups.find(function (navButton) { return navButton.dataset.navGroup === visiblePanel.dataset.subnavPanel; });
      positionSubnav(button, visiblePanel);
    });
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
  var contentsWidget = toc ? toc.closest('.home-widget-contents') : null;

  if (articleBody && toc) {
    var headings = articleBody.querySelectorAll('h2, h3, h4, h5, h6');
    if (headings.length) {
      toc.innerHTML = '';
      var tocEntries = [];
      var parentStack = [];
      var hoveredEntry = null;
      var hoverClearTimer = null;
      var moduleHovered = false;
      headings.forEach(function (heading, index) {
        var id = heading.id || 'section-' + (index + 1);
        heading.id = id;
        var link = document.createElement('a');
        link.href = '#' + id;
        var level = Number(heading.tagName.substring(1));
        while (parentStack.length && parentStack[parentStack.length - 1].level >= level) parentStack.pop();
        var parent = parentStack.length ? parentStack[parentStack.length - 1] : null;
        var entry = { heading: heading, link: link, level: level, parent: parent, children: [] };
        if (parent) parent.children.push(entry);
        parentStack.push(entry);
        link.className = 'toc-entry toc-level-' + level + (parent ? ' toc-subitem' : ' toc-root');
        link.textContent = heading.textContent;
        toc.appendChild(link);
        tocEntries.push(entry);
      });

      var updateTocState = function () {
        var topOffset = 122;
        var viewportBottom = window.innerHeight;
        var visibleEntries = tocEntries.filter(function (entry) {
          var rect = entry.heading.getBoundingClientRect();
          return rect.bottom > topOffset && rect.top < viewportBottom;
        });
        var passedEntries = tocEntries.filter(function (entry) {
          return entry.heading.getBoundingClientRect().top <= topOffset + 24;
        });
        var currentEntry = passedEntries[passedEntries.length - 1] || visibleEntries[0] || null;
        var activeEntry = hoveredEntry || currentEntry;
        var activePath = [];
        var pathEntry = activeEntry;
        while (pathEntry) {
          activePath.push(pathEntry);
          pathEntry = pathEntry.parent;
        }

        tocEntries.forEach(function (entry) {
          var isRevealed = !entry.parent || activePath.indexOf(entry.parent) !== -1;
          var isVisible = visibleEntries.indexOf(entry) !== -1;
          var isModuleClear = moduleHovered && isRevealed;
          entry.link.classList.toggle('is-revealed', isRevealed);
          entry.link.classList.toggle('is-visible', isVisible);
          entry.link.classList.toggle('is-module-clear', isModuleClear);
          entry.link.classList.toggle('is-current', entry === activeEntry);
          entry.link.classList.toggle('is-hovered', entry === hoveredEntry);
        });
      };

      updateTocState();
      if (contentsWidget) {
        contentsWidget.addEventListener('mouseenter', function () {
          moduleHovered = true;
          updateTocState();
        });
        contentsWidget.addEventListener('mouseleave', function () {
          moduleHovered = false;
          hoveredEntry = null;
          if (hoverClearTimer) window.clearTimeout(hoverClearTimer);
          updateTocState();
        });
      }
      tocEntries.forEach(function (entry) {
        entry.link.addEventListener('mouseenter', function () {
          if (hoverClearTimer) window.clearTimeout(hoverClearTimer);
          hoveredEntry = entry;
          updateTocState();
        });
        entry.link.addEventListener('mouseleave', function () {
          if (hoveredEntry !== entry) return;
          hoverClearTimer = window.setTimeout(function () {
            if (hoveredEntry === entry) {
              hoveredEntry = null;
              updateTocState();
            }
          }, 180);
        });
        entry.link.addEventListener('focus', function () {
          if (hoverClearTimer) window.clearTimeout(hoverClearTimer);
          hoveredEntry = entry;
          updateTocState();
        });
        entry.link.addEventListener('blur', function () {
          if (hoveredEntry !== entry) return;
          hoveredEntry = null;
          updateTocState();
        });
      });
      window.addEventListener('scroll', updateTocState, { passive: true });
      window.addEventListener('resize', updateTocState);
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
      if (/^\/\//.test(url)) url = url.slice(1);
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
        var entryUrl = String(entry.url || '').replace(/^\/+/, '/');
        var typeLabel = entryUrl.indexOf('/weekly/') === 0 ? '周小结' : '文章';
        return '<article class="search-result"><p class="post-meta"><span>' + date + '</span><span>' + typeLabel + '</span></p><h2><a href="' + escapeHtml(safeUrl(entry.url)) + '">' + title + '</a></h2><p>' + description + '</p></article>';
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
