import { dom } from './dom.ts';

/**
 * Creates a DocumentFragment from a template literals.
 *
 * This function is a tagged template function for HTML.
 *
 * ----
 *
 * @example Basic usage
 * ```ts
 * const message = 'Hello';
 *
 * const fragment = html`<span>${message}</span>`;
 *
 * document.body.appendChild(fragment);
 * ```
 *
 * @param strings - The string parts of the template literal.
 * @param values - The interpolated values of the template literal.
 */
export function html(strings: TemplateStringsArray, ...values: Array<unknown>): DocumentFragment {
  const content = strings.reduce((acc, str, i) => {
    return acc + str + (i < values.length ? values[i] : '');
  }, '');

  // !DOCTYPE, HTML, HEAD, BODY will stripped inside HTMLTemplateElement.
  const template = dom.globalThis.document.createElement('template');
  template.innerHTML = content;

  return template.content;
}
