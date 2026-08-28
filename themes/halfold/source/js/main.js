(function () {
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
        link.innerHTML = '<span>' + String(index + 1).padStart(2, '0') + '</span>' + heading.textContent;
        toc.appendChild(link);
      });
    }
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
})();
