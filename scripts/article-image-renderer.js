'use strict';

function getStandaloneCaptionedImage(tokens, index) {
  const paragraph = tokens[index];
  const inline = tokens[index + 1];
  const close = tokens[index + 2];

  if (!paragraph || paragraph.type !== 'paragraph_open' || paragraph.nesting !== 1) return null;
  if (!inline || inline.type !== 'inline' || !close || close.type !== 'paragraph_close') return null;

  const children = inline.children || [];
  if (children.length !== 1 || children[0].type !== 'image') return null;

  const caption = children[0].attrGet('title');
  if (!caption || !caption.trim()) return null;

  return children[0];
}

hexo.extend.filter.register('markdown-it:renderer', function registerArticleImageRenderer(md) {
  if (md.__articleImageRendererInstalled) return;
  md.__articleImageRendererInstalled = true;

  const defaultImage = md.renderer.rules.image;
  const defaultParagraphOpen = md.renderer.rules.paragraph_open;
  const defaultParagraphClose = md.renderer.rules.paragraph_close;
  const renderDefaultToken = function renderDefaultToken(tokens, index, options, env, self) {
    return self.renderToken(tokens, index, options);
  };

  md.renderer.rules.paragraph_open = function renderParagraphOpen(tokens, index, options, env, self) {
    const imageToken = getStandaloneCaptionedImage(tokens, index);

    if (!imageToken) {
      return (defaultParagraphOpen || renderDefaultToken).call(this, tokens, index, options, env, self);
    }

    tokens[index].meta = tokens[index].meta || {};
    tokens[index].meta.articleImageFigure = true;
    imageToken.meta = imageToken.meta || {};
    imageToken.meta.articleImageCaption = imageToken.attrGet('title');

    return '<figure class="article-image">\n';
  };

  md.renderer.rules.paragraph_close = function renderParagraphClose(tokens, index, options, env, self) {
    const paragraph = tokens[index - 2];

    if (paragraph && paragraph.meta && paragraph.meta.articleImageFigure) {
      return '</figure>\n';
    }

    return (defaultParagraphClose || renderDefaultToken).call(this, tokens, index, options, env, self);
  };

  md.renderer.rules.image = function renderArticleImage(tokens, index, options, env, self) {
    const image = (defaultImage || renderDefaultToken).call(this, tokens, index, options, env, self);
    const caption = tokens[index].meta && tokens[index].meta.articleImageCaption;

    if (!caption) return image;

    return `${image}<figcaption>${md.utils.escapeHtml(caption)}</figcaption>\n`;
  };
});
