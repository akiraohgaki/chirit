/**
 * Pauses the execution for a specified amount of time.
 *
 * This function also work in non-browser environment.
 *
 * ----
 *
 * @example Basic usage
 * ```ts
 * await sleep(100);
 * console.log('Executed after 100ms');
 * ```
 *
 * @param ms - The number of milliseconds to wait.
 */
export default function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
