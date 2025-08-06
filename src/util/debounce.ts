/**
 * Creates debounced function.
 *
 * Delays invoking the provided function until the specified wait time has passed.
 *
 * @remarks
 * This also works in non-browser environments.
 *
 * @example Basic usage
 * ```ts
 * const debouncedFunc = debounce(() => {
 *   //...
 * }, 50);
 *
 * debouncedFunc(); // canceled.
 * debouncedFunc(); // executed.
 * await sleep(100);
 * debouncedFunc(); // canceled.
 * debouncedFunc(); // executed.
 * ```
 *
 * @param func - The function to debounce.
 * @param ms - The number of milliseconds to wait.
 *
 * @returns Debounced function.
 */
export function debounce<T extends Array<unknown>>(
  func: (...args: T) => unknown,
  ms: number,
): (...args: T) => void {
  let isRunning = false;
  let timeoutId: ReturnType<typeof setTimeout> | undefined = undefined;

  return (...args: T) => {
    if (isRunning) {
      return;
    }

    clearTimeout(timeoutId);

    timeoutId = setTimeout(() => {
      isRunning = true;

      Promise.resolve().then(() => {
        return func(...args);
      }).catch((exception) => {
        console.error(exception);
      }).finally(() => {
        isRunning = false;
      });
    }, ms);
  };
}
