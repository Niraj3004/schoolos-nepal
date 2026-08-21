import sanitizeHtml from 'sanitize-html';

export const sanitizeRichText = (html: string): string => {
  return sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2', 'u', 's']),
    allowedAttributes: {
      '*': ['style', 'class'],
      'a': ['href', 'name', 'target'],
      'img': ['src', 'srcset', 'alt', 'title', 'width', 'height', 'loading']
    },
    allowedStyles: {
      '*': {
        'color': [/^#(0x)?[0-9a-f]+$/i, /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/],
        'text-align': [/^left$/, /^right$/, /^center$/],
        'font-size': [/^\d+(?:px|em|%)$/]
      }
    }
  });
};
