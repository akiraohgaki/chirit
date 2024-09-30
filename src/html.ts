import dom from './dom.ts';

/**
 * Tagged template literal for HTML.
 *
 * Creates a DocumentFragment from a template string.
 *
 * ----
 *
 * @example Basic usage
 * ```ts
 * const message = 'Hello';
 *
 * const fragment = html`<p>${message}</p>`;
 *
 * document.body.appendChild(fragment);
 * ```
 *
 * @param strings - The string parts of the template literal.
 * @param values - The interpolated values of the template literal.
 */
export default function html(strings: Array<string>, ...values: Array<unknown>): DocumentFragment {
  const content = strings.reduce((acc, str, i) => {
    return acc + str + (i < values.length ? values[i] : '');
  }, '');

  // !DOCTYPE, HTML, HEAD, BODY will stripped inside HTMLTemplateElement.
  const template = dom.globalThis.document.createElement('template');
  template.innerHTML = content;

  return template.content;
}
