/**
 * Creates a throttled function.
 *
 * It executes the provided function at most once every wait time.
 *
 * This also works in non-browser environments.
 *
 * @example Basic usage
 * ```ts
 * const throttledFunc = throttle(() => {
 *   //...
 * }, 50);
 *
 * throttledFunc(); // executed.
 * throttledFunc(); // canceled.
 * await sleep(100);
 * throttledFunc(); // executed.
 * throttledFunc(); // canceled.
 * ```
 *
 * @param func - The function to be throttled.
 * @param ms - The number of milliseconds to wait.
 *
 * @returns Throttled function.
 */
export function throttle<T extends Array<unknown>>(
  func: (...args: T) => unknown,
  ms: number,
): (...args: T) => void {
  let isRunning = false;
  let timeoutId: ReturnType<typeof setTimeout> | undefined = undefined;

  return (...args: T) => {
    if (isRunning || timeoutId !== undefined) {
      return;
    }

    timeoutId = setTimeout(() => {
      timeoutId = undefined;
    }, ms);

    isRunning = true;

    Promise.resolve().then(() => {
      return func(...args);
    }).catch((exception) => {
      console.error(exception);
    }).finally(() => {
      isRunning = false;
    });
  };
}
