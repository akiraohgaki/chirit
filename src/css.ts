import dom from './dom.ts';

/**
 * Creates a CSSStyleSheet from a template literals.
 *
 * This function is a tagged template function for CSS.
 *
 * ----
 *
 * @example Basic usage
 * ```ts
 * const color = 'red';
 *
 * const sheet = css`span { color: ${color}; }`;
 *
 * document.adoptedStyleSheets = [sheet];
 * ```
 *
 * @param strings - The string parts of the template literal.
 * @param values - The interpolated values of the template literal.
 */
export default function css(strings: Array<string>, ...values: Array<unknown>): CSSStyleSheet {
  const content = strings.reduce((acc, str, i) => {
    return acc + str + (i < values.length ? values[i] : '');
  }, '');

  const sheet = new dom.globalThis.CSSStyleSheet();
  sheet.replaceSync(content);

  return sheet;
}
