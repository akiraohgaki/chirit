import dom from './dom.ts';

/**
 * Tagged template literal for CSS.
 *
 * Creates a CSSStyleSheet from a template string.
 *
 * ----
 *
 * @example Basic usage
 * ```ts
 * const display = 'inline-block';
 *
 * const sheet = css`span { diaplay: ${display}; }`;
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
