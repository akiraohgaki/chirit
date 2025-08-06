/**
 * Pauses execution for a given duration.
 *
 * @remarks
 * This also works in non-browser environments.
 *
 * @example Basic usage
 * ```ts
 * await sleep(100);
 * console.log('100ms has passed');
 * ```
 *
 * @param ms - The number of milliseconds to wait.
 */
export async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
