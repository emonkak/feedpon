const HTNL_ENTITY_PATTERN = /&(#(?:x[0-9A-F]+|\d+)|[0-9A-Z]+)/i;

export function decodeHTMLEntities(htmlContent: string): string {
  if (!HTNL_ENTITY_PATTERN.test(htmlContent)) {
    return htmlContent;
  }
  const template = document.createElement('template');
  template.innerHTML = htmlContent;
  return template.content.textContent;
}
