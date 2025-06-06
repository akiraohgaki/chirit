/**
 * Creates throttled function.
 *
 * Only invokes the provided function at most once per every wait time.
 *
 * This function also work in non-browser environment.
 *
 * ----
 *
 * @example Basic usage
 * ```ts
 * const throttledFunc = throttle(() => {
 *   //...
 * }, 50);
 *
 * throttledFunc(); // Executed
 * throttledFunc(); // Canceled
 * await sleep(100);
 * throttledFunc(); // Executed
 * throttledFunc(); // Canceled
 * ```
 *
 * @param func - The function to throttle.
 * @param ms - The number of milliseconds to wait.
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
